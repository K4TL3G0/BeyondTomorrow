-- =====================================================================
-- Beyond Tomorrow | 05_student_loans.sql  (revised)
-- Run AFTER 01, 02 and 04 (the UJ guide goes into the resources table).
--
-- Adds student-loan options to funding_sources. Provider terms change:
-- every row carries source_url and last_verified. Rows checked on
-- 2026-10-23 are stamped with that date. Fundi's page did not render its
-- terms when checked, so its last_verified is left NULL on purpose.
--
-- NOTE: re-running this script does NOT touch last_verified. Only update
-- that date (by hand) after someone has actually re-checked the source.
-- =====================================================================

-- 1. New columns -------------------------------------------------------
alter table public.funding_sources
  add column if not exists description   text not null default '',
  add column if not exists income_floor  numeric(12,2),  -- loan bands: household income must exceed this
  add column if not exists provider_type text;           -- government | bank | private_lender

alter table public.funding_sources
  drop constraint if exists funding_sources_provider_type_check;
alter table public.funding_sources
  add constraint funding_sources_provider_type_check
  check (provider_type is null or provider_type in ('government','bank','private_lender'));

-- Tag the NSFAS bursary row added in 02_seed.sql
update public.funding_sources
   set provider_type = 'government'
 where name = 'NSFAS Bursary' and provider_type is null;

-- 2. Loan options ------------------------------------------------------
-- Matching rule for the engine: only provider_type = 'government' rows are
-- matched against the student's income bracket. Bank and private-lender loans
-- depend on a credit assessment (and often a parent or guarantor's income), so
-- show them as "options to compare", after free funding, never as a "match".
insert into public.funding_sources
  (name, type, provider_type, income_floor, income_ceiling, description,
   source_url, last_verified)
values
  ('NSFAS Missing Middle Student Loan', 'loan', 'government', 350000, 600000,
   'NSFAS loan for students whose household income is between R350,000 and R600,000 a year, studying at a public university or TVET college. A loan agreement and a completed consent form are required. Check nsfas.org.za for the current-year application steps.',
   'https://nsfas.org.za/content/studentloan.html', date '2026-10-23'),

  ('Standard Bank Student Loan', 'loan', 'bank', null, null,
   'Bank student loan for full- or part-time study, with or without a surety (guarantor). As of 23 Oct 2026 the page says applications for the Standard Bank-backed option without surety are closed. An online quote is available; the bank assesses affordability.',
   'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans',
   date '2026-10-23'),

  ('Absa Study Loan', 'loan', 'bank', null, null,
   'Study loan covering tuition, accommodation, books and study equipment, one year at a time, from R15,000. The borrower must be a South African citizen or permanent resident earning over R3,000 a month, and may be a parent, sponsor or guardian. Interest-only repayment for the first 12 months is possible. Credit life insurance is mandatory.',
   'https://www.absa.co.za/personal/loans/for-my-studies/explore/',
   date '2026-10-23'),

  ('Manati Student Funding Loan', 'loan', 'private_lender', null, null,
   'Online student loan from a registered credit provider, assessed individually on affordability and household income. Rates, fees and repayments are set on assessment; the website calculator uses an illustrative rate only.',
   'https://manati.co.za/', date '2026-10-23'),

  ('Fundi Student Loan', 'loan', 'private_lender', null, null,
   'Student loans for studies, accommodation and devices, according to the provider''s site. Confirm eligibility, fees, interest and repayment terms with Fundi before relying on it.',
   'https://loans.fundi.co.za/', null)
on conflict (name) do update set
  type          = excluded.type,
  provider_type = excluded.provider_type,
  income_floor  = excluded.income_floor,
  income_ceiling = excluded.income_ceiling,
  description   = excluded.description,
  source_url    = excluded.source_url;
  -- last_verified is deliberately NOT updated here.

-- 3. UJ page: a guide, not a funding source (goes in resources) ----------
insert into public.resources
  (title, category, summary, url, source_url, last_verified)
values
  ('Compare student loans (UJ and Student Hero)', 'funding',
   'The University of Johannesburg partners with Student Hero, a free comparison service that lists offers from several lenders. Check how such services are funded and compare each lender''s terms yourself.',
   'https://www.uj.ac.za/admission-aid/student-finance/student-loans-from-banks/',
   'https://www.uj.ac.za/admission-aid/student-finance/student-loans-from-banks/',
   date '2026-10-23')
on conflict (title) do update set
  summary    = excluded.summary,
  url        = excluded.url,
  source_url = excluded.source_url;