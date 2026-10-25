-- =====================================================================
-- Beyond Tomorrow | 11_supported_subset_seed.sql
-- Run AFTER 09_coach_reference_data.sql.
--
-- Seeds the supported subset of NSFAS and Standard Bank paperwork data
-- currently in scope. This script is safe to re-run because it updates on
-- conflict for document types and checks, and re-inserts the supported rules.
-- =====================================================================

begin;

-- 1. document_types ------------------------------------------------
insert into public.document_types
  (code, name, summary, who_signs, special_category, est_days, depends_on,
   official_url, sort_order, source_url, last_verified, verification)
values
('consent_form', 'NSFAS Consent Form',
 'Gives NSFAS permission to check your details, and your supporters'' details, against independent data sources.',
 'You, plus the parents, legal guardian or spouse whose details are on your application. If you are under 18, a parent or guardian also signs.',
 false, 2, '{}', 'https://www.nsfas.org.za/content/index.html', 10,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'official'),

('disability_annexure', 'Disability Annexure A',
 'A form for applicants who are applying on a disability basis. NSFAS pages use different names for it, so check the exact name in myNSFAS.',
 'A registered healthcare professional or a disability support office.',
 true, 5, '{}', 'https://nsfas.org.za/content/faqs.html', 80,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'official'),

('vulnerable_child_declaration', 'Orphan or Vulnerable Child Declaration',
 'A declaration for applicants under 18 who cannot give the usual parent or guardian information.',
 'A social worker. NSFAS also says the Department of Social Development may provide or confirm it.',
 true, 5, '{}', 'https://nsfas.org.za/content/faqs.html', 90,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'reported'),

('bank_id_copies', 'Identity documents (Standard Bank student loan)',
 'Identity documents for you and, if you apply with one, your surety.',
 null, false, 1, '{}', null, 10,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported'),

('bank_proof_of_residence', 'Proof of residence (Standard Bank student loan)',
 'Proof of your address and, if you apply with one, your surety''s address.',
 null, false, 2, '{}', null, 20,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported'),

('bank_surety_payslips', 'Surety''s payslips (Standard Bank student loan)',
 'Payslips for your surety, if you apply with one. Standard Bank''s page ties a surety to full-time study.',
 null, false, 3, '{}', null, 30,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported'),

('bank_academic_results', 'Latest academic results (Standard Bank student loan)',
 'Proof of your most recent academic results.',
 null, false, 2, '{}', null, 40,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported')
on conflict (code) do update set
  name = excluded.name, summary = excluded.summary, who_signs = excluded.who_signs,
  special_category = excluded.special_category, est_days = excluded.est_days,
  depends_on = excluded.depends_on, official_url = excluded.official_url,
  sort_order = excluded.sort_order, source_url = excluded.source_url,
  last_verified = excluded.last_verified, verification = excluded.verification;

-- 2. document_rules (delete and re-insert our own supported subset so re-runs do not duplicate rules)
delete from public.document_rules
 where document_code in ('consent_form','disability_annexure','vulnerable_child_declaration',
   'bank_id_copies','bank_proof_of_residence','bank_surety_payslips','bank_academic_results');

insert into public.document_rules
  (document_code, route_codes, when_cond, on_unknown, reason_text, priority,
   source_url, last_verified, verification)
values
('consent_form', '{nsfas_bursary}', '{"always": true}', 'include',
 'NSFAS lists this form for every applicant. Confirm current instructions in myNSFAS.', 10,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'official'),

('consent_form', '{nsfas_loan}', '{"always": true}', 'include',
 'NSFAS lists this form for loan applications too. Confirm current loan instructions with NSFAS.', 10,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'reported'),

('disability_annexure', '{nsfas_bursary,nsfas_loan}',
 '{"field": "disabilityBasis", "op": "eq", "value": true}', 'exclude',
 'Shown only if you said you are applying on a disability basis. Confirm with NSFAS what applies to you.', 5,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'official'),

('vulnerable_child_declaration', '{nsfas_bursary,nsfas_loan}',
 '{"all": [{"field": "vulnerableChild", "op": "eq", "value": true}, {"field": "ageBand", "op": "eq", "value": "under18"}]}',
 'exclude',
 'Shown only if you said this applies and you are under 18. Confirm with NSFAS what applies to you.', 5,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'reported'),

('bank_id_copies', '{bank_loans}', '{"always": true}', 'include',
 'Standard Bank lists identity documents for its student loan. Other banks may differ.', 10,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported'),
('bank_proof_of_residence', '{bank_loans}', '{"always": true}', 'include',
 'Standard Bank lists proof of residence for its student loan. Other banks may differ.', 10,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported'),
('bank_surety_payslips', '{bank_loans}', '{"always": true}', 'include',
 'Standard Bank asks for this if you apply with a surety. Skip it if you are applying without one.', 10,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported'),
('bank_academic_results', '{bank_loans}', '{"always": true}', 'include',
 'Standard Bank lists your latest academic results. Other banks may differ.', 10,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan',
 '2026-10-25', 'reported');

-- 3. document_checks ------------------------------------------------
insert into public.document_checks
  (document_code, check_code, label, why_it_fails, sort_order, show_when,
   source_url, last_verified, verification)
values
('consent_form', 'form_complete_accurate',
 'Every section of the form is filled in completely and accurately',
 'NSFAS says it needs an accurate, completed and signed form. Confirm current instructions in myNSFAS.', 1, null,
 'https://nsfas.org.za/content/faqs.html', '2026-10-25', 'official'),
('consent_form', 'signed_by_people_named',
 'Everyone whose details are on your application (parents, legal guardian or spouse) has signed',
 'NSFAS asks for the required signatures. Follow the signing steps shown in myNSFAS.', 2, null,
 'https://www.spu.ac.za/wp-content/uploads/2026/10/NSFAS-2027-Supporting-Documents-Checklist.pdf', '2026-10-25', 'reported'),
('consent_form', 'guardian_signs_if_under_18',
 'A parent or guardian has also signed for you',
 'NSFAS''s checklist asks for a parent or guardian signature when the applicant is under 18.', 3,
 '{"field": "ageBand", "op": "eq", "value": "under18"}',
 'https://www.spu.ac.za/wp-content/uploads/2026/10/NSFAS-2027-Supporting-Documents-Checklist.pdf', '2026-10-25', 'reported'),

('disability_annexure', 'annexure_completed_signed',
 'The form is completed and signed by a registered healthcare professional or a disability support office',
 'NSFAS says who completes this form. Confirm the exact requirements with NSFAS.', 1, null,
 'https://www.spu.ac.za/wp-content/uploads/2026/10/NSFAS-2027-Supporting-Documents-Checklist.pdf', '2026-10-25', 'reported'),
('disability_annexure', 'annexure_merged_with_report',
 'The form and the medical report are merged into one file, if NSFAS asks for a medical report',
 'The 2026 NSFAS how-to-apply page described one merged file. Check current instructions in myNSFAS.', 2, null,
 'https://www.nsfas.org.za/content/how-to-apply.html', '2026-10-25', 'reported'),

('vulnerable_child_declaration', 'declaration_by_social_worker',
 'The declaration is completed by a social worker',
 'NSFAS''s checklist names a social worker. Confirm with NSFAS who can complete it for you.', 1, null,
 'https://www.spu.ac.za/wp-content/uploads/2026/10/NSFAS-2027-Supporting-Documents-Checklist.pdf', '2026-10-25', 'reported'),

('bank_id_copies', 'id_ready',
 'Identity documents are ready for you and, if you apply with one, your surety',
 'Standard Bank lists identity documents. Confirm the final list with the bank.', 1, null,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan', '2026-10-25', 'reported'),
('bank_proof_of_residence', 'residence_under_3_months',
 'Proof of residence is less than 3 months old',
 'Standard Bank asks for recent proof of residence. Confirm the format with the bank.', 1, null,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan', '2026-10-25', 'reported'),
('bank_surety_payslips', 'surety_payslips_ready',
 'Your surety''s payslips are ready, if you apply with a surety',
 'Standard Bank asks for the surety''s payslips. Confirm the details with the bank.', 1, null,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan', '2026-10-25', 'reported'),
('bank_academic_results', 'results_ready',
 'Your latest academic results are ready',
 'Standard Bank lists academic results. Confirm the details with the bank.', 1, null,
 'https://www.standardbank.co.za/southafrica/personal/products-and-services/borrow-for-your-needs/student-loans/student-loans/apply-for-a-new-student-loan', '2026-10-25', 'reported')
on conflict (document_code, check_code) do update set
  label = excluded.label, why_it_fails = excluded.why_it_fails, sort_order = excluded.sort_order,
  show_when = excluded.show_when, source_url = excluded.source_url,
  last_verified = excluded.last_verified, verification = excluded.verification;

commit;

-- Optional validation checks (commented out so the file stays seed-only):
-- select r.id, r.document_code from public.document_rules r
-- left join public.document_types d on d.code = r.document_code
-- where d.code is null or r.source_url !~ '^https://' or r.last_verified is null or d.last_verified is null;
--
-- select d.code from public.document_types d
-- where not exists (select 1 from public.document_checks c where c.document_code = d.code)
--    or not exists (select 1 from public.document_rules r where r.document_code = d.code);
--
-- select rc as route, count(*)
-- from public.document_rules, unnest(route_codes) rc
-- group by rc order by rc;
