-- =====================================================================
-- Beyond Tomorrow | 05_student_loans.sql
-- Run after 01_schema_and_rls.sql and 02_seed.sql.
-- Adds summaries and source links for South African student-loan options.
-- Provider terms change; verify each source before relying on its details.
-- =====================================================================

alter table public.funding_sources
  add column if not exists description text not null default '';

insert into public.funding_sources
  (name, type, description, source_url, last_verified)
values
  ('NSFAS Missing Middle Student Loan', 'loan',
   'NSFAS student-loan information for applicants who may not qualify for a bursary. Check the official page for current eligibility, application steps and loan terms.',
   'https://nsfas.org.za/content/studentloan.html', date '2026-10-23'),
  ('Standard Bank Student Loan', 'loan',
   'Standard Bank describes student finance for full- and part-time study. Its page currently says applications for its no-surety student-loan option are closed; confirm what options are open and check all terms directly.',
   'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans',
   date '2026-10-23'),
  ('Manati Student Funding Loan', 'loan',
   'Manati describes an online, individually assessed student loan, with affordability assessment and repayment options. Rates, fees and actual repayments depend on assessment and approval.',
   'https://manati.co.za/', date '2026-10-23'),
  ('Fundi Student Loan', 'loan',
   'Fundi provides a student-loan application page. Confirm current funding coverage, eligibility, fees, interest and repayment terms directly with Fundi.',
   'https://loans.fundi.co.za/', date '2026-10-23'),
  ('Absa Study Loan', 'loan',
   'Absa says its study loan may cover tuition and related study costs, with repayment options that include an interest-only period. Eligibility, costs and conditions apply; verify the current terms.',
   'https://www.absa.co.za/personal/loans/for-my-studies/explore/', date '2026-10-23'),
  ('University of Johannesburg: Student Loans from Banks', 'loan',
   'The University of Johannesburg provides information about student loans from banks. Use it as a comparison resource and confirm current rates, eligibility and terms with each lender.',
   'https://www.uj.ac.za/admission-aid/student-finance/student-loans-from-banks/',
   date '2026-10-23')
on conflict (name) do update set
  type = excluded.type,
  description = excluded.description,
  source_url = excluded.source_url,
  last_verified = excluded.last_verified;
