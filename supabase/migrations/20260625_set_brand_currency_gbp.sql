-- Backfill the brand currency so existing environments charge and display GBP.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'site_settings'
  ) then
    update public.site_settings
      set value = jsonb_set(coalesce(value, '{}'::jsonb), '{currency}', to_jsonb('gbp'::text), true),
          updated_at = now()
      where key = 'brand'
        and coalesce(value->>'currency', '') <> 'gbp';
  end if;
end $$;
