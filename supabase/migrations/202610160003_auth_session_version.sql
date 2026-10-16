alter table public.students
  add column if not exists session_version uuid not null default gen_random_uuid();

alter table public.admins
  add column if not exists session_version uuid not null default gen_random_uuid();
