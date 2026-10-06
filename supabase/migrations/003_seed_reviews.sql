-- =============================================================================
-- homeshopedeals — migration 003: seed the shared reviews
-- Every product page shows these same reviews, each rendered with that
-- product's own image. Admins can add/edit/remove them at /admin/reviews.
-- Safe to re-run (idempotent — rows are matched by name + comment).
-- =============================================================================

insert into public.reviews (name, rating, comment, created_at)
select v.name, v.rating, v.comment, v.created_at
from (values
  ('Priya Sharma', 5, 'Same as shown, Mst hai, ❤️❤️', now() - interval '3 days'),
  ('Rohan Verma', 4, 'Value for money, highly recommended.', now() - interval '7 days'),
  ('Sana Khan', 5, 'Amazing quality and fast shipping!', now() - interval '12 days'),
  ('Ajay Patil', 4, 'Nice packaging, delivered on time.', now() - interval '18 days'),
  ('Neha Gupta', 5, 'Product quality is superb 👍', now() - interval '25 days'),
  ('Vikram Reddy', 4, 'Exactly what I expected. Thank you!', now() - interval '31 days'),
  ('Isha Nair', 4, 'Good product at this price range.', now() - interval '40 days'),
  ('Arjun Singh', 5, 'Loved it, will order again.', now() - interval '48 days'),
  ('Pooja Jain', 3, 'Could be better, but overall satisfied.', now() - interval '55 days'),
  ('Karan Das', 4, 'The product is just okay, not great.', now() - interval '63 days')
) as v(name, rating, comment, created_at)
where not exists (
  select 1 from public.reviews r
  where r.name = v.name and r.comment = v.comment
);
