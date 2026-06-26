-- ============================================================
-- BE AN EXAMPLE — Products schema + storage + seed data
-- Run this once in your Supabase SQL Editor.
-- ============================================================

-- 1. Products table -------------------------------------------------
create table if not exists public.products (
  id           text primary key,
  name         text not null,
  price        numeric(10,2) not null check (price >= 0),
  image        text not null,
  images       text[] not null default '{}',
  archive_image text,
  archive_hover_image text,
  category     text not null,
  sizes        text[] not null default '{}',
  colors       jsonb not null default '[]'::jsonb,
  size_chart   jsonb not null default '[]'::jsonb,
  description  text not null default '',
  materials_care text not null default '',
  seo_title    text not null default '',
  seo_description text not null default '',
  rating       numeric(2,1) not null default 5.0,
  reviews      integer not null default 0,
  stock        integer not null default 0,
  published    boolean not null default true,
  scheduled_at date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.products
  add column if not exists materials_care text not null default '';
alter table public.products
  add column if not exists seo_title text not null default '';
alter table public.products
  add column if not exists seo_description text not null default '';

create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);
create index if not exists products_scheduled_at_idx on public.products(scheduled_at);

-- auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- 2. Row Level Security --------------------------------------------
alter table public.products enable row level security;

drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select using (true);

-- NOTE: until role-based auth is wired in block #1 of the launch plan,
-- writes are restricted to authenticated users. Lock this down further
-- with `has_role(auth.uid(),'admin')` once user_roles exists.
drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Authenticated users can insert products"
  on public.products for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
  on public.products for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products"
  on public.products for delete to authenticated using (true);

-- 3. Storage bucket for product images -----------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Authenticated update product images" on storage.objects;
create policy "Authenticated update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated delete product images" on storage.objects;
create policy "Authenticated delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images');

