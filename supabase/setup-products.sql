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
  category     text not null,
  sizes        text[] not null default '{}',
  colors       jsonb not null default '[]'::jsonb,
  description  text not null default '',
  rating       numeric(2,1) not null default 5.0,
  reviews      integer not null default 0,
  stock        integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);

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

-- 4. Seed initial catalog ------------------------------------------
insert into public.products (id, name, price, image, images, category, sizes, colors, description, rating, reviews, stock) values
('1','Noir Essentials Hoodie',89,'/products/product-hoodie-1.jpg',array['/products/product-hoodie-1.jpg','/products/product-hoodie-2.jpg'],'hoodies',array['XS','S','M','L','XL'],'[{"name":"Black","value":"hsl(0,0%,0%)"},{"name":"Sand","value":"hsl(30,25%,80%)"}]'::jsonb,'Heavyweight 400gsm cotton fleece hoodie with a relaxed fit. Ribbed cuffs and hem. Embroidered logo on chest.',4.8,124,8),
('2','Statement Tee — Black',45,'/products/product-tshirt-1.jpg',array['/products/product-tshirt-1.jpg','/products/product-tshirt-2.jpg'],'tshirts',array['XS','S','M','L','XL','XXL'],'[{"name":"Black","value":"hsl(0,0%,0%)"},{"name":"White","value":"hsl(0,0%,100%)"}]'::jsonb,'Premium 220gsm combed cotton tee with a boxy silhouette. Screen-printed statement graphic.',4.6,89,23),
('3','Clean Slate Tee',45,'/products/product-tshirt-2.jpg',array['/products/product-tshirt-2.jpg','/products/product-tshirt-1.jpg'],'tshirts',array['S','M','L','XL'],'[{"name":"White","value":"hsl(0,0%,100%)"},{"name":"Cream","value":"hsl(30,25%,93%)"}]'::jsonb,'Minimalist blank canvas tee in heavyweight cotton. Clean lines, no compromises.',4.9,67,3),
('4','Sand Dune Hoodie',89,'/products/product-hoodie-2.jpg',array['/products/product-hoodie-2.jpg','/products/product-hoodie-1.jpg'],'hoodies',array['S','M','L','XL'],'[{"name":"Sand","value":"hsl(30,25%,80%)"},{"name":"Black","value":"hsl(0,0%,0%)"}]'::jsonb,'Sun-bleached sand tone hoodie with a washed finish. Oversized fit with dropped shoulders.',4.7,56,12),
('5','Legacy Hoodie — Charcoal',95,'/products/product-hoodie-1.jpg',array['/products/product-hoodie-1.jpg','/products/product-hoodie-2.jpg'],'hoodies',array['M','L','XL','XXL'],'[{"name":"Charcoal","value":"hsl(0,0%,25%)"}]'::jsonb,'The Legacy Hoodie in washed charcoal. Double-layered hood, kangaroo pocket, heavyweight feel.',4.9,201,5),
('6','Mindset Tee — Oversize',52,'/products/product-tshirt-1.jpg',array['/products/product-tshirt-1.jpg','/products/product-tshirt-2.jpg'],'tshirts',array['S','M','L','XL'],'[{"name":"Black","value":"hsl(0,0%,0%)"},{"name":"Grey","value":"hsl(0,0%,50%)"}]'::jsonb,'Oversized drop-shoulder tee with bold back print. Premium ringspun cotton.',4.5,43,18)
on conflict (id) do nothing;
