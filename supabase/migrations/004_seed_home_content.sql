-- =============================================================================
-- homeshopedeals — migration 004: seed the home content defaults
-- Pre-fills the settings row with the current banner + promo values so the
-- admin screens (/admin/home-content) show what is live today.
-- Safe to re-run (idempotent — only fills empty values).
-- =============================================================================

insert into public.settings (id) values (1) on conflict (id) do nothing;

update public.settings set
  banner1_url  = coalesce(nullif(banner1_url, ''), '/banners/top.gif'),
  banner1_link = coalesce(nullif(banner1_link, ''), '/category/grocery'),
  banner1_alt  = coalesce(nullif(banner1_alt, ''), 'Sale is live'),
  banner2_url  = coalesce(nullif(banner2_url, ''), '/banners/hero.webp'),
  banner2_link = coalesce(nullif(banner2_link, ''), '/category/grocery'),
  banner2_alt  = coalesce(nullif(banner2_alt, ''), 'Mega Sale'),
  promo_text   = coalesce(nullif(promo_text, ''), 'Buy 2 Get 1 Free (Add 3 item to cart)')
where id = 1;
