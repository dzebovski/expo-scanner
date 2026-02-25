-- Expo Scanner: companies + image_assets
-- Run this in Supabase SQL Editor (or use Supabase CLI: supabase db push)

-- Companies (extracted from booth photos + user edits)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  website text,
  short_description text,
  country text,
  city text,
  booth text,
  emails jsonb default '[]'::jsonb,
  phones jsonb default '[]'::jsonb,
  product_categories jsonb default '[]'::jsonb,
  confidence real,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Image assets (links to Supabase Storage)
create table if not exists public.image_assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_image_assets_company_id on public.image_assets(company_id);
create index if not exists idx_companies_created_at on public.companies(created_at desc);

-- RLS: enable then allow service role full access (your Next.js API uses service_role key)
alter table public.companies enable row level security;
alter table public.image_assets enable row level security;

-- Allow service_role (server-side key) full access. Anon has no policies = no direct access.
create policy "Service role full access on companies"
  on public.companies for all to service_role using (true) with check (true);
create policy "Service role full access on image_assets"
  on public.image_assets for all to service_role using (true) with check (true);
