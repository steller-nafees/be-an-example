-- ============================================================
-- Printful fulfillment integration
-- Run this in Supabase SQL Editor after the main setup files.
-- Safe to re-run.
-- ============================================================

alter table public.products
  add column if not exists printful_product_id text,
  add column if not exists size_chart jsonb not null default '[]'::jsonb,
  add column if not exists scheduled_at date;

alter table public.product_variants
  add column if not exists printful_sync_variant_id bigint;

alter table public.orders
  add column if not exists country text default 'US',
  add column if not exists printful_order_id text,
  add column if not exists printful_status text not null default 'not_submitted',
  add column if not exists printful_error text,
  add column if not exists printful_submitted_at timestamptz;

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists printful_sync_variant_id bigint;

create index if not exists product_variants_printful_sync_idx
  on public.product_variants(printful_sync_variant_id);
create index if not exists products_scheduled_at_idx
  on public.products(scheduled_at);
create index if not exists orders_printful_order_idx
  on public.orders(printful_order_id);

do $$
begin
  create type public.coupon_discount_type as enum ('percentage', 'fixed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.coupons (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  title               text not null,
  description         text not null default '',
  discount_type       public.coupon_discount_type not null,
  discount_value      numeric(10,2) not null check (discount_value > 0),
  applies_to_all_products boolean not null default true,
  active              boolean not null default true,
  minimum_subtotal    numeric(10,2) not null default 0,
  usage_limit         integer,
  times_used          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists coupons_touch_updated_at on public.coupons;
create trigger coupons_touch_updated_at before update on public.coupons
  for each row execute function public.touch_updated_at();

create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_active_idx on public.coupons(active);

create table if not exists public.coupon_products (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  primary key (coupon_id, product_id)
);

create index if not exists coupon_products_coupon_idx on public.coupon_products(coupon_id);
create index if not exists coupon_products_product_idx on public.coupon_products(product_id);

alter table public.coupons enable row level security;
alter table public.coupon_products enable row level security;

drop policy if exists "Coupons: admin all" on public.coupons;
drop policy if exists "Coupon products: admin all" on public.coupon_products;
create policy "Coupons: admin all" on public.coupons for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
create policy "Coupon products: admin all" on public.coupon_products for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

alter table public.orders
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists coupon_code text,
  add column if not exists coupon_title text,
  add column if not exists coupon_discount_type text,
  add column if not exists coupon_discount_value numeric(10,2),
  add column if not exists discount_amount numeric(10,2) not null default 0,
  add column if not exists currency text not null default 'gbp';

create index if not exists orders_coupon_idx on public.orders(coupon_id);
create index if not exists orders_coupon_code_idx on public.orders(coupon_code);

create or replace function public.preview_coupon_discount(
  p_coupon_code text,
  p_items jsonb,
  p_subtotal numeric
)
returns table (
  valid boolean,
  coupon_id uuid,
  code text,
  title text,
  discount_type text,
  discount_value numeric,
  eligible_subtotal numeric,
  discount_amount numeric,
  minimum_subtotal numeric,
  applies_to_all_products boolean,
  product_ids text[],
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons%rowtype;
  v_code text := upper(btrim(coalesce(p_coupon_code, '')));
  v_eligible_subtotal numeric := 0;
  v_discount numeric := 0;
  v_product_ids text[] := array[]::text[];
begin
  if v_code = '' then
    return query
    select false, null::uuid, null::text, null::text, null::text, 0::numeric, 0::numeric, 0::numeric,
      0::numeric, false, array[]::text[], 'Coupon code is required';
    return;
  end if;

  select * into v_coupon
  from public.coupons
  where code = v_code
  limit 1;

  if not found then
    return query
    select false, null::uuid, v_code, null::text, null::text, 0::numeric, 0::numeric, 0::numeric,
      0::numeric, false, array[]::text[], 'Coupon code is not valid';
    return;
  end if;

  if not v_coupon.active then
    return query
    select false, v_coupon.id, v_coupon.code, v_coupon.title, v_coupon.discount_type::text, v_coupon.discount_value,
      0::numeric, 0::numeric, v_coupon.minimum_subtotal, v_coupon.applies_to_all_products, array[]::text[],
      'Coupon is inactive';
    return;
  end if;

  if v_coupon.usage_limit is not null and v_coupon.times_used >= v_coupon.usage_limit then
    return query
    select false, v_coupon.id, v_coupon.code, v_coupon.title, v_coupon.discount_type::text, v_coupon.discount_value,
      0::numeric, 0::numeric, v_coupon.minimum_subtotal, v_coupon.applies_to_all_products, array[]::text[],
      'Coupon usage limit reached';
    return;
  end if;

  if coalesce(p_subtotal, 0) < v_coupon.minimum_subtotal then
    return query
    select false, v_coupon.id, v_coupon.code, v_coupon.title, v_coupon.discount_type::text, v_coupon.discount_value,
      0::numeric, 0::numeric, v_coupon.minimum_subtotal, v_coupon.applies_to_all_products, array[]::text[],
      'Order does not meet the minimum subtotal';
    return;
  end if;

  if p_items is null then
    p_items := '[]'::jsonb;
  end if;

  select coalesce(sum((item->>'price')::numeric * (item->>'quantity')::int), 0)
    into v_eligible_subtotal
  from jsonb_array_elements(p_items) as item
  where v_coupon.applies_to_all_products
    or exists (
      select 1
      from public.coupon_products cp
      where cp.coupon_id = v_coupon.id
        and cp.product_id = item->>'product_id'
    );

  if v_eligible_subtotal <= 0 then
    return query
    select false, v_coupon.id, v_coupon.code, v_coupon.title, v_coupon.discount_type::text, v_coupon.discount_value,
      0::numeric, 0::numeric, v_coupon.minimum_subtotal, v_coupon.applies_to_all_products, array[]::text[],
      'Coupon does not apply to the current cart';
    return;
  end if;

  if v_coupon.discount_type = 'percentage' then
    v_discount := round(v_eligible_subtotal * v_coupon.discount_value / 100, 2);
  else
    v_discount := least(v_coupon.discount_value, v_eligible_subtotal);
  end if;

  select coalesce(array_agg(cp.product_id order by cp.product_id), array[]::text[])
    into v_product_ids
  from public.coupon_products cp
  where cp.coupon_id = v_coupon.id;

  if v_discount <= 0 then
    return query
    select false, v_coupon.id, v_coupon.code, v_coupon.title, v_coupon.discount_type::text, v_coupon.discount_value,
      v_eligible_subtotal, 0::numeric, v_coupon.minimum_subtotal, v_coupon.applies_to_all_products, v_product_ids,
      'Coupon produced no discount';
    return;
  end if;

  return query
  select true,
    v_coupon.id,
    v_coupon.code,
    v_coupon.title,
    v_coupon.discount_type::text,
    v_coupon.discount_value,
    v_eligible_subtotal,
    v_discount,
    v_coupon.minimum_subtotal,
    v_coupon.applies_to_all_products,
    v_product_ids,
    'Coupon applied successfully'
  ;
end;
$$;

create or replace function public.upsert_coupon(
  p_id uuid,
  p_code text,
  p_title text,
  p_description text,
  p_discount_type text,
  p_discount_value numeric,
  p_applies_to_all_products boolean,
  p_active boolean,
  p_minimum_subtotal numeric,
  p_usage_limit integer,
  p_product_ids text[]
)
returns public.coupons
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons%rowtype;
  v_code text := upper(btrim(coalesce(p_code, '')));
  v_existing uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'forbidden';
  end if;

  if v_code = '' then
    raise exception 'coupon code is required';
  end if;

  if p_title is null or btrim(p_title) = '' then
    raise exception 'coupon title is required';
  end if;

  if p_discount_type not in ('percentage', 'fixed') then
    raise exception 'invalid discount type';
  end if;

  if p_discount_value is null or p_discount_value <= 0 then
    raise exception 'discount value must be greater than zero';
  end if;

  if p_discount_type = 'percentage' and p_discount_value > 100 then
    raise exception 'percentage coupons cannot exceed 100';
  end if;

  select id into v_existing
  from public.coupons
  where code = v_code
    and (p_id is null or id <> p_id)
  limit 1;

  if found then
    raise exception 'coupon code already exists';
  end if;

  insert into public.coupons (
    id, code, title, description, discount_type, discount_value,
    applies_to_all_products, active, minimum_subtotal, usage_limit
  ) values (
    coalesce(p_id, gen_random_uuid()),
    v_code,
    btrim(p_title),
    coalesce(p_description, ''),
    p_discount_type::public.coupon_discount_type,
    p_discount_value,
    coalesce(p_applies_to_all_products, true),
    coalesce(p_active, true),
    greatest(coalesce(p_minimum_subtotal, 0), 0),
    p_usage_limit
  )
  on conflict (id) do update set
    code = excluded.code,
    title = excluded.title,
    description = excluded.description,
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    applies_to_all_products = excluded.applies_to_all_products,
    active = excluded.active,
    minimum_subtotal = excluded.minimum_subtotal,
    usage_limit = excluded.usage_limit
  returning * into v_coupon;

  delete from public.coupon_products where coupon_id = v_coupon.id;

  if not v_coupon.applies_to_all_products and coalesce(array_length(p_product_ids, 1), 0) > 0 then
    insert into public.coupon_products (coupon_id, product_id)
    select v_coupon.id, unnest(p_product_ids);
  end if;

  return v_coupon;
end;
$$;

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
  p_country text,
  p_shipping_method text,
  p_delivery_fee numeric,
  p_subtotal numeric,
  p_tax numeric,
  p_total numeric,
  p_affiliate_code text,
  p_items jsonb,
  p_coupon_code text default null,
  p_currency text default null
)
returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  new_order public.orders%rowtype;
  v_expected_total numeric;
  v_order_number bigint;
  v_formatted_id text;
  v_coupon record;
  v_coupon_valid boolean := false;
  v_coupon_id uuid := null;
  v_coupon_code_result text := null;
  v_coupon_title_result text := null;
  v_coupon_discount_type_result text := null;
  v_coupon_discount_value_result numeric := null;
  v_discount_amount numeric := 0;
  v_net_subtotal numeric := greatest(coalesce(p_subtotal, 0), 0);
  v_expected_tax numeric;
  v_coupon_code text := upper(btrim(coalesce(p_coupon_code, '')));
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'invalid user';
  end if;

  if coalesce(nullif(trim(coalesce(p_currency, '')), ''), '') = '' then
    p_currency := 'gbp';
  end if;

  if p_delivery_fee < 0 then raise exception 'delivery fee cannot be negative'; end if;
  if p_subtotal < 0 then raise exception 'subtotal cannot be negative'; end if;
  if p_tax < 0 then raise exception 'tax cannot be negative'; end if;

  if v_coupon_code <> '' then
    select * into v_coupon
    from public.preview_coupon_discount(v_coupon_code, p_items, p_subtotal)
    limit 1;

    if not found then
      raise exception 'coupon is not valid';
    elsif not v_coupon.valid then
      raise exception '%', coalesce(v_coupon.message, 'coupon is not valid');
    end if;

    v_coupon_valid := true;
    v_coupon_id := v_coupon.coupon_id;
    v_coupon_code_result := v_coupon.code;
    v_coupon_title_result := v_coupon.title;
    v_coupon_discount_type_result := v_coupon.discount_type;
    v_coupon_discount_value_result := v_coupon.discount_value;
    v_discount_amount := coalesce(v_coupon.discount_amount, 0);
  end if;

  v_net_subtotal := greatest(coalesce(p_subtotal, 0) - v_discount_amount, 0);
  v_expected_tax := round(v_net_subtotal * 0.1, 2);
  v_expected_total := v_net_subtotal + p_delivery_fee + v_expected_tax;

  if abs(p_tax - v_expected_tax) > 0.01 then
    raise exception 'order tax mismatch: expected %, got %',
      v_expected_tax::numeric(10,2), p_tax::numeric(10,2);
  end if;

  if abs(p_total - v_expected_total) > 0.01 then
    raise exception 'order total mismatch: expected %, got %',
      v_expected_total::numeric(10,2), p_total::numeric(10,2);
  end if;

  v_order_number := nextval('public.order_number_seq');
  v_formatted_id := 'BAEO-' || lpad(v_order_number::text, 4, '0');

  insert into public.orders (
    formatted_id, user_id, email, first_name, last_name, phone, address, city, state, zip,
    country, shipping_method, delivery_fee, subtotal, tax, total, status, affiliate_code,
    coupon_id, coupon_code, coupon_title, coupon_discount_type, coupon_discount_value, discount_amount, currency
  ) values (
    v_formatted_id, p_user_id, p_email, p_first_name, p_last_name, p_phone, p_address, p_city, p_state, p_zip,
    coalesce(nullif(p_country,''), 'US'), p_shipping_method, p_delivery_fee, p_subtotal, v_expected_tax, v_expected_total, 'pending', p_affiliate_code,
    v_coupon_id, v_coupon_code_result, v_coupon_title_result, v_coupon_discount_type_result, v_coupon_discount_value_result, v_discount_amount, p_currency
  ) returning * into new_order;

  if v_coupon_valid then
    update public.coupons
      set times_used = times_used + 1
      where id = v_coupon_id;
  end if;

  insert into public.order_items (
    order_id, product_id, variant_id, printful_sync_variant_id, name, image, size, color, price, quantity
  )
  select
    new_order.id,
    item->>'product_id',
    case
      when (item->>'variant_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then (item->>'variant_id')::uuid
      else null
    end,
    nullif(item->>'printful_sync_variant_id','')::bigint,
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
