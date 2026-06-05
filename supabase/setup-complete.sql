-- ============================================================
-- BE AN EXAMPLE — COMPLETE backend setup (single-run script)
-- Run this ONCE in your Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================

-- =====================================================
-- 0. Helpers
-- =====================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =====================================================
-- 1. Products + storage
-- =====================================================
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

create index if not exists products_category_idx   on public.products(category);
create index if not exists products_created_at_idx on public.products(created_at desc);

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select using (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select using (bucket_id = 'product-images');

-- =====================================================
-- 2. Roles  (admin / affiliate / customer)
-- =====================================================
do $$ begin
  create type public.app_role as enum ('admin','affiliate','customer');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role    public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

drop policy if exists "Users read own roles" on public.user_roles;
create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- =====================================================
-- 3. Products admin-write policies (after has_role exists)
-- =====================================================
drop policy if exists "Admins insert products" on public.products;
drop policy if exists "Admins update products" on public.products;
drop policy if exists "Admins delete products" on public.products;
create policy "Admins insert products" on public.products
  for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "Admins update products" on public.products
  for update to authenticated using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete products" on public.products
  for delete to authenticated using (public.has_role(auth.uid(),'admin'));

drop policy if exists "Admins upload product images" on storage.objects;
drop policy if exists "Admins update product images" on storage.objects;
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

-- =====================================================
-- 4. Profiles (auto-created on signup)
-- =====================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles: self read"   on public.profiles;
drop policy if exists "Profiles: self update" on public.profiles;
drop policy if exists "Profiles: admin read"  on public.profiles;
create policy "Profiles: self read"   on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Profiles: self update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Profiles: admin read"  on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- 5. Orders + Order Items
-- =====================================================
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  email           text not null,
  first_name      text, last_name text, phone text,
  address         text, city text, state text, zip text,
  shipping_method text not null default 'standard',
  delivery_fee    numeric(10,2) not null default 0,
  subtotal        numeric(10,2) not null default 0,
  tax             numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  status          text not null default 'pending',
  affiliate_code  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  text not null,
  name        text not null,
  image       text,
  size        text, color text,
  price       numeric(10,2) not null,
  quantity    integer not null check (quantity > 0)
);

create index if not exists orders_user_idx       on public.orders(user_id);
create index if not exists orders_created_idx    on public.orders(created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Orders: own select"   on public.orders;
drop policy if exists "Orders: own insert"   on public.orders;
drop policy if exists "Orders: admin all"    on public.orders;
create policy "Orders: own select" on public.orders for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Orders: own insert" on public.orders for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Orders: admin all"  on public.orders for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

drop policy if exists "OrderItems: own select" on public.order_items;
drop policy if exists "OrderItems: own insert" on public.order_items;
drop policy if exists "OrderItems: admin all"  on public.order_items;
create policy "OrderItems: own select" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
         and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "OrderItems: own insert" on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "OrderItems: admin all"  on public.order_items for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- enable realtime
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when others then null; end $$;

-- =====================================================
-- 6. Collections + variants
-- =====================================================
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
drop policy if exists "Collections: admin write" on public.collections;
create policy "Collections: public read" on public.collections for select using (true);
create policy "Collections: admin write" on public.collections for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

alter table public.products
  add column if not exists collection_id uuid references public.collections(id) on delete set null;
create index if not exists products_collection_idx on public.products(collection_id);

create table if not exists public.product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products(id) on delete cascade,
  name        text not null,
  value       text not null,
  images      text[] not null default '{}',
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists product_colors_product_idx on public.product_colors(product_id);
alter table public.product_colors enable row level security;
drop policy if exists "Colors: public read"  on public.product_colors;
drop policy if exists "Colors: admin write"  on public.product_colors;
create policy "Colors: public read" on public.product_colors for select using (true);
create policy "Colors: admin write" on public.product_colors for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  text not null references public.products(id) on delete cascade,
  color_id    uuid references public.product_colors(id) on delete cascade,
  size        text not null,
  sku         text,
  stock       int  not null default 0,
  price       numeric(10,2),
  created_at  timestamptz not null default now(),
  unique (product_id, color_id, size)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_variants_color_idx   on public.product_variants(color_id);
alter table public.product_variants enable row level security;
drop policy if exists "Variants: public read" on public.product_variants;
drop policy if exists "Variants: admin write" on public.product_variants;
create policy "Variants: public read" on public.product_variants for select using (true);
create policy "Variants: admin write" on public.product_variants for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- =====================================================
-- 7. Affiliates + referral clicks + commissions + payouts
-- =====================================================
do $$ begin
  create type public.affiliate_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.affiliates (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid unique references auth.users(id) on delete cascade,
  name             text not null,
  email            text not null,
  code             text unique not null,
  status           public.affiliate_status not null default 'pending',
  instagram        text, tiktok text,
  audience_size    text,
  commission_rate  numeric(5,2) not null default 10,
  paypal_email     text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.affiliates
  add column if not exists paypal_email text;

drop trigger if exists affiliates_touch on public.affiliates;
create trigger affiliates_touch before update on public.affiliates
  for each row execute function public.touch_updated_at();

alter table public.affiliates enable row level security;

drop policy if exists "Affiliates: self select"     on public.affiliates;
drop policy if exists "Affiliates: self insert"     on public.affiliates;
drop policy if exists "Affiliates: self update"     on public.affiliates;
drop policy if exists "Affiliates: admin all"       on public.affiliates;
drop policy if exists "Affiliates: public read code" on public.affiliates;
create policy "Affiliates: self select" on public.affiliates for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Affiliates: self insert" on public.affiliates for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Affiliates: self update" on public.affiliates for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Affiliates: admin all"   on public.affiliates for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create policy "Affiliates: public read code" on public.affiliates for select to anon
  using (status = 'approved');

create table if not exists public.referral_clicks (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid references public.affiliates(id) on delete cascade,
  code          text not null,
  ip            text, user_agent text, referrer text, fingerprint text,
  created_at    timestamptz not null default now()
);
create index if not exists referral_clicks_aff_idx     on public.referral_clicks(affiliate_id);
create index if not exists referral_clicks_created_idx on public.referral_clicks(created_at desc);

alter table public.referral_clicks enable row level security;
drop policy if exists "Clicks: public insert"   on public.referral_clicks;
drop policy if exists "Clicks: affiliate read"  on public.referral_clicks;
drop policy if exists "Clicks: admin all"       on public.referral_clicks;
create policy "Clicks: public insert" on public.referral_clicks for insert to anon, authenticated with check (true);
create policy "Clicks: affiliate read" on public.referral_clicks for select to authenticated
  using (exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "Clicks: admin all" on public.referral_clicks for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

do $$ begin
  create type public.commission_status as enum ('pending','approved','paid','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.commissions (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid not null references public.affiliates(id) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,
  amount        numeric(10,2) not null,
  rate          numeric(5,2) not null,
  status        public.commission_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists commissions_aff_idx on public.commissions(affiliate_id);

drop trigger if exists commissions_touch on public.commissions;
create trigger commissions_touch before update on public.commissions
  for each row execute function public.touch_updated_at();

alter table public.commissions enable row level security;
drop policy if exists "Commissions: affiliate read" on public.commissions;
drop policy if exists "Commissions: admin all"      on public.commissions;
create policy "Commissions: affiliate read" on public.commissions for select to authenticated
  using (exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "Commissions: admin all" on public.commissions for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

do $$ begin
  create type public.payout_status as enum ('pending','processed','rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.payouts (
  id             uuid primary key default gen_random_uuid(),
  affiliate_id   uuid not null references public.affiliates(id) on delete cascade,
  amount         numeric(10,2) not null check (amount > 0),
  method         text not null default 'paypal',
  status         public.payout_status not null default 'pending',
  requested_at   timestamptz not null default now(),
  processed_at   timestamptz
);
create index if not exists payouts_aff_idx on public.payouts(affiliate_id);

alter table public.payouts enable row level security;
drop policy if exists "Payouts: affiliate read"   on public.payouts;
drop policy if exists "Payouts: affiliate insert" on public.payouts;
drop policy if exists "Payouts: admin all"        on public.payouts;
create policy "Payouts: affiliate read" on public.payouts for select to authenticated
  using (exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "Payouts: affiliate insert" on public.payouts for insert to authenticated
  with check (exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "Payouts: admin all" on public.payouts for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- Auto-create commission row when an order has an affiliate_code
create or replace function public.handle_new_order_commission()
returns trigger language plpgsql security definer set search_path = public as $$
declare aff record;
begin
  if new.affiliate_code is null or new.affiliate_code = '' then return new; end if;
  select id, commission_rate into aff from public.affiliates
   where code = new.affiliate_code and status = 'approved' limit 1;
  if not found then return new; end if;
  insert into public.commissions (affiliate_id, order_id, amount, rate, status)
  values (aff.id, new.id, round(new.subtotal * aff.commission_rate / 100, 2), aff.commission_rate, 'pending');
  return new;
end $$;

drop trigger if exists orders_commission on public.orders;
create trigger orders_commission after insert on public.orders
  for each row execute function public.handle_new_order_commission();

-- When an order is marked delivered, approve its commission
create or replace function public.handle_order_status_commission()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'delivered' and old.status is distinct from 'delivered' then
    update public.commissions set status = 'approved'
      where order_id = new.id and status = 'pending';
  end if;
  return new;
end $$;

drop trigger if exists orders_commission_status on public.orders;
create trigger orders_commission_status after update on public.orders
  for each row execute function public.handle_order_status_commission();

-- =====================================================
-- 8. Fraud alerts
-- =====================================================
do $$ begin
  create type public.fraud_verdict as enum ('clean','suspicious','blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fraud_alert_status as enum ('pending_review','approved','rejected','banned');
exception when duplicate_object then null; end $$;

create table if not exists public.fraud_alerts (
  id              uuid primary key default gen_random_uuid(),
  affiliate_id    uuid references public.affiliates(id) on delete set null,
  affiliate_code  text,
  risk_score      integer not null default 0,
  verdict         public.fraud_verdict not null default 'suspicious',
  signals         jsonb not null default '[]'::jsonb,
  status          public.fraud_alert_status not null default 'pending_review',
  ip              text, user_agent text, fingerprint text,
  related_order_id uuid references public.orders(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists fraud_alerts_aff_idx     on public.fraud_alerts(affiliate_id);
create index if not exists fraud_alerts_created_idx on public.fraud_alerts(created_at desc);

alter table public.fraud_alerts enable row level security;
drop policy if exists "Fraud: admin all"     on public.fraud_alerts;
drop policy if exists "Fraud: public insert" on public.fraud_alerts;
create policy "Fraud: admin all" on public.fraud_alerts for all to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create policy "Fraud: public insert" on public.fraud_alerts for insert to anon, authenticated
  with check (true);

-- =====================================================
-- 9. Seed initial catalog (only inserts if missing)
-- =====================================================
insert into public.products (id, name, price, image, images, category, sizes, colors, description, rating, reviews, stock) values
('1','Noir Essentials Hoodie',89,'/products/product-hoodie-1.jpg',array['/products/product-hoodie-1.jpg','/products/product-hoodie-2.jpg'],'hoodies',array['XS','S','M','L','XL'],'[{"name":"Black","value":"hsl(0,0%,0%)"},{"name":"Sand","value":"hsl(30,25%,80%)"}]'::jsonb,'Heavyweight 400gsm cotton fleece hoodie.',4.8,124,8),
('2','Statement Tee — Black',45,'/products/product-tshirt-1.jpg',array['/products/product-tshirt-1.jpg','/products/product-tshirt-2.jpg'],'tshirts',array['XS','S','M','L','XL','XXL'],'[{"name":"Black","value":"hsl(0,0%,0%)"},{"name":"White","value":"hsl(0,0%,100%)"}]'::jsonb,'Premium 220gsm combed cotton tee.',4.6,89,23)
on conflict (id) do nothing;

-- =====================================================
-- 10. Make yourself admin (REPLACE EMAIL, then uncomment)
-- =====================================================
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'you@example.com'
-- on conflict do nothing;
