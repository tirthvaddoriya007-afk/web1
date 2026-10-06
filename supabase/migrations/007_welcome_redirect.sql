-- =============================================================================
-- homeshopedeals — migration 007: welcome landing auto-redirect + tap tracking
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent). Run after migration 006.
--
-- What this adds:
--   settings.welcome_redirect_seconds — seconds the visitor may stay on the
--       welcome landing before the auto-redirect to /home fires. 0 disables
--       the timer (tap-to-continue only). Default 1 second.
--   public.welcome_clicks — one row per tap anywhere on the welcome landing
--       (every tap on that page sends the visitor to /home). Feeds the
--       "Welcome page taps" card on the admin analytics screen.
--   public.welcome_clicks_stats() — total / today / recent taps for that card.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. SETTINGS — welcome auto-redirect timer
-- ---------------------------------------------------------------------------
alter table public.settings
  add column if not exists welcome_redirect_seconds int not null default 1;

-- ---------------------------------------------------------------------------
-- 2. WELCOME TAPS
-- ---------------------------------------------------------------------------
create table if not exists public.welcome_clicks (
  id         bigint generated always as identity primary key,
  visitor_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists welcome_clicks_created_at_idx
  on public.welcome_clicks (created_at desc);

-- RLS: anyone on the storefront may record a tap; only admins may read.
alter table public.welcome_clicks enable row level security;

drop policy if exists welcome_clicks_insert on public.welcome_clicks;
create policy welcome_clicks_insert on public.welcome_clicks
  for insert to anon, authenticated with check (true);

drop policy if exists welcome_clicks_select on public.welcome_clicks;
create policy welcome_clicks_select on public.welcome_clicks
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. STATS — everything the dashboard card needs in one call.
-- ---------------------------------------------------------------------------
create or replace function public.welcome_clicks_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  with today_rows as (
    select * from public.welcome_clicks
    where created_at >= (date_trunc('day', now() at time zone 'Asia/Kolkata')
                         at time zone 'Asia/Kolkata')
  ),
  recent as (
    select created_at
    from public.welcome_clicks order by created_at desc limit 10
  )
  select jsonb_build_object(
    'total', (select count(*) from public.welcome_clicks),
    'today', (select count(*) from today_rows),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object(
               'created_at', created_at)), '[]'::jsonb) from recent)
  );
$$;
