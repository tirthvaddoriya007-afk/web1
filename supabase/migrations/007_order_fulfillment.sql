-- Add manual UPI-advance verification and fulfillment tracking to orders.
alter table public.orders
  add column if not exists advance_amount numeric(12, 2) not null default 0
    check (advance_amount >= 0),
  add column if not exists balance_due numeric(12, 2) not null default 0
    check (balance_due >= 0),
  add column if not exists payment_status text not null default 'Not required'
    check (payment_status in ('Not required', 'Pending', 'Verified')),
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists meta_measurement_consent boolean not null default false,
  add column if not exists meta_fbp text,
  add column if not exists meta_fbc text,
  add column if not exists meta_client_ip text,
  add column if not exists meta_user_agent text,
  add column if not exists purchase_event_sent_at timestamptz;

update public.orders
set balance_due = total
where balance_due = 0 and total > 0;

alter table public.orders add constraint orders_payment_balance_check
  check (advance_amount + balance_due = total);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'Awaiting advance',
    'Awaiting payment',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ));
