-- Smart Kidz: Attempts table (for practice history, including writing studio)

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id text not null,
  response_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_created_at_idx on attempts(user_id, created_at desc);

alter table attempts enable row level security;

create policy "attempts: owner read"
on attempts for select
using (auth.uid() = user_id);

create policy "attempts: owner insert"
on attempts for insert
with check (auth.uid() = user_id);

create policy "attempts: owner delete"
on attempts for delete
using (auth.uid() = user_id);
