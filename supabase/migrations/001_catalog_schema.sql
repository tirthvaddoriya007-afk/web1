-- =============================================================================
-- homeshopedeals — migration 001: catalog (products, reviews, product details)
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent). Run AFTER supabase/schema.sql.
--
-- What this adds:
--   public.products   — the storefront catalogue
--   public.reviews    — shared reviews shown on every product page
--   storage bucket "product-images" — public bucket for admin-uploaded images
--   public.set_product_position() — reorders products (shift-down semantics)
--
-- Product detail fields (Product Highlights + Additional Information) are
-- part of the products table: fabric, color, pattern, fit_shape,
-- additional_info (jsonb key–value rows).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PRODUCTS
--    `hash` is the URL slug (/product/<hash>). `image` is kept equal to the
--    first entry of `images` (1–3 image URLs). `order_number` is the position
--    in the home feed (1,2 are the top row; 3,4 the next; …).
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id           bigint generated always as identity primary key,
  hash         text not null unique,
  name         text not null,
  price        numeric not null default 0,
  mrp          numeric not null default 0,
  off          text not null default '',
  image        text not null default '',
  images       jsonb not null default '[]',
  badge        text not null default '',
  categories   text[] not null default '{}',
  category     text not null default '',
  order_number int not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Product Highlights (admin-entered at upload time).
  fabric       text not null default '',
  color        text not null default '',
  pattern      text not null default '',
  fit_shape    text not null default '',
  -- "Additional Information" dropdown — admin-entered key–value rows.
  additional_info jsonb not null default '[]',
  -- Deferrable so set_product_position() can rewrite a whole run of numbers
  -- inside one UPDATE without hitting the unique constraint mid-statement.
  constraint products_order_number_key unique (order_number) deferrable initially deferred
);

-- Re-running on a database where the products table already existed (before
-- the detail columns were added) — add them without touching existing rows.
alter table public.products add column if not exists fabric          text  not null default '';
alter table public.products add column if not exists color           text  not null default '';
alter table public.products add column if not exists pattern         text  not null default '';
alter table public.products add column if not exists fit_shape       text  not null default '';
alter table public.products add column if not exists additional_info jsonb not null default '[]';

create index if not exists products_order_number_idx on public.products (order_number);
create index if not exists products_category_idx     on public.products (category);
create index if not exists products_hash_idx         on public.products (hash);

-- Keep updated_at fresh on every edit.
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. REVIEWS — one shared set of reviews; every product page shows the same
--    reviews, each rendered with that product's own image.
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id         bigint generated always as identity primary key,
  name       text not null,
  rating     int not null check (rating between 1 and 5),
  comment    text not null,
  created_at timestamptz not null default now()
);

create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.reviews  enable row level security;

-- Anyone on the storefront may read the catalogue and reviews.
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (true);

drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews
  for select using (true);

-- Only allowlisted admins may write.
drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products
  for delete to authenticated using (public.is_admin());

drop policy if exists reviews_admin_insert on public.reviews;
create policy reviews_admin_insert on public.reviews
  for insert to authenticated with check (public.is_admin());

drop policy if exists reviews_admin_update on public.reviews;
create policy reviews_admin_update on public.reviews
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. REORDER — move a product to a given position. Everything between its old
--    and new position shifts by one (shift-down/insert semantics), so the
--    numbers always stay a clean 1..N with no gaps.
-- ---------------------------------------------------------------------------
create or replace function public.set_product_position(p_hash text, p_pos int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_old   int;
begin
  if not public.is_admin() then
    raise exception 'Only admins can reorder products';
  end if;

  select count(*) into v_count from public.products;
  if v_count = 0 then return; end if;
  p_pos := greatest(1, least(coalesce(p_pos, 1), v_count));

  select order_number into v_old from public.products where hash = p_hash;
  if v_old is null then
    raise exception 'Product not found';
  end if;
  if v_old = p_pos then return; end if;

  if v_old < p_pos then
    update public.products
       set order_number = order_number - 1
     where order_number > v_old and order_number <= p_pos;
  else
    update public.products
       set order_number = order_number + 1
     where order_number >= p_pos and order_number < v_old;
  end if;

  update public.products set order_number = p_pos where hash = p_hash;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. STORAGE — public bucket for admin-uploaded images (product photos).
--    Created here so no dashboard step is needed.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone may view the images; only admins may upload/change/remove them.
drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
