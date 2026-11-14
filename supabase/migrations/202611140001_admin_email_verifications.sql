create table if not exists public.admin_email_verifications (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.admins(id) on delete cascade,
  purpose text not null check (purpose in ('admin', 'student')),
  email text not null,
  code_hash text not null,
  attempts smallint not null default 0 check (attempts between 0 and 5),
  expires_at timestamptz not null,
  verified_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_email_verifications_expiry_idx
  on public.admin_email_verifications (expires_at);

create index if not exists admin_email_verifications_requester_purpose_idx
  on public.admin_email_verifications (requester_id, purpose);

alter table public.admin_email_verifications enable row level security;

revoke all on table public.admin_email_verifications from public, anon, authenticated;
grant all on table public.admin_email_verifications to service_role;
