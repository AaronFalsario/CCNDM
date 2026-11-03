alter table public.students
  add column if not exists must_change_password boolean not null default false;

create table if not exists public.student_invitation_tokens (
  id uuid primary key default gen_random_uuid(),
  student_profile_id bigint not null references public.students(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists student_invitation_tokens_expiry_idx
  on public.student_invitation_tokens (expires_at);

alter table public.student_invitation_tokens enable row level security;

revoke all on table public.student_invitation_tokens from public, anon, authenticated;
grant all on table public.student_invitation_tokens to service_role;
