alter table public.orders
  add column if not exists payment_provider text not null default 'upi'
    check (payment_provider in ('upi', 'paytm')),
  add column if not exists gateway_transaction_id text;
