-- =============================================================================
-- homeshopedeals — migration 008: decimal welcome timer + on/off switch
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent). Run after migration 007.
--
-- What this changes:
--   settings.welcome_redirect_seconds — widened from int to numeric(4,1) so the
--       admin can set fractional seconds (0.5, 1.5, 1.8, ...). 0 still means
--       "no auto-redirect, the visitor must tap".
--   settings.welcome_enabled — master switch for the welcome landing.
--       true  (default): the welcome page shows at / and auto-redirects.
--       false: / redirects straight to /home — the welcome page is skipped.
-- =============================================================================

-- Widen the timer so decimals are accepted. No-op when already numeric.
alter table public.settings
  alter column welcome_redirect_seconds type numeric(4,1)
  using welcome_redirect_seconds::numeric(4,1);

-- Master on/off switch for the welcome landing.
alter table public.settings
  add column if not exists welcome_enabled boolean not null default true;
