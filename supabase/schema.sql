-- =============================================================================
-- homeshopedeals — Supabase schema
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent).
--
-- Three tables:
--   admins     — allowlist of auth users permitted to use the admin panel
--   settings   — one row holding the site-wide UPI payment details
--   page_views — one row per storefront page view (analytics)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ADMINS
--    Existing in auth.users is NOT enough — the user's id must also be here.
--    There is no signup flow, so rows are added by hand (see step 3 below).
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null default 'admin',   -- 'admin' | 'superadmin'
  created_at timestamptz not null default now()
);

-- Helper used by the policies below. SECURITY DEFINER so it can read
-- public.admins without the caller needing a policy on that table.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 2. SETTINGS — singleton row (id is pinned to 1 by the check constraint).
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id             int primary key default 1 check (id = 1),
  upi_vpa        text not null default '',
  upi_payee_name text not null default '',
  upi_merchant_code text not null default '',
  meta_pixel_id  text not null default '',
  updated_at     timestamptz not null default now()
);

-- Existing databases (created before meta_pixel_id) get the column added here.
-- Idempotent, so it is safe to run on a fresh database too.
alter table public.settings add column if not exists meta_pixel_id text not null default '';

-- Seed the single row so the admin screen always has something to update.
insert into public.settings (id) values (1) on conflict (id) do nothing;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.admins   enable row level security;
alter table public.settings enable row level security;

-- admins: an admin may see the admin list. Nobody can self-insert.
drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins
  for select using (public.is_admin());

-- settings: the storefront reads the UPI details, only admins may change them.
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings
  for select using (true);

drop policy if exists settings_admin_update on public.settings;
create policy settings_admin_update on public.settings
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. PAGE VIEWS — anonymous storefront traffic analytics.
--    One row per page view, written by /api/track. `visitor_id` is a random
--    UUID stored in the visitor's browser cookie, so unique visitors can be
--    counted without storing anything personal. Days are grouped in India
--    time (Asia/Kolkata) because that is where the storefront operates.
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id           bigint generated always as identity primary key,
  visitor_id   uuid not null,
  path         text not null,
  referrer     text not null default '',   -- domain only, '' = direct
  utm_source   text not null default '',
  utm_medium   text not null default '',
  utm_campaign text not null default '',
  client       text not null default '',   -- browser name, or in-app browser e.g. 'Facebook'
  device       text not null default '',   -- 'mobile' | 'desktop' | 'tablet'
  created_at   timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_visitor_idx   on public.page_views (visitor_id);
create index if not exists page_views_path_idx      on public.page_views (path);

-- RLS: anyone on the storefront may record a page view; only admins may read.
alter table public.page_views enable row level security;

drop policy if exists page_views_insert on public.page_views;
create policy page_views_insert on public.page_views
  for insert to anon, authenticated with check (true);

drop policy if exists page_views_select on public.page_views;
create policy page_views_select on public.page_views
  for select using (public.is_admin());

-- One call returns everything the analytics dashboard needs: totals, today's
-- numbers, live visitors (last 5 minutes), a per-day series, top pages,
-- top referrers, top UTM sources, client/device breakdown and recent activity.
create or replace function public.page_views_stats(days int)
returns jsonb
language sql
stable
set search_path = public
as $$
  with range_rows as (
    select * from public.page_views
    where created_at >= now() - make_interval(days => least(greatest(days, 1), 90))
  ),
  today_rows as (
    select * from range_rows
    where created_at >= (date_trunc('day', now() at time zone 'Asia/Kolkata')
                         at time zone 'Asia/Kolkata')
  ),
  daily as (
    select to_char(created_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as day,
           count(*) as views,
           count(distinct visitor_id) as visitors
    from range_rows group by 1 order by 1
  ),
  top_pages as (
    select path, count(*) as views
    from range_rows group by path order by views desc limit 8
  ),
  top_referrers as (
    select nullif(referrer, '') as referrer, count(*) as views
    from range_rows group by 1 order by views desc, referrer limit 10
  ),
  top_sources as (
    select nullif(utm_source, '') as source, count(*) as views
    from range_rows group by 1 order by views desc, source limit 10
  ),
  clients as (
    select nullif(client, '') as client, count(*) as views
    from range_rows group by 1 order by views desc
  ),
  devices as (
    select nullif(device, '') as device, count(*) as views
    from range_rows group by 1 order by views desc
  ),
  recent as (
    select path, referrer, client, device, created_at
    from public.page_views order by created_at desc limit 20
  )
  select jsonb_build_object(
    'days', days,
    'totals', jsonb_build_object(
      'views',    (select count(*) from range_rows),
      'visitors', (select count(distinct visitor_id) from range_rows)
    ),
    'today', jsonb_build_object(
      'views',    (select count(*) from today_rows),
      'visitors', (select count(distinct visitor_id) from today_rows)
    ),
    'live', jsonb_build_object(
      'visitors', (select count(distinct visitor_id) from public.page_views
                   where created_at >= now() - interval '5 minutes')
    ),
    'series', (select coalesce(jsonb_agg(jsonb_build_object(
                'day', day, 'views', views, 'visitors', visitors)), '[]'::jsonb)
               from daily),
    'top_pages', (select coalesce(jsonb_agg(jsonb_build_object(
                  'path', path, 'views', views)), '[]'::jsonb) from top_pages),
    'top_referrers', (select coalesce(jsonb_agg(jsonb_build_object(
                      'referrer', referrer, 'views', views)), '[]'::jsonb)
                      from top_referrers),
    'top_sources', (select coalesce(jsonb_agg(jsonb_build_object(
                    'source', source, 'views', views)), '[]'::jsonb)
                    from top_sources),
    'clients', (select coalesce(jsonb_agg(jsonb_build_object(
                'client', client, 'views', views)), '[]'::jsonb) from clients),
    'devices', (select coalesce(jsonb_agg(jsonb_build_object(
                'device', device, 'views', views)), '[]'::jsonb) from devices),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object(
               'path', path, 'referrer', referrer, 'client', client,
               'device', device, 'created_at', created_at)), '[]'::jsonb)
               from recent)
  );
$$;
