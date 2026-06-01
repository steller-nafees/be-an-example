-- Enable realtime so customers see live status updates on /orders/:id
-- Run once in your Supabase SQL editor.
alter publication supabase_realtime add table public.orders;
