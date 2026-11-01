-- Remove the non-customer reviews inserted by migration 003.
delete from public.reviews
where (name, comment) in (
  ('Priya Sharma', 'Same as shown, Mst hai, ❤️❤️'),
  ('Rohan Verma', 'Value for money, highly recommended.'),
  ('Sana Khan', 'Amazing quality and fast shipping!'),
  ('Ajay Patil', 'Nice packaging, delivered on time.'),
  ('Neha Gupta', 'Product quality is superb 👍'),
  ('Vikram Reddy', 'Exactly what I expected. Thank you!'),
  ('Isha Nair', 'Good product at this price range.'),
  ('Arjun Singh', 'Loved it, will order again.'),
  ('Pooja Jain', 'Could be better, but overall satisfied.'),
  ('Karan Das', 'The product is just okay, not great.')
);
