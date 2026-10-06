-- =============================================================================
-- homeshopedeals — migration 006: analytics time ranges (Today / Yesterday /
-- 7 days / 30 days)
-- Paste this whole file into: Supabase Dashboard > SQL Editor > New query > Run
-- Safe to re-run (idempotent).
--
-- Adds a NEW overload page_views_stats(p_window text) — the existing
-- page_views_stats(days int) is left untouched so this migration is safe to
-- run before or after the app deploy.
--
-- Windows (all in Asia/Kolkata, matching the rest of the analytics):
--   'today'     — today 00:00 → now
--   'yesterday' — yesterday 00:00 → today 00:00
--   '7d'        — 6 days ago 00:00 → now (past 6 + today)
--   '30d'       — 29 days ago 00:00 → now (past 29 + today)
-- =============================================================================

create or replace function public.page_views_stats(p_window text)
returns jsonb
language sql
stable
set search_path = public
as $$
  with bounds as (
    select
      case p_window
        when 'today'     then date_trunc('day', now() at time zone 'Asia/Kolkata')
        when 'yesterday' then date_trunc('day', now() at time zone 'Asia/Kolkata') - interval '1 day'
        when '30d'       then date_trunc('day', now() at time zone 'Asia/Kolkata') - interval '29 days'
        else                  date_trunc('day', now() at time zone 'Asia/Kolkata') - interval '6 days'
      end as day_start,
      case p_window
        when 'today'     then date_trunc('day', now() at time zone 'Asia/Kolkata') + interval '1 day'
        when 'yesterday' then date_trunc('day', now() at time zone 'Asia/Kolkata')
        else now()
      end as day_end
  ),
  range_rows as (
    select pv.* from public.page_views pv, bounds b
    where pv.created_at >= (b.day_start at time zone 'Asia/Kolkata')
      and pv.created_at <  (b.day_end   at time zone 'Asia/Kolkata')
  ),
  today_rows as (
    select * from range_rows
    where created_at >= (date_trunc('day', now() at time zone 'Asia/Kolkata')
                         at time zone 'Asia/Kolkata')
  ),
  daily as (
    select to_char(created_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as day,
           count(*) as views,
           count(distinct visitor_id) as visitors
    from range_rows group by 1 order by 1
  ),
  top_pages as (
    select path, count(*) as views
    from range_rows group by path order by views desc limit 8
  ),
  top_referrers as (
    select nullif(referrer, '') as referrer, count(*) as views
    from range_rows group by 1 order by views desc, referrer limit 10
  ),
  top_sources as (
    select nullif(utm_source, '') as source, count(*) as views
    from range_rows group by 1 order by views desc, source limit 10
  ),
  clients as (
    select nullif(client, '') as client, count(*) as views
    from range_rows group by 1 order by views desc
  ),
  devices as (
    select nullif(device, '') as device, count(*) as views
    from range_rows group by 1 order by views desc
  ),
  recent as (
    select path, referrer, client, device, created_at
    from range_rows order by created_at desc limit 20
  )
  select jsonb_build_object(
    'window', p_window,
    'totals', jsonb_build_object(
      'views',    (select count(*) from range_rows),
      'visitors', (select count(distinct visitor_id) from range_rows)
    ),
    'today', jsonb_build_object(
      'views',    (select count(*) from today_rows),
      'visitors', (select count(distinct visitor_id) from today_rows)
    ),
    'live', jsonb_build_object(
      'visitors', (select count(distinct visitor_id) from public.page_views
                   where created_at >= now() - interval '5 minutes')
    ),
    'series', (select coalesce(jsonb_agg(jsonb_build_object(
                'day', day, 'views', views, 'visitors', visitors)), '[]'::jsonb)
               from daily),
    'top_pages', (select coalesce(jsonb_agg(jsonb_build_object(
                  'path', path, 'views', views)), '[]'::jsonb) from top_pages),
    'top_referrers', (select coalesce(jsonb_agg(jsonb_build_object(
                      'referrer', referrer, 'views', views)), '[]'::jsonb)
                      from top_referrers),
    'top_sources', (select coalesce(jsonb_agg(jsonb_build_object(
                    'source', source, 'views', views)), '[]'::jsonb)
                    from top_sources),
    'clients', (select coalesce(jsonb_agg(jsonb_build_object(
                'client', client, 'views', views)), '[]'::jsonb) from clients),
    'devices', (select coalesce(jsonb_agg(jsonb_build_object(
                'device', device, 'views', views)), '[]'::jsonb) from devices),
    'recent', (select coalesce(jsonb_agg(jsonb_build_object(
               'path', path, 'referrer', referrer, 'client', client,
               'device', device, 'created_at', created_at)), '[]'::jsonb)
               from recent)
  );
$$;
