-- Apply once in the KainCheck project SQL editor. No privileged app key is needed.
create table public.kaincheck_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 24),
  data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 6291456),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.kaincheck_user_state enable row level security;
revoke all on public.kaincheck_user_state from public, anon, authenticated;
grant select, insert, update on public.kaincheck_user_state to authenticated;
create policy "Read own KainCheck state" on public.kaincheck_user_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own KainCheck state" on public.kaincheck_user_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own KainCheck state" on public.kaincheck_user_state
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
comment on table public.kaincheck_user_state is
  'Owner-only KainCheck profile, preferences, plans and coach conversations. API keys are excluded.';
