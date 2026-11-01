begin;

create unique index if not exists students_student_id_number_uidx
  on public.students (student_id_number)
  where student_id_number is not null;

alter table public.penalties
  add column if not exists student_profile_id bigint;
alter table public.appeals
  add column if not exists student_profile_id bigint;
alter table public.service_sessions
  add column if not exists student_profile_id bigint;
alter table public.achievements
  add column if not exists student_profile_id bigint;
alter table public.notifications
  add column if not exists student_profile_id bigint;
alter table public.notification_reads
  add column if not exists student_profile_id bigint;
alter table public.activity_log
  add column if not exists admin_profile_id uuid;

update public.penalties child
set student_profile_id = student.id
from public.students student
where child.student_profile_id is null
  and nullif(btrim(child.student_id), '') = student.student_id_number;

update public.appeals child
set student_profile_id = student.id
from public.students student
where child.student_profile_id is null
  and nullif(btrim(child.student_id), '') = student.student_id_number;

update public.service_sessions child
set student_profile_id = student.id
from public.students student
where child.student_profile_id is null
  and nullif(btrim(child.student_id), '') = student.student_id_number;

update public.achievements child
set student_profile_id = student.id
from public.students student
where child.student_profile_id is null
  and nullif(btrim(child.student_id), '') = student.student_id_number;

update public.notifications child
set student_profile_id = student.id
from public.students student
where child.student_profile_id is null
  and nullif(btrim(child.student_id), '') = student.student_id_number;

update public.notifications
set student_id = null
where student_id is not null
  and nullif(btrim(student_id), '') is null;

update public.notification_reads child
set student_profile_id = student.id
from public.students student
where child.student_profile_id is null
  and nullif(btrim(child.student_id), '') = student.id::text;

update public.activity_log log
set admin_profile_id = admin.id
from public.admins admin
where log.admin_profile_id is null
  and nullif(btrim(log.admin_id), '') = admin.id::text;

create index if not exists penalties_student_profile_status_created_idx
  on public.penalties (student_profile_id, status, created_at desc);
create index if not exists appeals_student_profile_created_idx
  on public.appeals (student_profile_id, created_at desc);
create index if not exists service_sessions_student_profile_date_idx
  on public.service_sessions (student_profile_id, scheduled_date);
create index if not exists achievements_student_profile_badge_idx
  on public.achievements (student_profile_id, badge_key)
  where student_profile_id is not null;
create index if not exists notifications_student_profile_created_idx
  on public.notifications (student_profile_id, created_at desc);
create unique index if not exists notification_reads_student_profile_notification_uidx
  on public.notification_reads (student_profile_id, notification_id)
  where student_profile_id is not null;
create index if not exists activity_log_admin_profile_created_idx
  on public.activity_log (admin_profile_id, created_at desc);

alter table public.penalties
  add constraint penalties_student_profile_id_fkey
  foreign key (student_profile_id) references public.students (id)
  on delete set null not valid;
alter table public.appeals
  add constraint appeals_student_profile_id_fkey
  foreign key (student_profile_id) references public.students (id)
  on delete set null not valid;
alter table public.service_sessions
  add constraint service_sessions_student_profile_id_fkey
  foreign key (student_profile_id) references public.students (id)
  on delete set null not valid;
alter table public.achievements
  add constraint achievements_student_profile_id_fkey
  foreign key (student_profile_id) references public.students (id)
  on delete set null not valid;
alter table public.notifications
  add constraint notifications_student_profile_id_fkey
  foreign key (student_profile_id) references public.students (id)
  on delete set null not valid;
alter table public.notification_reads
  add constraint notification_reads_student_profile_id_fkey
  foreign key (student_profile_id) references public.students (id)
  on delete set null not valid;
alter table public.activity_log
  add constraint activity_log_admin_profile_id_fkey
  foreign key (admin_profile_id) references public.admins (id)
  on delete set null not valid;

alter table public.penalties validate constraint penalties_student_profile_id_fkey;
alter table public.appeals validate constraint appeals_student_profile_id_fkey;
alter table public.service_sessions validate constraint service_sessions_student_profile_id_fkey;
alter table public.achievements validate constraint achievements_student_profile_id_fkey;
alter table public.notifications validate constraint notifications_student_profile_id_fkey;
alter table public.notification_reads validate constraint notification_reads_student_profile_id_fkey;
alter table public.activity_log validate constraint activity_log_admin_profile_id_fkey;

create or replace function public.sync_student_profile_reference()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if nullif(btrim(new.student_id), '') is null then
    if tg_table_name = 'notifications' then
      new.student_id := null;
      new.student_profile_id := null;
      return new;
    end if;

    raise exception 'A valid student ID is required for this record.'
      using errcode = '23503';
  end if;

  select student.id
  into new.student_profile_id
  from public.students student
  where student.student_id_number = btrim(new.student_id);

  if new.student_profile_id is null then
    raise exception 'The student ID does not match an existing student profile.'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create or replace function public.sync_notification_read_student_reference()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select student.id
  into new.student_profile_id
  from public.students student
  where student.id::text = nullif(btrim(new.student_id), '');

  if new.student_profile_id is null then
    raise exception 'The student profile does not exist for this notification read.'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create or replace function public.sync_activity_log_admin_reference()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select admin.id
  into new.admin_profile_id
  from public.admins admin
  where admin.id::text = nullif(btrim(new.admin_id), '');

  if new.admin_profile_id is null then
    raise exception 'The administrator profile does not exist for this activity log.'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create trigger penalties_sync_student_profile_reference
before insert or update of student_id on public.penalties
for each row execute function public.sync_student_profile_reference();
create trigger appeals_sync_student_profile_reference
before insert or update of student_id on public.appeals
for each row execute function public.sync_student_profile_reference();
create trigger service_sessions_sync_student_profile_reference
before insert or update of student_id on public.service_sessions
for each row execute function public.sync_student_profile_reference();
create trigger achievements_sync_student_profile_reference
before insert or update of student_id on public.achievements
for each row execute function public.sync_student_profile_reference();
create trigger notifications_sync_student_profile_reference
before insert or update of student_id on public.notifications
for each row execute function public.sync_student_profile_reference();
create trigger notification_reads_sync_student_profile_reference
before insert or update of student_id on public.notification_reads
for each row execute function public.sync_notification_read_student_reference();
create trigger activity_log_sync_admin_profile_reference
before insert or update of admin_id on public.activity_log
for each row execute function public.sync_activity_log_admin_reference();

revoke all on function public.sync_student_profile_reference() from public, anon, authenticated;
revoke all on function public.sync_notification_read_student_reference() from public, anon, authenticated;
revoke all on function public.sync_activity_log_admin_reference() from public, anon, authenticated;
grant execute on function public.sync_student_profile_reference() to service_role;
grant execute on function public.sync_notification_read_student_reference() to service_role;
grant execute on function public.sync_activity_log_admin_reference() to service_role;

commit;
