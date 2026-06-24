-- ============================================================
-- Contact form messaging
-- Run this in Supabase SQL Editor after the main setup files.
-- Safe to re-run.
-- ============================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  page_url text,
  status text not null default 'received',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages(created_at desc);

create index if not exists contact_messages_status_idx
  on public.contact_messages(status);

drop trigger if exists contact_messages_touch_updated_at on public.contact_messages;
create trigger contact_messages_touch_updated_at before update on public.contact_messages
  for each row execute function public.touch_updated_at();

alter table public.contact_messages enable row level security;

drop policy if exists "Contact messages: admin read" on public.contact_messages;
create policy "Contact messages: admin read"
  on public.contact_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
