# Security (SSDLC)

Phases: 1 Risk assessment, 2 Threat modelling, 3 Secure coding, 4 Security testing,
5 Assessment and secure integration. Track progress in `docs/ssdlc-tracker.html`.

## Data we hold, and do not
Held: account email, matric marks, income bracket, province, interests.
Never collected: ID numbers, payslips, SASSA documents. Many users may be minors:
POPIA treats children's information as special personal information.

## Secure coding checklist (every pull request)
- [ ] No secrets in code; the service_role key is never used
- [ ] All inputs validated with Zod (APS marks integers 0-100)
- [ ] RLS enabled on every new table before data is added
- [ ] No dangerouslySetInnerHTML without sanitising; render user text as text
- [ ] Errors do not leak stack traces or SQL
- [ ] A second team member reviewed it

## Security tests (evidence for the submission)
| Test | Where |
|---|---|
| User A reads or updates user B's rows | `db/03_rls_tests.sql` test 3 |
| Normal user calls admin endpoint | `db/03_rls_tests.sql` test 8; API returns 403 |
| Script and SQL-like strings in text fields | Manual, front end and API |
| Marks of -5, 150, "abc" rejected | `db/03_rls_tests.sql` test 6; API 400 |
| Repeated login and APS requests | API rate limit (429) |
| npm audit | `npm run audit:high` |
| Search bundle and Git history for keys | Run a secret scanner (e.g. gitleaks) over history and `web/dist` |

## Before submission
- Re-run the tests against the hosted production app, not localhost.
- Confirm security headers (`web/vercel.json`) and HTTPS.
- Seed the judges' demo account with fake data and normal privileges; delete it after judging.
