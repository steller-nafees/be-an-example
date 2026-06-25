-- Persist checkout currency on orders so Stripe can read it from the database.

alter table public.orders
  add column if not exists currency text not null default 'gbp';

update public.orders o
set currency = coalesce(
  nullif(o.currency, ''),
  nullif((select value->>'currency' from public.site_settings where key = 'brand'), ''),
  'gbp'
)
where coalesce(o.currency, '') = '';

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
