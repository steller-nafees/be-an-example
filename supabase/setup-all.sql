-- ============================================================
-- BE AN EXAMPLE — Full backend setup
-- Run this ONCE in your Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- Prereq: setup-products.sql has already been run.
-- ============================================================

-- =====================================================
-- 0. Helpers
-- =====================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =====================================================
-- 1. Roles  (admin / affiliate / customer)
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
-- 2. Profiles  (auto-created on signup)
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
-- 3. Orders + Order Items
-- =====================================================
-- Sequence for formatted order IDs
create sequence if not exists public.order_number_seq start 1;

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  formatted_id    text not null unique, -- e.g., "BAEO-0001"
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

create or replace function public.create_order_with_items(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_state text,
  p_zip text,
  p_shipping_method text,
  p_delivery_fee numeric,
  p_subtotal numeric,
  p_tax numeric,
  p_total numeric,
  p_affiliate_code text,
  p_items jsonb
)
returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  new_order public.orders%rowtype;
  v_expected_total numeric;
  v_order_number bigint;
  v_formatted_id text;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'invalid user';
  end if;

  -- Validate delivery fee is non-negative
  if p_delivery_fee < 0 then
    raise exception 'delivery fee cannot be negative';
  end if;

  -- Validate subtotal is non-negative
  if p_subtotal < 0 then
    raise exception 'subtotal cannot be negative';
  end if;

  -- Validate tax is non-negative
  if p_tax < 0 then
    raise exception 'tax cannot be negative';
  end if;

  -- Calculate expected total: subtotal + tax + delivery_fee
  v_expected_total := p_subtotal + p_tax + p_delivery_fee;

  -- Validate total matches calculation (with 0.01 tolerance for rounding)
  if abs(p_total - v_expected_total) > 0.01 then
    raise exception 'order total mismatch: expected %, got %', 
      v_expected_total::numeric(10,2), p_total::numeric(10,2);
  end if;

  -- Generate next order number and formatted ID
  v_order_number := nextval('public.order_number_seq');
  v_formatted_id := 'BAEO-' || lpad(v_order_number::text, 4, '0');

  insert into public.orders (
    formatted_id, user_id, email, first_name, last_name, phone, address, city, state, zip,
    shipping_method, delivery_fee, subtotal, tax, total, status, affiliate_code
  ) values (
    v_formatted_id, p_user_id, p_email, p_first_name, p_last_name, p_phone, p_address, p_city, p_state, p_zip,
    p_shipping_method, p_delivery_fee, p_subtotal, p_tax, p_total, 'pending', p_affiliate_code
  ) returning * into new_order;

  insert into public.order_items (
    order_id, product_id, name, image, size, color, price, quantity
  )
  select
    new_order.id,
    item->>'product_id',
    item->>'name',
    item->>'image',
    nullif(item->>'size',''),
    nullif(item->>'color',''),
    (item->>'price')::numeric,
    (item->>'quantity')::int
  from jsonb_array_elements(p_items) as item;

  return new_order;
end;
$$;

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

-- =====================================================
-- 4. Lock down products writes to admins
--    (replaces the "any authenticated user" policies from setup-products.sql)
-- =====================================================
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;
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
-- product-images bucket: lock writes to admins
drop policy if exists "Authenticated upload product images" on storage.objects;
drop policy if exists "Authenticated update product images" on storage.objects;
drop policy if exists "Authenticated delete product images" on storage.objects;
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
-- 5. Affiliates
-- =====================================================
do $$ begin
  create type public.affiliate_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.withdrawal_frequency as enum ('monthly','weekly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('paypal','bank');
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
  withdrawal_frequency public.withdrawal_frequency not null default 'monthly',
  payment_method   public.payment_method not null default 'paypal',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

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
-- public read of approved affiliate codes (for /?ref=CODE resolution)
create policy "Affiliates: public read code" on public.affiliates for select to anon
  using (status = 'approved');

-- =====================================================
-- 6. Referral clicks + Commissions + Payouts
-- =====================================================
create table if not exists public.referral_clicks (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid references public.affiliates(id) on delete cascade,
  code          text not null,
  ip            text,
  user_agent    text,
  referrer      text,
  fingerprint   text,
  created_at    timestamptz not null default now()
);
create index if not exists referral_clicks_aff_idx     on public.referral_clicks(affiliate_id);
create index if not exists referral_clicks_created_idx on public.referral_clicks(created_at desc);

alter table public.referral_clicks enable row level security;
drop policy if exists "Clicks: public insert"   on public.referral_clicks;
drop policy if exists "Clicks: affiliate read"  on public.referral_clicks;
drop policy if exists "Clicks: admin all"       on public.referral_clicks;
create policy "Clicks: public insert" on public.referral_clicks for insert to anon, authenticated
  with check (true);
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

-- Prevent self-referral commissions
create or replace function public.check_no_self_referral_commission()
returns trigger language plpgsql as $$
declare
  affiliate_user_id uuid;
  order_user_id uuid;
begin
  select user_id into affiliate_user_id from public.affiliates where id = new.affiliate_id;
  select user_id into order_user_id from public.orders where id = new.order_id;
  
  if affiliate_user_id is not null and order_user_id is not null and affiliate_user_id = order_user_id then
    raise exception 'Self-referral commissions are not allowed';
  end if;
  
  return new;
end $$;

drop trigger if exists check_self_referral_commission on public.commissions;
create trigger check_self_referral_commission
  before insert on public.commissions
  for each row execute function public.check_no_self_referral_commission();

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

-- Atomic RPC to create a payout for an affiliate and mark approved commissions as paid
create or replace function public.create_payout_for_affiliate(p_affiliate_id uuid)
returns public.payouts language plpgsql security definer set search_path = public as $$
declare
  total_amount numeric;
  result_row public.payouts%rowtype;
  pay_method text;
begin
  if not public.has_role(auth.uid(),'admin') then
    raise exception 'not authorized';
  end if;

  select coalesce(sum(amount),0)::numeric into total_amount from public.commissions where affiliate_id = p_affiliate_id and status = 'approved';
  if total_amount <= 0 then
    raise exception 'no approved commissions to pay';
  end if;

  select payment_method into pay_method from public.affiliates where id = p_affiliate_id;
  if pay_method is null then pay_method := 'paypal'; end if;

  insert into public.payouts (affiliate_id, amount, method, status, processed_at)
    values (p_affiliate_id, total_amount, pay_method, 'processed', now())
    returning * into result_row;

  update public.commissions set status = 'paid', updated_at = now() where affiliate_id = p_affiliate_id and status = 'approved';

  return result_row;
end;
$$;

-- =====================================================
-- 7. Fraud alerts
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
  ip              text,
  user_agent      text,
  fingerprint     text,
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
-- 8. Make yourself admin
--    Replace the email below with YOUR account, then sign up
--    once in the app so auth.users has a row for that email.
-- =====================================================
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'you@example.com'
-- on conflict do nothing;
