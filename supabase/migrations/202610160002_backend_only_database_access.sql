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
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.students, public.admins, public.penalties, public.appeals,
  public.notifications, public.service_sessions, public.achievements,
  public.activity_log, public.admin_logs
to service_role;

grant usage, select on all sequences in schema public to service_role;

revoke all on function public.is_active_admin() from public, anon, authenticated;
revoke all on function public.student_owns_row(jsonb) from public, anon, authenticated;
revoke all on function public.link_current_student(text) from public, anon, authenticated;
revoke all on function public.link_current_admin() from public, anon, authenticated;
revoke all on function public.set_my_notification_read(bigint, boolean) from public, anon, authenticated;
revoke all on function public.delete_my_notifications(bigint[]) from public, anon, authenticated;
