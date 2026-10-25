-- =====================================================================
-- Beyond Tomorrow | 06_profile_and_tracking.sql
-- Owner: Daniel (Database)
-- Run AFTER 01 to 05. Safe to re-run (IF NOT EXISTS, drop-and-recreate).
-- Adds: profile fields, the 'unsure' income bracket, application tracking,
-- funding application tracking (with the 30-day clock dates), coach progress.
--
-- PRIVACY RULES BAKED IN
--  * We store the income BRACKET, never an income amount.
--  * Special-category document codes (vulnerable child form, disability
--    annexure) can never be stored: the database rejects them.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Helper: keep updated_at fresh on student-owned tables
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1. student_profiles: new columns and the widened income bracket
-- ---------------------------------------------------------------------
alter table public.student_profiles
  add column if not exists display_name       text,
  add column if not exists grade              text,
  add column if not exists aps_goal           smallint,
  add column if not exists income_updated_at  timestamptz,
  add column if not exists consent_at         timestamptz,
  add column if not exists guardian_consent   boolean;

alter table public.student_profiles drop constraint if exists student_profiles_display_name_check;
alter table public.student_profiles add constraint student_profiles_display_name_check
  check (display_name is null or char_length(display_name) <= 50);

alter table public.student_profiles drop constraint if exists student_profiles_grade_check;
alter table public.student_profiles add constraint student_profiles_grade_check
  check (grade is null or grade in ('11','12','matric_completed','other'));

alter table public.student_profiles drop constraint if exists student_profiles_aps_goal_check;
alter table public.student_profiles add constraint student_profiles_aps_goal_check
  check (aps_goal is null or aps_goal between 0 and 900);   -- scales differ by institution (some run to 800)

-- Drop whatever check constraint currently guards income_bracket (name-independent),
-- then add the widened one.
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
     where conrelid = 'public.student_profiles'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%income_bracket%'
  loop
    execute format('alter table public.student_profiles drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.student_profiles add constraint student_profiles_income_bracket_check
  check (income_bracket is null or income_bracket in
    ('up_to_350k','350k_to_600k','above_600k','unsure','prefer_not_to_say'));

-- ---------------------------------------------------------------------
-- 2. student_applications: applications to institutions (also the shortlist)
-- ---------------------------------------------------------------------
create table if not exists public.student_applications (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.student_profiles (id) on delete cascade,
  institution_key  text not null check (char_length(institution_key) <= 80),  -- slug from the static directory
  institution_id   uuid references public.institutions (id) on delete set null,
  programme_name   text not null check (char_length(programme_name) <= 120),
  status           text not null default 'planning'
                   check (status in ('planning','in_progress','submitted','offer','accepted','declined','unsuccessful')),
  deadline         date,
  submitted_on     date,
  updated_at       timestamptz not null default now(),
  unique (student_id, institution_key, programme_name)
);

-- ---------------------------------------------------------------------
-- 3. funding_applications: self-reported stage and the 30-day clock dates
-- ---------------------------------------------------------------------
create table if not exists public.funding_applications (
  id                       uuid primary key default gen_random_uuid(),
  student_id               uuid not null references public.student_profiles (id) on delete cascade,
  funding_source_id        uuid references public.funding_sources (id) on delete set null,
  funding_name             text not null check (char_length(funding_name) <= 120),   -- snapshot for display
  status                   text not null default 'planning'
                           check (status in ('planning','in_progress','submitted','incomplete',
                                             'under_review','approved','unsuccessful','appealing')),
  status_changed_on        date,
  incomplete_notified_on   date,      -- starts the "missing documents" clock
  outcome_notified_on      date,      -- starts the "appeal" clock
  outstanding_docs         text[] not null default '{}',
  updated_at               timestamptz not null default now(),
  -- special-category document codes are never stored
  check (not (outstanding_docs && array['vulnerable_child_form','disability_annexure']::text[])),
  unique (student_id, funding_name)
);

-- ---------------------------------------------------------------------
-- 4. readiness_progress: the coach's pre-submission ticks (non-special only)
-- ---------------------------------------------------------------------
create table if not exists public.readiness_progress (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references public.student_profiles (id) on delete cascade,
  document_code  text not null check (char_length(document_code) <= 60
                                      and document_code not in ('vulnerable_child_form','disability_annexure')),
  check_code     text not null check (char_length(check_code) <= 60),
  checked        boolean not null default true,
  updated_at     timestamptz not null default now(),
  unique (student_id, document_code, check_code)
);

-- ---------------------------------------------------------------------
-- 5. Indexes and updated_at triggers
-- ---------------------------------------------------------------------
create index if not exists idx_student_apps_student   on public.student_applications (student_id);
create index if not exists idx_funding_apps_student   on public.funding_applications (student_id);
create index if not exists idx_readiness_student      on public.readiness_progress (student_id);

do $$
declare t text;
begin
  foreach t in array array['student_applications','funding_applications','readiness_progress']
  loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format('create trigger touch_updated_at before update on public.%I
                    for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 6. RLS (owner-only) and grants
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['student_applications','funding_applications','readiness_progress']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format('create policy "own rows" on public.%I
                    for all to authenticated
                    using (student_id = (select auth.uid()))
                    with check (student_id = (select auth.uid()))', t);
  end loop;
end $$;

revoke all on public.student_applications, public.funding_applications,
              public.readiness_progress from anon;

-- ---------------------------------------------------------------------
-- 7. traction_stats(): more counts, still counts only (admin only)
--    The return type changes, so the function is dropped and recreated.
-- ---------------------------------------------------------------------
drop function if exists public.traction_stats();

create function public.traction_stats()
returns table (students bigint, students_with_marks bigint, runs bigint,
               tasks_completed bigint, applications_tracked bigint,
               funding_applications_tracked bigint, readiness_ticks bigint,
               coach_starts bigint)
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
    (select count(*) from public.checklist_progress),
    (select count(*) from public.student_applications),
    (select count(*) from public.funding_applications),
    (select count(*) from public.readiness_progress),
    (select count(*) from public.events where event_type = 'coach_started');
end;
$$;

revoke all on function public.traction_stats() from public, anon;
grant execute on function public.traction_stats() to authenticated;

-- =====================================================================
-- OPTIONAL BLOCKS (off by default). Uncomment only if you need them.
-- =====================================================================

-- A. Marks over time. WARNING: changes the unique key on student_marks.
--    Any app code that upserts with onConflict 'student_id,subject_id' must
--    be updated to include 'period' first. Skip unless you really need it.
-- alter table public.student_marks
--   add column if not exists period text not null default 'current'
--   check (period in ('current','term1','term2','term3','prelim','final','goal'));
-- do $$
-- declare r record;
-- begin
--   for r in select conname from pg_constraint
--            where conrelid = 'public.student_marks'::regclass and contype = 'u'
--              and pg_get_constraintdef(oid) ilike '%(student_id, subject_id)%'
--   loop execute format('alter table public.student_marks drop constraint %I', r.conname); end loop;
-- end $$;
-- alter table public.student_marks
--   add constraint student_marks_unique unique (student_id, subject_id, period);

-- B. Opt-in household answers (non-special only). Default: do not remember.
-- create table if not exists public.household_profiles (
--   student_id uuid primary key references public.student_profiles (id) on delete cascade,
--   age_band text check (age_band in ('under18','18to34','35plus')),
--   supporter text check (supporter in ('both_parents','one_parent','legal_guardian','spouse','myself','other_relative')),
--   parents_on_record text check (parents_on_record in ('both','one','none','unsure')),
--   supporter_is_parent_on_record text check (supporter_is_parent_on_record in ('yes','no','unsure')),
--   saved_at timestamptz not null default now()
-- );
-- alter table public.household_profiles enable row level security;
-- create policy "own rows" on public.household_profiles for all to authenticated
--   using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));
-- revoke all on public.household_profiles from anon;
