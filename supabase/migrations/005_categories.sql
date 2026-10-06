-- =============================================================================
-- homeshopedeals — migration 005: admin-editable categories
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent).
--
-- What this adds:
--   public.categories — the storefront category list (was static JSON)
--   Seeded with the exact 11 categories from data/categories.json, so the
--   storefront looks identical the moment the table exists.
--   Admin CRUD lives at /admin/categories (RLS: public read, admin write).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. CATEGORIES
--    `slug` is the URL segment (/category/<slug>). `orig_slug` is kept so old
--    links (e.g. /category/grocery-) still resolve. `name` is what products
--    store in their `category` column and what the storefront displays.
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id         bigint generated always as identity primary key,
  slug       text not null unique,
  orig_slug  text not null default '',
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_slug_idx on public.categories (slug);

-- Keep updated_at fresh on every edit.
drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. SEED — the current static list (data/categories.json).
-- ---------------------------------------------------------------------------
insert into public.categories (slug, orig_slug, name) values
  ('grocery',               'grocery-',               'Grocery'),
  ('mobiles',               'mobiles',                'Mobiles'),
  ('home-and-kitchen',      'home-and-kitchen',       'Home and Kitchen'),
  ('tv-appliances',         'tv--appliances-',        'TV & Appliances'),
  ('smart-gadget',          'smart-gadget',           'Smart Gadget'),
  ('electronics-accesories','electronics--accesories','Electronics & Accesories'),
  ('aristocrat',            'aristocrat-',            'Aristocrat'),
  ('women-fashion',         'women-fashion',          'Women Fashion'),
  ('men-fashion',           'men-fashion',            'Men Fashion'),
  ('footware',              'footware',               'Footware'),
  ('beauty-toys-sports',    'beauty-toys--sports',    'Beauty, Toys & Sports')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;

-- Anyone on the storefront may read the category list.
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select using (true);

-- Only allowlisted admins may write.
drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete on public.categories
  for delete to authenticated using (public.is_admin());
