-- =====================================================================
-- Beyond Tomorrow | 08_subjects_and_marks.sql
-- Owner: Daniel (Database)
-- Run AFTER 06_profile_and_tracking.sql. Safe to re-run.
--
-- Purpose: let the APS calculator and Profile REMEMBER a student's selected
-- subjects (with or without marks), and widen the subject list so the
-- calculator's subjects all exist in the database.
-- =====================================================================

-- 1. A subject can be selected before a mark exists.
--    (The existing CHECK mark BETWEEN 0 AND 100 already allows NULL.)
alter table public.student_marks alter column mark drop not null;

-- 2. Track when a mark last changed.
alter table public.student_marks
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists touch_updated_at on public.student_marks;
create trigger touch_updated_at before update on public.student_marks
  for each row execute function public.touch_updated_at();

-- 3. More NSC subjects. Codes are OUR identifiers (letters only, 10 or fewer,
--    to match the API's validation). Cross-check names against the Department
--    of Basic Education's NSC subject list, and add any the calculator has
--    that are missing here. Existing codes from 02_seed.sql are untouched.
insert into public.subjects (code, name) values
  ('TECHMATH',  'Technical Mathematics'),
  ('TECHSCI',   'Technical Sciences'),
  -- Home languages
  ('ZULUHL',    'isiZulu Home Language'),
  ('XHOSAHL',   'isiXhosa Home Language'),
  ('SEPEDIHL',  'Sepedi Home Language'),
  ('SESOTHOHL', 'Sesotho Home Language'),
  ('TSWANAHL',  'Setswana Home Language'),
  ('TSONGAHL',  'Xitsonga Home Language'),
  ('VENDAHL',   'Tshivenda Home Language'),
  ('SWATIHL',   'siSwati Home Language'),
  ('NDEBELEHL', 'isiNdebele Home Language'),
  ('SASLHL',    'South African Sign Language Home Language'),
  -- First additional languages
  ('ZULUFAL',   'isiZulu First Additional Language'),
  ('XHOSAFAL',  'isiXhosa First Additional Language'),
  ('SEPEDIFAL', 'Sepedi First Additional Language'),
  ('SESOTHOFAL','Sesotho First Additional Language'),
  ('TSWANAFAL', 'Setswana First Additional Language'),
  ('TSONGAFAL', 'Xitsonga First Additional Language'),
  ('VENDAFAL',  'Tshivenda First Additional Language'),
  ('SWATIFAL',  'siSwati First Additional Language'),
  ('NDEBELEFAL','isiNdebele First Additional Language'),
  -- Electives
  ('AGRMGT',    'Agricultural Management Practices'),
  ('AGRTECH',   'Agricultural Technology'),
  ('CONS',      'Consumer Studies'),
  ('HOSP',      'Hospitality Studies'),
  ('TOUR',      'Tourism'),
  ('DRAM',      'Dramatic Arts'),
  ('MUSIC',     'Music'),
  ('VISART',    'Visual Arts'),
  ('DANCE',     'Dance Studies'),
  ('DESIGN',    'Design'),
  ('CIVTECH',   'Civil Technology'),
  ('ELECTECH',  'Electrical Technology'),
  ('MECHTECH',  'Mechanical Technology'),
  ('RELST',     'Religion Studies'),
  ('EQUINE',    'Equine Studies'),
  ('MARECON',   'Maritime Economics'),
  ('MARSCI',    'Marine Sciences')
on conflict (code) do nothing;

-- 4. traction_stats(): count only students who have at least one real mark.
--    Same columns as in 06, so CREATE OR REPLACE is allowed.
create or replace function public.traction_stats()
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
    (select count(distinct student_id) from public.student_marks where mark is not null),
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
