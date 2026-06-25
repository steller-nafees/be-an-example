-- Ensure referral codes on orders create affiliate commissions and are visible in admin reporting.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  create type public.commission_status as enum ('pending','approved','paid','rejected');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount numeric(10,2) not null default 0,
  rate numeric(5,2) not null default 0,
  status public.commission_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commissions_aff_idx on public.commissions(affiliate_id);
create index if not exists commissions_order_idx on public.commissions(order_id);

drop trigger if exists commissions_touch on public.commissions;
create trigger commissions_touch
  before update on public.commissions
  for each row execute function public.touch_updated_at();

alter table public.commissions enable row level security;

drop policy if exists "Commissions: affiliate read" on public.commissions;
drop policy if exists "Commissions: admin all" on public.commissions;
create policy "Commissions: affiliate read" on public.commissions
  for select to authenticated
  using (exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));
create policy "Commissions: admin all" on public.commissions
  for all to authenticated
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
  with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

create or replace function public.check_no_self_referral_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
end;
$$;

drop trigger if exists check_self_referral_commission on public.commissions;
create trigger check_self_referral_commission
  before insert on public.commissions
  for each row execute function public.check_no_self_referral_commission();

create or replace function public.handle_new_order_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  aff record;
begin
  if new.affiliate_code is null or new.affiliate_code = '' then
    return new;
  end if;

  select id, commission_rate into aff
  from public.affiliates
  where code = new.affiliate_code and status = 'approved'
  limit 1;

  if found then
    insert into public.commissions (affiliate_id, order_id, amount, rate, status)
    values (aff.id, new.id, round(new.subtotal * aff.commission_rate / 100, 2), aff.commission_rate, 'pending');
  end if;

  return new;
end;
$$;

drop trigger if exists orders_commission on public.orders;
create trigger orders_commission
  after insert on public.orders
  for each row execute function public.handle_new_order_commission();

create or replace function public.handle_order_status_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'delivered' and old.status is distinct from new.status then
    update public.commissions
    set status = 'approved', updated_at = now()
    where order_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_commission_status on public.orders;
create trigger orders_commission_status
  after update on public.orders
  for each row execute function public.handle_order_status_commission();

insert into public.commissions (affiliate_id, order_id, amount, rate, status)
select
  a.id,
  o.id,
  round(o.subtotal * a.commission_rate / 100, 2),
  a.commission_rate,
  case when o.status = 'delivered' then 'approved' else 'pending' end::public.commission_status
from public.orders o
join public.affiliates a
  on a.code = o.affiliate_code
 and a.status = 'approved'
left join public.commissions c
  on c.order_id = o.id
where o.affiliate_code is not null
  and o.affiliate_code <> ''
  and c.id is null;
