# 05. Security and privacy

Security is **not** a judging criterion, but the SSDLC form is a required submission and trust underpins Product and Presentation. Keep it proportionate: roughly a tenth of our time.

## Data we hold

| Data | Why |
|---|---|
| Account email (and Google identity if used) | Sign-in |
| Marks per subject | APS and eligibility |
| Province | Location matching |
| Income **bracket** (never exact income) | NSFAS indicator |
| Interests | Fit scoring |
| Checklist progress, events, recommendation runs | Support, traction, reproducibility |

## Data we never collect

ID numbers, payslips, SASSA documents, exact income, disability status, lender application details.

## Why this matters

Many users may be minors. POPIA treats children's information as special personal information. We are not lawyers; mention POPIA-aware data minimisation in the SSDLC form and have the team agree how to handle consent (open question Q6). Tell students what we collect and why.

## Risk register

| Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|
| One student reads another's marks or income | M | H | RLS on every table; two-account test | Daniel |
| Leaked key or secret in Git | M | H | Env vars only; no `service_role`; secret scan | Jeremie and Andile, Daniel |
| Fake bursary or NSFAS links and scams | H | H | Official domains only; curated data; scam notice in UI | Daniel, Blessing and Katlego |
| Outdated deadlines or thresholds | H | M | `last_verified`; admin-only edits; "check the official site" notice; stale flag | Daniel |
| Injection or XSS via text fields | M | M | Zod; parameterised queries; render text as text | Jeremie and Andile, Blessing and Katlego |
| Account takeover or brute force | M | M | Supabase Auth; email confirmation; rate limiting | Daniel, Jeremie and Andile |
| Over-collection of minors' data | M | H | Marks and bracket only | Everyone |
| Wrong recommendation misleads a student | M | H | Estimate labels, verify links, source dates, constructive "not yet" | Everyone |
| Students pushed toward debt | M | M | Bursaries first; loans labelled as debt; no affiliate links | Daniel, Blessing and Katlego |

## Controls by layer

1. **Database:** RLS on all 14 tables; grants (anon blocked from student tables; append-only logs); constraints; audit triggers (`updated_at`, `updated_by`).
2. **API:** token verification; admin role check; strict Zod schemas; rate limiting; no stack traces in errors; request size limit; CORS allow-list; Helmet.
3. **Front end:** no `dangerouslySetInnerHTML` without sanitising; CSP and other headers in `vercel.json`; no keys except the public anon key.
4. **Process:** pull requests need a second reviewer; CI runs typecheck, tests, build and `npm audit`; `.gitignore` blocks `.env`.

## Admin access

- Admin is `app_metadata.role = "admin"`, set with SQL. Always use `returning` and confirm **exactly one row** changed (an email typo silently updates nothing).
- The admin must sign out and in again.
- Keep test users non-admin; otherwise the "normal user is blocked" tests prove nothing.
- Only people who truly need it get admin.

## Test pack (evidence for the SSDLC form)

| Test | How | Expected |
|---|---|---|
| User A reads or updates user B's rows | `db/03_rls_tests.sql` test 3 | 0 rows |
| User A creates a profile for user B | test 2 | RLS error |
| Normal user edits reference data | test 4 | RLS error |
| Logged-out reads courses / student data | tests 5a, 5b | rows / permission denied |
| Invalid marks (-5, 150, "abc") | test 6 and API | rejected |
| Events log is append-only | test 7 | delete denied |
| Normal user calls admin endpoint | test 8 and API | "admin only" / 403 |
| Admin can edit reference data and read stats | test 9 | success |
| Script and SQL-like text in fields | manual | nothing executes |
| Repeated login and recommendation requests | manual or script | rate limit (429) |
| `npm audit` | `npm run audit:high` | no high findings |
| Secrets in Git history and built bundle | secret scanner over history and `web/dist` | none found |

## SSDLC phases mapped to the weekend

| Phase | When | What we do |
|---|---|---|
| 1. Security requirements (risk assessment) | Friday | The register above |
| 2. Threat modelling and design review | Friday | Data flow diagram plus STRIDE (below) |
| 3. Development (secure coding) | Fri to Sun | Pull request checklist; second reviewer |
| 4. Security testing | Sunday | The test pack, with screenshots |
| 5. Assessment and secure integration | Monday morning | Re-test on the hosted app, demo account, document findings and fixes |

### STRIDE summary

| Threat | Question | Control |
|---|---|---|
| Spoofing | Can someone act as another user? | Supabase Auth, email confirmation |
| Tampering | Can a student edit bursary data or another's record? | RLS, admin-only writes |
| Repudiation | Are admin changes logged? | `updated_by` and `updated_at` |
| Information disclosure | Do responses expose extra fields? | Return only needed fields; column choices in queries |
| Denial of service | Are login and recommendations throttled? | Rate limiting |
| Elevation of privilege | Can a normal user reach admin routes? | Role in `app_metadata`; server-side and RLS checks |

## Pull request checklist (also in `.github/pull_request_template.md`)

- [ ] No secrets, keys or real student data
- [ ] New inputs validated with Zod (APS marks integers 0 to 100)
- [ ] New table has RLS and policies in `/db`
- [ ] No `dangerouslySetInnerHTML` without sanitising
- [ ] Errors do not leak stack traces or SQL
- [ ] Second reviewer approved

## Before submission

- Re-run the tests against the **hosted** app.
- Confirm HTTPS and security headers.
- Demo account: fake data, normal privileges, deleted after judging.
- Delete or disable test accounts.

## Note on the tracker

The interactive SSDLC tracker (`ssdlc-tracker.html`) holds the tasks, deadlines and owners. Its phase deadlines are our suggestions, not official dates.
