-- =====================================================================
-- Beyond Tomorrow | 03_rls_tests.sql
-- Purpose: prove the security controls work (evidence for SSDLC phase 4)
--
-- SETUP
--  1. Dashboard > Authentication > Users > Add user: create two test users
--     (e.g. test.a@example.com and test.b@example.com).
--  2. Copy each user's UUID. Find-and-replace USER_A_UUID and USER_B_UUID
--     in this file.
--  3. Run ONE test at a time: highlight it, then click Run.
--     Every test ends with ROLLBACK, so nothing is saved.
--  4. Screenshot each result for the Security Testing table.
-- =====================================================================


-- ---------------------------------------------------------------------
-- TEST 1. A student can create and read their own profile.
-- EXPECT: 1 row (user A only)
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}', true);

insert into public.student_profiles (id, province, income_bracket, interests)
values ('USER_A_UUID', 'Gauteng', 'up_to_350k', '{business}');

select id, province from public.student_profiles;
rollback;


-- ---------------------------------------------------------------------
-- TEST 2. User A tries to create a profile for user B.
-- EXPECT: ERROR "new row violates row-level security policy"
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}', true);

insert into public.student_profiles (id, province)
values ('USER_B_UUID', 'Gauteng');
rollback;


-- ---------------------------------------------------------------------
-- TEST 3. "User A reads or updates user B's rows" (SSDLC test 1)
-- B's data is created as the postgres role, then we switch to user A.
-- EXPECT: count = 0, and the UPDATE returns 0 rows
-- ---------------------------------------------------------------------
begin;
insert into public.student_profiles (id, province, income_bracket)
values ('USER_B_UUID', 'Gauteng', 'up_to_350k');
insert into public.student_marks (student_id, subject_id, mark)
select 'USER_B_UUID', id, 72 from public.subjects where code = 'MATH';

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}', true);

select count(*) as marks_visible_to_a from public.student_marks;
update public.student_profiles set province = 'Limpopo'
 where id = 'USER_B_UUID' returning id;
rollback;


-- ---------------------------------------------------------------------
-- TEST 4. A normal user tries to edit reference data (admin-only).
-- EXPECT: ERROR "new row violates row-level security policy"
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}', true);

insert into public.subjects (code, name) values ('HACK', 'Should not exist');
rollback;


-- ---------------------------------------------------------------------
-- TEST 5a. Logged-out visitor reads reference data.
-- EXPECT: rows returned (public read)
-- ---------------------------------------------------------------------
begin;
set local role anon;
select name, min_aps from public.courses;
rollback;


-- ---------------------------------------------------------------------
-- TEST 5b. Logged-out visitor tries to read student data.
-- EXPECT: ERROR "permission denied for table student_profiles"
-- ---------------------------------------------------------------------
begin;
set local role anon;
select * from public.student_profiles;
rollback;


-- ---------------------------------------------------------------------
-- TEST 6. Invalid mark is rejected (database-level validation).
-- EXPECT: ERROR "violates check constraint ... mark"
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}', true);

insert into public.student_profiles (id) values ('USER_A_UUID');
insert into public.student_marks (student_id, subject_id, mark)
select 'USER_A_UUID', id, 150 from public.subjects where code = 'MATH';
rollback;


-- ---------------------------------------------------------------------
-- TEST 7. The events log is append-only.
-- EXPECT: insert succeeds, delete fails with "permission denied"
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}', true);

insert into public.student_profiles (id) values ('USER_A_UUID');
insert into public.events (student_id, event_type) values ('USER_A_UUID', 'test_event');
delete from public.events where student_id = 'USER_A_UUID';
rollback;


-- ---------------------------------------------------------------------
-- TEST 8. A normal user calls the admin-only stats function
--         ("Normal user calls admin endpoint", SSDLC test 2).
-- EXPECT: ERROR "admin only"
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated"}', true);

select * from public.traction_stats();
rollback;


-- ---------------------------------------------------------------------
-- TEST 9. An admin CAN edit reference data and read traction counts.
-- (The claim below simulates what a real admin token contains.)
-- EXPECT: insert succeeds, stats row returned
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated","app_metadata":{"role":"admin"}}', true);

insert into public.subjects (code, name) values ('TESTADMIN', 'Admin write test');
select * from public.traction_stats();
rollback;
