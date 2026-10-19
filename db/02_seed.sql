-- =====================================================================
-- Beyond Tomorrow | 02_seed.sql
-- Run AFTER 01_schema_and_rls.sql. Safe to re-run (ON CONFLICT DO NOTHING).
--
-- IMPORTANT: rows marked SAMPLE DATA are fictional, for testing the
-- engine and the demo only. Replace them with real, verified data
-- (with source_url and last_verified) before presenting to judges.
-- =====================================================================

-- 1. Subjects (fixed codes; add more home languages as needed)
insert into public.subjects (code, name) values
  ('MATH',    'Mathematics'),
  ('MATHLIT', 'Mathematical Literacy'),
  ('PHSC',    'Physical Sciences'),
  ('LFSC',    'Life Sciences'),
  ('ACCN',    'Accounting'),
  ('BSTD',    'Business Studies'),
  ('ECON',    'Economics'),
  ('GEOG',    'Geography'),
  ('HIST',    'History'),
  ('ENGHL',   'English Home Language'),
  ('ENGFAL',  'English First Additional Language'),
  ('AFRHL',   'Afrikaans Home Language'),
  ('AFRFAL',  'Afrikaans First Additional Language'),
  ('LO',      'Life Orientation'),
  ('INFT',    'Information Technology'),
  ('CAT',     'Computer Applications Technology'),
  ('EGD',     'Engineering Graphics and Design'),
  ('AGRS',    'Agricultural Sciences')
on conflict (code) do nothing;

-- 2. Scoring weights: STARTING ASSUMPTIONS, tune against your test personas.
insert into public.scoring_weights (key, value) values
  ('close_aps_margin',      3),     -- APS short by up to this many points = "close"
  ('close_subject_margin',  5),     -- subject short by up to this many % = "close"
  ('w_fit',                 0.5),
  ('w_margin',              0.3),
  ('w_funding',             0.2),
  ('stale_after_days',      90)     -- flag data older than this as stale
on conflict (key) do nothing;

-- 3. Checklist tasks. est_days values are PLACEHOLDER ESTIMATES: sanity-check
--    with a few real students before relying on the deadline-risk nudge.
insert into public.checklist_tasks (title, est_days, sort_order) values
  ('Shortlist courses and institutions',               3, 1),
  ('Check entry requirements and closing dates',       1, 2),
  ('Gather your supporting documents',                 5, 3),
  ('Apply for NSFAS on the official NSFAS website',    1, 4),
  ('Apply to your chosen institutions',                2, 5),
  ('Apply for matching bursaries',                     3, 6),
  ('Track outcomes and respond to offers',             1, 7)
on conflict (title) do nothing;

-- 4. NSFAS. Income thresholds are as reported by secondary sources
--    (R350,000; R600,000 for students with disabilities). Sources conflict
--    on the 2027 closing date (31 Oct vs 18 Nov 2026). 31 Oct is used here
--    as the stricter date. RE-VERIFY on https://www.nsfas.org.za and update.
insert into public.funding_sources
  (name, type, income_ceiling, disability_income_ceiling, eligible_fields,
   eligible_provinces, min_average, deadline, source_url, last_verified)
values
  ('NSFAS Bursary', 'bursary', 350000, 600000, '{}', '{}', null,
   date '2026-10-31', 'https://www.nsfas.org.za', date '2026-10-18')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- 5. SAMPLE DATA (fictional): delete before the real demo
-- ---------------------------------------------------------------------
insert into public.institutions (name, aps_method_code, source_url, last_verified)
values ('Demo University (SAMPLE DATA)', 'DEMO_BEST_SIX', 'https://example.com', current_date)
on conflict (name) do nothing;

-- Standard 7-point achievement scale, used by the sample institution only.
insert into public.aps_bands (institution_id, min_mark, max_mark, points)
select i.id, b.min_mark, b.max_mark, b.points
from public.institutions i,
     (values (80,100,7),(70,79,6),(60,69,5),(50,59,4),(40,49,3),(30,39,2),(0,29,1))
       as b(min_mark, max_mark, points)
where i.name = 'Demo University (SAMPLE DATA)'
on conflict (institution_id, min_mark) do nothing;

insert into public.courses
  (institution_id, name, field_tags, min_aps, province,
   application_deadline, application_url, source_url, last_verified)
select i.id, c.name, c.tags, c.aps, 'Gauteng',
       date '2026-11-30', 'https://example.com/apply', 'https://example.com/requirements', current_date
from public.institutions i,
     (values
       ('BCom Accounting (DEMO)',          array['business','finance','accounting'], 30),
       ('BSc Computer Science (DEMO)',     array['technology','computing','maths'],  32),
       ('BEng Civil Engineering (DEMO)',   array['engineering','construction'],      36)
     ) as c(name, tags, aps)
where i.name = 'Demo University (SAMPLE DATA)'
on conflict (institution_id, name) do nothing;

insert into public.course_requirements (course_id, subject_id, min_mark)
select c.id, s.id, r.min_mark
from (values
       ('BCom Accounting (DEMO)',        'MATH', 60),
       ('BSc Computer Science (DEMO)',   'MATH', 60),
       ('BEng Civil Engineering (DEMO)', 'MATH', 70),
       ('BEng Civil Engineering (DEMO)', 'PHSC', 60)
     ) as r(course_name, subject_code, min_mark)
join public.courses  c on c.name = r.course_name
join public.subjects s on s.code = r.subject_code
on conflict (course_id, subject_id) do nothing;

insert into public.funding_sources
  (name, type, income_ceiling, eligible_fields, min_average, deadline, source_url, last_verified)
values
  ('Demo Engineering Bursary (SAMPLE DATA)', 'bursary', 350000,
   array['engineering'], 65, date '2026-11-30', 'https://example.com/bursary', current_date)
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- 6. CLEAN-UP (run before the real demo, once real data is in)
-- ---------------------------------------------------------------------
-- delete from public.institutions    where name like '%SAMPLE DATA%';  -- cascades to bands, courses, requirements
-- delete from public.funding_sources where name like '%SAMPLE DATA%';
