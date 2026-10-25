-- =====================================================================
-- Beyond Tomorrow | 07_tracking_rls_tests.sql
-- Evidence for the new tables from 06_profile_and_tracking.sql.
-- Use the same two test users as 03_rls_tests.sql: replace USER_A_UUID and
-- USER_B_UUID. Run ONE test at a time (highlight it, then Run).
-- Every test ends with ROLLBACK, so nothing is saved.
-- =====================================================================

-- TEST 1. User A cannot create an application row for user B.
-- EXPECT: ERROR "new row violates row-level security policy"
begin;
insert into public.student_profiles (id) values ('USER_B_UUID') on conflict do nothing;  -- as postgres
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
insert into public.student_applications (student_id, institution_key, programme_name)
values ('USER_B_UUID', 'demo-university', 'BCom Accounting');
rollback;

-- TEST 2. User A cannot see user B's tracking rows.
-- EXPECT: all three counts are 0
begin;
insert into public.student_profiles (id) values ('USER_B_UUID') on conflict do nothing;  -- as postgres
insert into public.student_applications (student_id, institution_key, programme_name)
values ('USER_B_UUID', 'demo-university', 'BCom Accounting');
insert into public.funding_applications (student_id, funding_name) values ('USER_B_UUID', 'NSFAS Bursary');
insert into public.readiness_progress (student_id, document_code, check_code)
values ('USER_B_UUID', 'consent_form', 'dated');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
select (select count(*) from public.student_applications)  as apps_visible_to_a,
       (select count(*) from public.funding_applications)  as funding_visible_to_a,
       (select count(*) from public.readiness_progress)    as ticks_visible_to_a;
rollback;

-- TEST 3. A special-category document code cannot be stored in funding_applications.
-- EXPECT: ERROR "violates check constraint" (outstanding_docs)
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
insert into public.student_profiles (id) values ('USER_A_UUID');
insert into public.funding_applications (student_id, funding_name, outstanding_docs)
values ('USER_A_UUID', 'NSFAS Bursary', array['consent_form','disability_annexure']);
rollback;

-- TEST 4. A special-category document code cannot be stored in readiness_progress.
-- EXPECT: ERROR "violates check constraint" (document_code)
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
insert into public.student_profiles (id) values ('USER_A_UUID');
insert into public.readiness_progress (student_id, document_code, check_code)
values ('USER_A_UUID', 'vulnerable_child_form', 'signed');
rollback;

-- TEST 5. Logged-out visitors cannot read the new tables.
-- EXPECT: ERROR "permission denied for table student_applications"
begin;
set local role anon;
select * from public.student_applications;
rollback;

-- TEST 6a. The 'unsure' income bracket is accepted.
-- EXPECT: 1 row returned
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
insert into public.student_profiles (id, income_bracket) values ('USER_A_UUID', 'unsure')
returning id, income_bracket;
rollback;

-- TEST 6b. An invalid income bracket is rejected.
-- EXPECT: ERROR "violates check constraint ... income_bracket"
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
insert into public.student_profiles (id, income_bracket) values ('USER_A_UUID', 'R500000');
rollback;

-- TEST 7. A normal user cannot read the traction counts.
-- EXPECT: ERROR "admin only"
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"USER_A_UUID","role":"authenticated"}', true);
select * from public.traction_stats();
rollback;
