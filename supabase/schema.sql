-- =============================================================================
-- homeshopedeals — Supabase schema (baseline)
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent).
--
-- Two tables:
--   admins   — allowlist of auth users permitted to use the admin panel
--   settings — one row holding the site-wide UPI payment details
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ADMINS
--    Existing in auth.users is NOT enough — the user's id must also be here.
--    There is no signup flow, so rows are added by hand.
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
  updated_at     timestamptz not null default now()
);

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
