-- Restore the order identifier column expected by checkout and fulfillment flows.
-- This migration is safe for existing databases that were created before formatted_id existed.

create sequence if not exists public.order_number_seq start 1;

alter table public.orders
  add column if not exists formatted_id text;

-- Backfill any legacy orders with stable BAEO-#### identifiers.
with ordered_rows as (
  select
    id,
    row_number() over (order by created_at, id) as rn
  from public.orders
  where formatted_id is null
)
update public.orders o
set formatted_id = 'BAEO-' || lpad(ordered_rows.rn::text, 4, '0')
from ordered_rows
where o.id = ordered_rows.id;

do $$
declare
  v_max_order_number bigint;
begin
  select greatest(
    coalesce(
      (
        select max((substring(formatted_id from '[0-9]+$'))::bigint)
        from public.orders
        where formatted_id ~ '[0-9]+$'
      ),
      0
    ),
    coalesce((select count(*) from public.orders), 0)
  )
  into v_max_order_number;

  if v_max_order_number > 0 then
    perform setval('public.order_number_seq', v_max_order_number, true);
  else
    perform setval('public.order_number_seq', 1, false);
  end if;
end $$;

alter table public.orders
  alter column formatted_id set not null;

create unique index if not exists orders_formatted_id_idx
  on public.orders(formatted_id);
