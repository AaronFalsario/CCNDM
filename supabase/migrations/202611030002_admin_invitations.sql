alter table public.admins
  add column if not exists invitation_pending boolean not null default false;

create table if not exists public.admin_invitation_tokens (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid not null references public.admins(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_invitation_tokens_expiry_idx
  on public.admin_invitation_tokens (expires_at);

create unique index if not exists admin_invitation_tokens_one_pending_per_admin_idx
  on public.admin_invitation_tokens (admin_profile_id)
  where used_at is null;

alter table public.admin_invitation_tokens enable row level security;

revoke all on table public.admin_invitation_tokens from public, anon, authenticated;
grant all on table public.admin_invitation_tokens to service_role;
