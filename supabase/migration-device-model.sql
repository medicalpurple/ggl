-- Run in Supabase SQL Editor
alter table public.messages
  add column if not exists device_model text,
  add column if not exists os_version   text,
  add column if not exists screen       text,
  add column if not exists timezone     text;
