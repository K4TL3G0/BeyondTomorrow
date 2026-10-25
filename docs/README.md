# Database (Supabase / PostgreSQL)

Owner: Daniel. Run in the Supabase SQL Editor, in order:

1. `01_schema_and_rls.sql`: tables, constraints, audit triggers, RLS, grants
2. `02_seed.sql`: subjects, weights, checklist, NSFAS row, **fictional sample data**
3. `05_student_loans.sql`: funding descriptions and student-loan records
4. `04_resources.sql`: Resources table
5. `03_rls_tests.sql`: run one test at a time, screenshot each result (SSDLC evidence)

Rules
- Never change tables by hand in the dashboard without committing the SQL here.
  New change = new numbered file (`05_...sql`).
- Every new table: enable RLS and write policies in the same file.
- Every reference row needs `source_url` and `last_verified`.
- Remove the `SAMPLE DATA` rows before the real demo (clean-up lines at the end of `02_seed.sql`).
