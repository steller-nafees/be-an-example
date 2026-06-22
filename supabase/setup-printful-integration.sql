-- ============================================================
-- Printful fulfillment integration
-- Run this in Supabase SQL Editor after the main setup files.
-- Safe to re-run.
-- ============================================================

alter table public.products
  add column if not exists printful_product_id text;

alter table public.product_variants
  add column if not exists printful_sync_variant_id integer;

alter table public.orders
  add column if not exists country text default 'US',
  add column if not exists printful_order_id text,
  add column if not exists printful_status text not null default 'not_submitted',
  add column if not exists printful_error text,
  add column if not exists printful_submitted_at timestamptz;

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists printful_sync_variant_id integer;

create index if not exists product_variants_printful_sync_idx
  on public.product_variants(printful_sync_variant_id);
create index if not exists orders_printful_order_idx
  on public.orders(printful_order_id);

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

  if p_delivery_fee < 0 then raise exception 'delivery fee cannot be negative'; end if;
  if p_subtotal < 0 then raise exception 'subtotal cannot be negative'; end if;
  if p_tax < 0 then raise exception 'tax cannot be negative'; end if;

  v_expected_total := p_subtotal + p_tax + p_delivery_fee;
  if abs(p_total - v_expected_total) > 0.01 then
    raise exception 'order total mismatch: expected %, got %',
      v_expected_total::numeric(10,2), p_total::numeric(10,2);
  end if;

  v_order_number := nextval('public.order_number_seq');
  v_formatted_id := 'BAEO-' || lpad(v_order_number::text, 4, '0');

  insert into public.orders (
    formatted_id, user_id, email, first_name, last_name, phone, address, city, state, zip,
    country, shipping_method, delivery_fee, subtotal, tax, total, status, affiliate_code
  ) values (
    v_formatted_id, p_user_id, p_email, p_first_name, p_last_name, p_phone, p_address, p_city, p_state, p_zip,
    coalesce(nullif(p_country,''), 'US'), p_shipping_method, p_delivery_fee, p_subtotal, p_tax, p_total, 'pending', p_affiliate_code
  ) returning * into new_order;

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
    nullif(item->>'printful_sync_variant_id','')::int,
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
