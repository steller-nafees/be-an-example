-- ============================================================
-- Product size charts for admin editing + product page display
-- Safe to re-run.
-- ============================================================

alter table public.products
  add column if not exists size_chart jsonb not null default '[]'::jsonb;
