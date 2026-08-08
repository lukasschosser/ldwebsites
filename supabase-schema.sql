-- Im Supabase Dashboard unter "SQL Editor" einfügen und ausführen.

create table website_checks (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  ip_hash text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index website_checks_domain_idx on website_checks (domain, created_at desc);
create index website_checks_iphash_idx on website_checks (ip_hash, created_at desc);

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security aktivieren: Diese Tabellen sind NUR über den service_role Key
-- (aus den Serverless Functions) erreichbar, niemals direkt vom Browser aus.
alter table website_checks enable row level security;
alter table contact_submissions enable row level security;
