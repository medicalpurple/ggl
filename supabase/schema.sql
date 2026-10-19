-- Run this once in Supabase: SQL Editor -> New query -> Run

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  body       text not null check (char_length(btrim(body)) between 1 and 300),
  created_at timestamptz not null default now(),
  is_read    boolean not null default false
);

alter table public.messages enable row level security;

-- Visitors (anon) may ONLY insert, and ONLY the body column.
revoke all on public.messages from anon;
grant insert (body) on public.messages to anon;

create policy "anyone can send a message"
  on public.messages for insert to anon
  with check (true);

-- Only a signed-in user (you) can read, mark as read, or delete.
create policy "owner can read"   on public.messages for select to authenticated using (true);
create policy "owner can update" on public.messages for update to authenticated using (true) with check (true);
create policy "owner can delete" on public.messages for delete to authenticated using (true);
