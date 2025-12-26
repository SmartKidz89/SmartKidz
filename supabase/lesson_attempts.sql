-- Track every lesson attempt for analytics & reports
create table if not exists lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  lesson_id text not null,
  correct boolean not null,
  created_at timestamp with time zone default now()
);

create index if not exists idx_lesson_attempts_child on lesson_attempts(child_id);
