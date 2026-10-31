-- Run in Supabase SQL Editor after the existing baseline schema.
-- Store customer orders securely. Only the server uses the service-role key
-- to insert orders; browser clients cannot read or write this table.
create table if not exists public.orders (
  id text primary key check (id ~ '^OD[A-F0-9]{32}$'),
  customer_name text not null,
  customer_phone text not null,
  address jsonb not null check (jsonb_typeof(address) = 'object'),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  total numeric(12, 2) not null check (total >= 0),
  payment_mode text not null,
  status text not null default 'Confirmed'
    check (status in ('Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_placed_at_idx on public.orders (placed_at desc);
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);

alter table public.orders enable row level security;

drop policy if exists orders_admin_select on public.orders;
create policy orders_admin_select on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
