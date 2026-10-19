-- =====================================================================
-- Beyond Tomorrow | 04_resources.sql
-- Run AFTER 01 and 02. Adds the Resources module's table, same pattern as
-- the other reference tables: public read, admin write, audited.
-- Add rows only with a source_url and last_verified date.
-- =====================================================================

create table if not exists public.resources (
  id             uuid primary key default gen_random_uuid(),
  title          text not null unique,
  category       text not null check (category in
                   ('applications','funding','cost_planning','wellness',
                    'academic_support','connectivity','scam_safety')),
  summary        text not null,
  url            text,
  source_url     text,
  last_verified  date,
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users (id) on delete set null
);

create index if not exists idx_resources_category on public.resources (category);

drop trigger if exists touch_audit on public.resources;
create trigger touch_audit before insert or update on public.resources
  for each row execute function public.touch_audit();

alter table public.resources enable row level security;

drop policy if exists "public read" on public.resources;
create policy "public read" on public.resources
  for select to anon, authenticated using (true);

drop policy if exists "admin insert" on public.resources;
create policy "admin insert" on public.resources
  for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "admin update" on public.resources;
create policy "admin update" on public.resources
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin delete" on public.resources;
create policy "admin delete" on public.resources
  for delete to authenticated using ((select public.is_admin()));

revoke insert, update, delete on public.resources from anon;
