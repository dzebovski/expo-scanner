-- Auth + RLS: user-scoped access to companies and image_assets
-- Requires Supabase Auth (Email provider). Run after 001_initial_schema.sql.

-- Add owner to companies (nullable for existing rows; new rows must set user_id)
alter table public.companies
  add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_companies_user_id on public.companies(user_id);

-- Drop old service_role-only policies so we can add user-scoped ones
drop policy if exists "Service role full access on companies" on public.companies;
drop policy if exists "Service role full access on image_assets" on public.image_assets;

-- Companies: authenticated users see/change only their rows
create policy "Users select own companies"
  on public.companies for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own companies"
  on public.companies for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own companies"
  on public.companies for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own companies"
  on public.companies for delete to authenticated
  using (auth.uid() = user_id);

-- Optional: keep service_role full access for admin/scripts
create policy "Service role full access on companies"
  on public.companies for all to service_role using (true) with check (true);

-- Image assets: access only when the linked company belongs to the user
create policy "Users select own image_assets"
  on public.image_assets for select to authenticated
  using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "Users insert own image_assets"
  on public.image_assets for insert to authenticated
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "Users update own image_assets"
  on public.image_assets for update to authenticated
  using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "Users delete own image_assets"
  on public.image_assets for delete to authenticated
  using (
    exists (
      select 1 from public.companies c
      where c.id = company_id and c.user_id = auth.uid()
    )
  );

create policy "Service role full access on image_assets"
  on public.image_assets for all to service_role using (true) with check (true);
