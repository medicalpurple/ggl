-- Run in Supabase SQL Editor AFTER schema.sql

alter table public.messages
  add column if not exists ip          text,
  add column if not exists user_agent  text,
  add column if not exists device_type text,
  add column if not exists os          text,
  add column if not exists browser     text,
  add column if not exists country     text,
  add column if not exists region      text,
  add column if not exists city        text,
  add column if not exists language    text,
  add column if not exists referrer    text;

-- Browsers no longer insert directly; only the /api/send function (service role) can.
drop policy if exists "anyone can send a message" on public.messages;
revoke insert (body) on public.messages from anon;
