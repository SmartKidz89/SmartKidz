-- Smart Kidz: Lesson Builder (Parents + Teachers)
-- Adds teacher/student mapping and custom lesson storage.

create table if not exists teacher_students (
  teacher_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, child_id)
);

create table if not exists custom_lessons (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_by_role text not null default 'parent',
  child_id uuid references children(id) on delete set null,
  year_level int not null check (year_level between 1 and 6),
  subject_id text not null references subjects(id) on delete cascade,
  prompt text not null,
  goal_type text not null default 'reinforce',
  preferred_style text not null default 'story',
  lesson_json jsonb not null,
  created_at timestamptz not null default now()
);

alter table teacher_students enable row level security;
alter table custom_lessons enable row level security;

-- teacher_students: teacher can read/write their mappings (admin/service role can manage as needed)
create policy "teacher_students: teacher read"
on teacher_students for select
using (auth.uid() = teacher_id);

create policy "teacher_students: teacher insert"
on teacher_students for insert
with check (auth.uid() = teacher_id);

create policy "teacher_students: teacher delete"
on teacher_students for delete
using (auth.uid() = teacher_id);

-- custom_lessons:
-- creator can read/write their own
create policy "custom_lessons: creator read"
on custom_lessons for select
using (auth.uid() = created_by);

create policy "custom_lessons: creator insert"
on custom_lessons for insert
with check (auth.uid() = created_by);

create policy "custom_lessons: creator update"
on custom_lessons for update
using (auth.uid() = created_by);

create policy "custom_lessons: creator delete"
on custom_lessons for delete
using (auth.uid() = created_by);

-- if attached to a child, the parent of that child can read it too
create policy "custom_lessons: parent via child read"
on custom_lessons for select
using (
  child_id is not null
  and exists (select 1 from children c where c.id = custom_lessons.child_id and c.parent_id = auth.uid())
);

-- if attached to a child, a teacher mapped to that child can read it
create policy "custom_lessons: teacher via mapping read"
on custom_lessons for select
using (
  child_id is not null
  and exists (select 1 from teacher_students ts where ts.child_id = custom_lessons.child_id and ts.teacher_id = auth.uid())
);
