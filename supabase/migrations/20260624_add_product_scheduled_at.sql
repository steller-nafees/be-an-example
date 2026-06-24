-- ============================================================
-- Product launch scheduling
-- Adds an optional launch date for products.
-- Safe to re-run.
-- ============================================================

alter table public.products
  add column if not exists scheduled_at date;

create index if not exists products_scheduled_at_idx
  on public.products(scheduled_at);
