-- Site-wide brand/contact settings.
-- Run this after setup-all.sql or setup-complete.sql so public.has_role exists.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Site settings: public read" on public.site_settings;
create policy "Site settings: public read"
  on public.site_settings for select
  using (true);

drop policy if exists "Site settings: admin insert" on public.site_settings;
create policy "Site settings: admin insert"
  on public.site_settings for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Site settings: admin update" on public.site_settings;
create policy "Site settings: admin update"
  on public.site_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.site_settings (key, value)
values
  (
    'brand',
    '{
      "brandName": "BE AN EXAMPLE",
      "companyName": "Be An Example Inc.",
      "tagline": "Make Your Style An Example.",
      "supportEmail": "support@beanexample.com",
      "privacyEmail": "privacy@beanexample.com",
      "legalEmail": "legal@beanexample.com",
      "shippingEmail": "shipping@beanexample.com",
      "affiliateEmail": "affiliates@beanexample.com",
      "adminEmail": "admin@beanexample.com",
      "phone": "",
      "addressLine1": "Headquarters in major US city",
      "addressLine2": "Global operations across 50+ countries",
      "weekdayHours": "Mon - Fri: 9:00 AM - 6:00 PM EST",
      "weekendHours": "Sat - Sun: 10:00 AM - 4:00 PM EST",
      "closedNote": "Closed on major holidays",
      "facebookUrl": "https://www.facebook.com/beanexample",
      "instagramUrl": "#",
      "twitterUrl": "#"
    }'::jsonb
  ),
  ('logo', '{"dataUrl": null}'::jsonb)
on conflict (key) do nothing;
