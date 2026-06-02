-- ============================================================
-- Collections + per-color variants + per-size stock
-- Run AFTER setup-products.sql and setup-all.sql.
-- Safe to re-run (idempotent).
-- ============================================================

-- 1. Collections ----------------------------------------------------
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text not null default '',
  image       text,
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists collections_touch on public.collections;
create trigger collections_touch before update on public.collections
  for each row execute function public.touch_updated_at();

alter table public.collections enable row level security;

drop policy if exists "Collections: public read" on public.collections;
create policy "Collections: public read"
  on public.collections for select using (true);

drop policy if exists "Collections: admin write" on public.collections;
create policy "Collections: admin write"
  on public.collections for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- 2. Link products to a collection ---------------------------------
alter table public.products
  add column if not exists collection_id uuid references public.collections(id) on delete set null;

create index if not exists products_collection_idx on public.products(collection_id);

-- 3. Per-color images for a product --------------------------------
create table if not exists public.product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products(id) on delete cascade,
  name        text not null,
  value       text not null,                       -- hex / hsl
  images      text[] not null default '{}',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists product_colors_product_idx on public.product_colors(product_id);

alter table public.product_colors enable row level security;

drop policy if exists "Colors: public read"  on public.product_colors;
drop policy if exists "Colors: admin write"  on public.product_colors;
create policy "Colors: public read"
  on public.product_colors for select using (true);
create policy "Colors: admin write"
  on public.product_colors for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- 4. Per (color, size) stock ---------------------------------------
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products(id) on delete cascade,
  color_id    uuid references public.product_colors(id) on delete cascade,
  size        text not null,
  sku         text,
  stock       int  not null default 0,
  price       numeric(10,2),                       -- optional override
  created_at  timestamptz not null default now(),
  unique (product_id, color_id, size)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_variants_color_idx   on public.product_variants(color_id);

alter table public.product_variants enable row level security;

drop policy if exists "Variants: public read" on public.product_variants;
drop policy if exists "Variants: admin write" on public.product_variants;
create policy "Variants: public read"
  on public.product_variants for select using (true);
create policy "Variants: admin write"
  on public.product_variants for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
