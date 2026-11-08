alter table public.notifications
  add column if not exists admin_profile_id uuid
    references public.admins (id) on delete cascade;

alter table public.notifications
  add column if not exists related_appeal_id text;

create index if not exists notifications_admin_profile_created_idx
  on public.notifications (admin_profile_id, created_at desc)
  where admin_profile_id is not null;
