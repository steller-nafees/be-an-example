-- Printful sync variant IDs can exceed 32-bit integer range.
-- Widen the stored columns and refresh the order insertion function accordingly.

alter table public.product_variants
  add column if not exists printful_sync_variant_id bigint;

alter table public.order_items
  add column if not exists printful_sync_variant_id bigint;

alter table public.product_variants
  alter column printful_sync_variant_id type bigint
  using printful_sync_variant_id::bigint;

alter table public.order_items
  alter column printful_sync_variant_id type bigint
  using printful_sync_variant_id::bigint;

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
  p_coupon_code text,
  p_items jsonb
)
returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  new_order public.orders%rowtype;
  v_expected_total numeric;
  v_order_number bigint;
  v_formatted_id text;
  v_expected_tax numeric;
  v_coupon_valid boolean := false;
  v_coupon_id uuid;
  v_coupon_code_result text;
  v_coupon_title_result text;
  v_coupon_discount_type_result public.coupon_discount_type;
  v_coupon_discount_value_result numeric;
  v_discount_amount numeric := 0;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'invalid user';
  end if;

  if p_delivery_fee < 0 then
    raise exception 'delivery fee cannot be negative';
  end if;

  if p_subtotal < 0 then
    raise exception 'subtotal cannot be negative';
  end if;

  if p_tax < 0 then
    raise exception 'tax cannot be negative';
  end if;

  v_expected_tax := p_subtotal * 0.1;
  v_expected_total := p_subtotal + p_tax + p_delivery_fee;

  if abs(p_tax - v_expected_tax) > 0.01 then
    raise exception 'tax mismatch: expected %, got %',
      v_expected_tax::numeric(10,2), p_tax::numeric(10,2);
  end if;

  if abs(p_total - v_expected_total) > 0.01 then
    raise exception 'order total mismatch: expected %, got %',
      v_expected_total::numeric(10,2), p_total::numeric(10,2);
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select
      c.id,
      c.code,
      c.title,
      c.discount_type,
      c.discount_value
    into
      v_coupon_id,
      v_coupon_code_result,
      v_coupon_title_result,
      v_coupon_discount_type_result,
      v_coupon_discount_value_result
    from public.coupons c
    where lower(c.code) = lower(trim(p_coupon_code))
      and c.active = true
    limit 1;

    if found then
      v_coupon_valid := true;
      if v_coupon_discount_type_result = 'percentage' then
        v_discount_amount := round((p_subtotal * v_coupon_discount_value_result) / 100.0, 2);
      else
        v_discount_amount := least(v_coupon_discount_value_result, p_subtotal);
      end if;
    end if;
  end if;

  v_order_number := nextval('public.order_number_seq');
  v_formatted_id := 'BAEO-' || lpad(v_order_number::text, 4, '0');

  insert into public.orders (
    formatted_id, user_id, email, first_name, last_name, phone, address, city, state, zip,
    country, shipping_method, delivery_fee, subtotal, tax, total, status, affiliate_code,
    coupon_id, coupon_code, coupon_title, coupon_discount_type, coupon_discount_value, discount_amount
  ) values (
    v_formatted_id, p_user_id, p_email, p_first_name, p_last_name, p_phone, p_address, p_city, p_state, p_zip,
    coalesce(nullif(p_country,''), 'US'), p_shipping_method, p_delivery_fee, p_subtotal, p_tax, p_total, 'pending', p_affiliate_code,
    v_coupon_id, v_coupon_code_result, v_coupon_title_result, v_coupon_discount_type_result, v_coupon_discount_value_result, v_discount_amount
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

-- Remove the older overload that places p_items before p_coupon_code.
-- Keeping both signatures makes Supabase RPC ambiguous when named arguments are used.
drop function if exists public.create_order_with_items(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  text,
  jsonb,
  text
);
