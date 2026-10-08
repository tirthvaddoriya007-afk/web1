-- =============================================================================
-- homeshopedeals — migration 009: category seed + product detail fields
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent).
--
-- What this fixes/adds:
--   1. Fixes the "delete category" bug. The live `categories` table was empty,
--      so the admin screen fell back to the static JSON list whose rows have
--      no `id` — deleting one produced the PostgREST "failed to parse
--      undefined" syntax error. This re-seeds the 11 default categories (each
--      row gets a real id) and re-asserts the admin RLS policies, including
--      DELETE, so the Delete button works.
--   2. Adds product-detail columns used by the new storefront sections:
--      product highlights (fabric / color / pattern / fit-shape) and the
--      "Additional Information" dropdown (key–value rows as jsonb).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. SEED the default categories (same 11 as data/categories.json).
--    ON CONFLICT DO NOTHING: existing rows (or rows the admin already added)
--    are never touched; this only fills the table when it is empty.
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
-- 2. ROW LEVEL SECURITY — re-assert every policy (idempotent).
--    If migration 005's policies were never applied to this database, the
--    admin insert/update/delete silently fail with a permission error. This
--    makes sure all four exist.
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories
  for select using (true);

drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete on public.categories
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. PRODUCT DETAIL FIELDS — admin-editable, shown in the new storefront
--    "Product Highlights" grid and "Additional Information" dropdown.
-- ---------------------------------------------------------------------------
alter table public.products add column if not exists fabric          text  not null default '';
alter table public.products add column if not exists color           text  not null default '';
alter table public.products add column if not exists pattern         text  not null default '';
alter table public.products add column if not exists fit_shape       text  not null default '';
alter table public.products add column if not exists additional_info jsonb not null default '[]';
