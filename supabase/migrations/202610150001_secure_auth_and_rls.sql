alter table public.students
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

alter table public.admins
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

create unique index if not exists students_auth_user_id_uidx
  on public.students (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists admins_auth_user_id_uidx
  on public.admins (auth_user_id)
  where auth_user_id is not null;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.auth_user_id = (select auth.uid())
      and a.status = 'active'
  );
$$;

create or replace function public.student_owns_row(p_row jsonb)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.students s
    where s.auth_user_id = (select auth.uid())
      and s.student_id_number = coalesce(p_row ->> 'student_id', p_row ->> 'student_id_number')
      and lower(coalesce(s.status, 'active')) not in ('inactive', 'suspended')
  );
$$;

create or replace function public.link_current_student(p_student_id text default null)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_email text;
  v_profile_id bigint;
  v_matches bigint;
begin
  select lower(u.email)
  into v_user_email
  from auth.users u
  where u.id = (select auth.uid())
    and u.email_confirmed_at is not null;

  if v_user_email is null then
    raise exception 'A confirmed account is required.';
  end if;

  select count(*), min(s.id)
  into v_matches, v_profile_id
  from public.students s
  where lower(s.email) = v_user_email
    and (p_student_id is null or s.student_id_number = p_student_id);

  if v_matches <> 1 then
    raise exception 'No unique pre-enrolled student profile matches this account.';
  end if;

  update public.students
  set auth_user_id = (select auth.uid())
  where id = v_profile_id
    and (auth_user_id is null or auth_user_id = (select auth.uid()))
    and lower(coalesce(status, 'active')) not in ('inactive', 'suspended');

  if not found then
    raise exception 'This student profile is already linked to another account.';
  end if;

  return v_profile_id;
end;
$$;

create or replace function public.link_current_admin()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_email text;
  v_profile_id bigint;
  v_matches bigint;
begin
  select lower(u.email)
  into v_user_email
  from auth.users u
  where u.id = (select auth.uid())
    and u.email_confirmed_at is not null;

  if v_user_email is null then
    raise exception 'A confirmed account is required.';
  end if;

  select count(*), min(a.id)
  into v_matches, v_profile_id
  from public.admins a
  where lower(a.email) = v_user_email
    and a.status = 'active';

  if v_matches <> 1 then
    raise exception 'No unique active administrator profile matches this account.';
  end if;

  update public.admins
  set auth_user_id = (select auth.uid())
  where id = v_profile_id
    and (auth_user_id is null or auth_user_id = (select auth.uid()));

  if not found then
    raise exception 'This administrator profile is already linked to another account.';
  end if;

  return v_profile_id;
end;
$$;

create or replace function public.set_my_notification_read(
  p_notification_id bigint default null,
  p_include_broadcast boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications n
  set is_read = true,
      read_at = now()
  where (p_notification_id is null or n.id = p_notification_id)
    and (
      public.is_active_admin()
      or public.student_owns_row(to_jsonb(n))
      or (
        p_include_broadcast
        and coalesce(to_jsonb(n) ->> 'student_id', '') = ''
      )
    );
end;
$$;

create or replace function public.delete_my_notifications(p_notification_ids bigint[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.notifications n
  where n.id = any(p_notification_ids)
    and (public.is_active_admin() or public.student_owns_row(to_jsonb(n)));
end;
$$;

revoke all on function public.is_active_admin() from public, anon;
revoke all on function public.student_owns_row(jsonb) from public, anon;
revoke all on function public.link_current_student(text) from public, anon;
revoke all on function public.link_current_admin() from public, anon;
revoke all on function public.set_my_notification_read(bigint, boolean) from public, anon;
revoke all on function public.delete_my_notifications(bigint[]) from public, anon;

grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.student_owns_row(jsonb) to authenticated;
grant execute on function public.link_current_student(text) to authenticated;
grant execute on function public.link_current_admin() to authenticated;
grant execute on function public.set_my_notification_read(bigint, boolean) to authenticated;
grant execute on function public.delete_my_notifications(bigint[]) to authenticated;

do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'students', 'admins', 'penalties', 'appeals', 'notifications',
        'service_sessions', 'achievements', 'activity_log', 'admin_logs'
      )
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end;
$$;

alter table public.students enable row level security;
alter table public.admins enable row level security;
alter table public.penalties enable row level security;
alter table public.appeals enable row level security;
alter table public.notifications enable row level security;
alter table public.service_sessions enable row level security;
alter table public.achievements enable row level security;
alter table public.activity_log enable row level security;
alter table public.admin_logs enable row level security;

revoke all on table
  public.students, public.admins, public.penalties, public.appeals,
  public.notifications, public.service_sessions, public.achievements,
  public.activity_log, public.admin_logs
from public, anon;

grant select, insert, update, delete on table
  public.students, public.admins, public.penalties, public.appeals,
  public.notifications, public.service_sessions, public.achievements,
  public.activity_log, public.admin_logs
to authenticated;

create policy students_read_own_or_admin
  on public.students for select to authenticated
  using (
    (
      auth_user_id = (select auth.uid())
      and lower(coalesce(status, 'active')) not in ('inactive', 'suspended')
    )
    or (select public.is_active_admin())
  );

create policy students_admin_manage
  on public.students for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

create policy admins_read_own_or_admin
  on public.admins for select to authenticated
  using (auth_user_id = (select auth.uid()) or (select public.is_active_admin()));

create policy penalties_read_own_or_admin
  on public.penalties for select to authenticated
  using (public.student_owns_row(to_jsonb(penalties)) or (select public.is_active_admin()));

create policy penalties_admin_manage
  on public.penalties for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

create policy appeals_read_own_or_admin
  on public.appeals for select to authenticated
  using (public.student_owns_row(to_jsonb(appeals)) or (select public.is_active_admin()));

create policy appeals_submit_own
  on public.appeals for insert to authenticated
  with check (
    public.student_owns_row(to_jsonb(appeals))
    and lower(coalesce(to_jsonb(appeals) ->> 'status', 'pending')) = 'pending'
    and coalesce(to_jsonb(appeals) ->> 'reviewed_by', '') = ''
    and coalesce(to_jsonb(appeals) ->> 'admin_remarks', '') = ''
  );

create policy appeals_admin_manage
  on public.appeals for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

create policy notifications_read_own_or_broadcast
  on public.notifications for select to authenticated
  using (
    public.student_owns_row(to_jsonb(notifications))
    or coalesce(to_jsonb(notifications) ->> 'student_id', '') = ''
    or (select public.is_active_admin())
  );

create policy notifications_admin_manage
  on public.notifications for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

create policy service_sessions_read_own_or_admin
  on public.service_sessions for select to authenticated
  using (public.student_owns_row(to_jsonb(service_sessions)) or (select public.is_active_admin()));

create policy service_sessions_admin_manage
  on public.service_sessions for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

create policy achievements_read_own_or_admin
  on public.achievements for select to authenticated
  using (public.student_owns_row(to_jsonb(achievements)) or (select public.is_active_admin()));

create policy achievements_admin_manage
  on public.achievements for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

create policy activity_log_admin_only
  on public.activity_log for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

create policy admin_logs_admin_only
  on public.admin_logs for all to authenticated
  using ((select public.is_active_admin()))
  with check ((select public.is_active_admin()));

alter table public.students drop column if exists password;
alter table public.admins drop column if exists password_hash;
