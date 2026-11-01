-- Allow orders awaiting manual verification of a full UPI payment.
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
