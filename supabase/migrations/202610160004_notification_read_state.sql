create table if not exists public.notification_reads (
  student_id bigint not null references public.students(id) on delete cascade,
  notification_id integer not null references public.notifications(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (student_id, notification_id)
);

alter table public.notification_reads enable row level security;
revoke all on table public.notification_reads from public, anon, authenticated;
grant select, insert, update, delete on table public.notification_reads to service_role;
