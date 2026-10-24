-- =====================================================================
-- Beyond Tomorrow | 01_schema_and_rls.sql
-- Owner: Daniel (Database)
-- Run in: Supabase Dashboard > SQL Editor (runs as the postgres role)
-- Order:  01_schema_and_rls.sql -> 02_seed.sql -> 03_rls_tests.sql
-- Safe to re-run: tables use IF NOT EXISTS, policies and triggers are
-- dropped and recreated.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- ---------------------------------------------------------------------

-- Admin check. The role lives in app_metadata, which users CANNOT edit
-- (user_metadata they can, so never use that for permissions).
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- Audit trigger function: stamps who changed a reference row and when
-- (answers the STRIDE "repudiation" question: are admin changes logged?).
create or replace function public.touch_audit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. REFERENCE TABLES (public read, admin write)
-- ---------------------------------------------------------------------

create table if not exists public.institutions (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique,
  aps_method_code  text not null,            -- tells the engine which ApsStrategy to run
  source_url       text,
  last_verified    date,
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users (id) on delete set null
);

create table if not exists public.aps_bands (   -- mark -> points, per institution
  id              uuid primary key default gen_random_uuid(),
  institution_id  uuid not null references public.institutions (id) on delete cascade,
  min_mark        int  not null check (min_mark between 0 and 100),
  max_mark        int  not null check (max_mark between 0 and 100),
  points          int  not null check (points >= 0),
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users (id) on delete set null,
  check (min_mark <= max_mark),
  unique (institution_id, min_mark)
);

create table if not exists public.subjects (    -- fixed codes, not free text
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,             -- e.g. MATH, MATHLIT, PHSC
  name        text not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

create table if not exists public.courses (
  id                    uuid primary key default gen_random_uuid(),
  institution_id        uuid not null references public.institutions (id) on delete cascade,
  name                  text not null,
  field_tags            text[] not null default '{}',   -- matched against student interests
  min_aps               int not null check (min_aps >= 0),
  province              text check (province in (
                          'Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo',
                          'Mpumalanga','Northern Cape','North West','Western Cape')),
  application_deadline  date,
  application_url       text,
  source_url            text,
  last_verified         date,
  updated_at            timestamptz not null default now(),
  updated_by            uuid references auth.users (id) on delete set null,
  unique (institution_id, name)
);

create table if not exists public.course_requirements (   -- "Maths at least 60"
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses (id) on delete cascade,
  subject_id  uuid not null references public.subjects (id) on delete restrict,
  min_mark    int  not null check (min_mark between 0 and 100),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null,
  unique (course_id, subject_id)
);

create table if not exists public.funding_sources (
  id                         uuid primary key default gen_random_uuid(),
  name                       text not null unique,
  type                       text not null check (type in ('bursary','loan')),
  description                text not null default '',
  income_ceiling             numeric(12,2),
  disability_income_ceiling  numeric(12,2),
  eligible_fields            text[] not null default '{}',  -- empty array = any field
  eligible_provinces         text[] not null default '{}',  -- empty array = any province
  min_average                int check (min_average between 0 and 100),
  deadline                   date,
  source_url                 text,
  last_verified              date,
  updated_at                 timestamptz not null default now(),
  updated_by                 uuid references auth.users (id) on delete set null
);

create table if not exists public.scoring_weights (       -- tunable without redeploying
  key         text primary key,
  value       numeric not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

create table if not exists public.checklist_tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null unique,
  est_days    int  not null default 1 check (est_days >= 0),  -- drives the deadline-risk nudge
  sort_order  int  not null default 0,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null
);

-- ---------------------------------------------------------------------
-- 3. STUDENT TABLES (owner-only via RLS)
-- ---------------------------------------------------------------------

create table if not exists public.student_profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  province       text check (province in (
                   'Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo',
                   'Mpumalanga','Northern Cape','North West','Western Cape')),
  -- A bracket, never an exact income. Breaks line up with the published
  -- NSFAS thresholds (re-verify each year on nsfas.org.za).
  income_bracket text check (income_bracket in
                   ('up_to_350k','350k_to_600k','above_600k','prefer_not_to_say')),
  interests      text[] not null default '{}',
  created_at     timestamptz not null default now()
);

create table if not exists public.student_marks (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.student_profiles (id) on delete cascade,
  subject_id  uuid not null references public.subjects (id) on delete restrict,
  mark        int  not null check (mark between 0 and 100),
  unique (student_id, subject_id)
);

create table if not exists public.checklist_progress (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.student_profiles (id) on delete cascade,
  task_id       uuid not null references public.checklist_tasks (id) on delete cascade,
  completed_at  timestamptz not null default now(),
  unique (student_id, task_id)
);

create table if not exists public.events (                -- append-only usage log
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.student_profiles (id) on delete cascade,
  event_type  text not null check (char_length(event_type) <= 50),
  ref_id      uuid,
  created_at  timestamptz not null default now()
);

create table if not exists public.recommendation_runs (   -- append-only, reproducible results
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.student_profiles (id) on delete cascade,
  weights_snapshot  jsonb not null,
  results           jsonb not null,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. INDEXES (foreign keys used by RLS and joins)
-- ---------------------------------------------------------------------
create index if not exists idx_aps_bands_institution   on public.aps_bands (institution_id);
create index if not exists idx_courses_institution     on public.courses (institution_id);
create index if not exists idx_courses_field_tags      on public.courses using gin (field_tags);
create index if not exists idx_course_req_course       on public.course_requirements (course_id);
create index if not exists idx_course_req_subject      on public.course_requirements (subject_id);
create index if not exists idx_marks_student           on public.student_marks (student_id);
create index if not exists idx_marks_subject           on public.student_marks (subject_id);
create index if not exists idx_progress_student        on public.checklist_progress (student_id);
create index if not exists idx_progress_task           on public.checklist_progress (task_id);
create index if not exists idx_events_student_time     on public.events (student_id, created_at);
create index if not exists idx_runs_student_time       on public.recommendation_runs (student_id, created_at);

-- ---------------------------------------------------------------------
-- 5. AUDIT TRIGGERS on every reference table
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['institutions','aps_bands','subjects','courses',
                           'course_requirements','funding_sources',
                           'scoring_weights','checklist_tasks']
  loop
    execute format('drop trigger if exists touch_audit on public.%I', t);
    execute format('create trigger touch_audit before insert or update on public.%I
                    for each row execute function public.touch_audit()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY: switch on for EVERY table
-- ---------------------------------------------------------------------
alter table public.institutions         enable row level security;
alter table public.aps_bands            enable row level security;
alter table public.subjects             enable row level security;
alter table public.courses              enable row level security;
alter table public.course_requirements  enable row level security;
alter table public.funding_sources      enable row level security;
alter table public.scoring_weights      enable row level security;
alter table public.checklist_tasks      enable row level security;
alter table public.student_profiles     enable row level security;
alter table public.student_marks        enable row level security;
alter table public.checklist_progress   enable row level security;
alter table public.events               enable row level security;
alter table public.recommendation_runs  enable row level security;

-- 6a. Reference tables: anyone can read, only admins can write.
-- (select public.is_admin()) is wrapped in a sub-select so Postgres
-- evaluates it once per query instead of once per row.
do $$
declare t text;
begin
  foreach t in array array['institutions','aps_bands','subjects','courses',
                           'course_requirements','funding_sources',
                           'scoring_weights','checklist_tasks']
  loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I
                    for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('create policy "admin insert" on public.%I
                    for insert to authenticated
                    with check ((select public.is_admin()))', t);

    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('create policy "admin update" on public.%I
                    for update to authenticated
                    using ((select public.is_admin()))
                    with check ((select public.is_admin()))', t);

    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin delete" on public.%I
                    for delete to authenticated
                    using ((select public.is_admin()))', t);
  end loop;
end $$;

-- 6b. student_profiles: a student sees and changes only their own row.
drop policy if exists "own profile select" on public.student_profiles;
create policy "own profile select" on public.student_profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "own profile insert" on public.student_profiles;
create policy "own profile insert" on public.student_profiles
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "own profile update" on public.student_profiles;
create policy "own profile update" on public.student_profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "own profile delete" on public.student_profiles;
create policy "own profile delete" on public.student_profiles
  for delete to authenticated using (id = (select auth.uid()));

-- 6c. marks and checklist progress: full access to own rows only.
do $$
declare t text;
begin
  foreach t in array array['student_marks','checklist_progress']
  loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I
                    for all to authenticated
                    using (student_id = (select auth.uid()))
                    with check (student_id = (select auth.uid()))', t);
  end loop;
end $$;

-- 6d. events and recommendation_runs: append-only. Read and insert own rows.
do $$
declare t text;
begin
  foreach t in array array['events','recommendation_runs']
  loop
    execute format('drop policy if exists "own select" on public.%I', t);
    execute format('create policy "own select" on public.%I
                    for select to authenticated
                    using (student_id = (select auth.uid()))', t);

    execute format('drop policy if exists "own insert" on public.%I', t);
    execute format('create policy "own insert" on public.%I
                    for insert to authenticated
                    with check (student_id = (select auth.uid()))', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 7. GRANTS: defence in depth on top of RLS
-- ---------------------------------------------------------------------
-- Logged-out visitors never touch student data.
revoke all on public.student_profiles, public.student_marks,
              public.checklist_progress, public.events,
              public.recommendation_runs from anon;

-- Logged-out visitors can read reference data but never write it.
revoke insert, update, delete on public.institutions, public.aps_bands,
              public.subjects, public.courses, public.course_requirements,
              public.funding_sources, public.scoring_weights,
              public.checklist_tasks from anon;

-- Append-only tables: no edits or deletes, even for the owner.
revoke update, delete on public.events, public.recommendation_runs from authenticated;

-- ---------------------------------------------------------------------
-- 8. TRACTION STATS (admin only, counts only, no personal data)
-- ---------------------------------------------------------------------
create or replace function public.traction_stats()
returns table (students bigint, students_with_marks bigint,
               runs bigint, tasks_completed bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;
  return query select
    (select count(*) from public.student_profiles),
    (select count(distinct student_id) from public.student_marks),
    (select count(*) from public.recommendation_runs),
    (select count(*) from public.checklist_progress);
end;
$$;

revoke all on function public.traction_stats() from public, anon;
grant execute on function public.traction_stats() to authenticated;

-- ---------------------------------------------------------------------
-- 9. MAKE A TEAM MEMBER AN ADMIN (edit the email, run once, then have
--    that person sign out and back in so their token refreshes)
-- ---------------------------------------------------------------------
-- update auth.users
--    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--  where email = 'daniel@example.com';
