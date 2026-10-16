create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  account_id text not null,
  role text not null check (role in ('student', 'admin')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_tokens_expiry_idx
  on public.password_reset_tokens (expires_at);

alter table public.password_reset_tokens enable row level security;

revoke all on table public.password_reset_tokens from public, anon, authenticated;
grant all on table public.password_reset_tokens to service_role;
