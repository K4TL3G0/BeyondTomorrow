# 03. Architecture

## System at a glance

```
 Student (phone or laptop)
        |
        v
  React app  (web/)  ------------------------------+
   - UI, auth, what-if slider                       |
   - runs the shared engine in the browser          |
        |                                           |
        v                                           v
  Node/TS API (api/)                         Supabase (PostgreSQL + Auth)
   - validates input (Zod)         <------>   - reference tables (public read)
   - rate limits                              - student tables (RLS, owner-only)
   - runs the engine (authoritative)          - audit triggers, append-only logs
   - stores recommendation_runs
```

Diagrams: `diagrams/beyond_tomorrow_erd_uml.html` (printable ERD and UML class diagram).

## Components

| Component | Responsibility | Key files |
|---|---|---|
| `web/` | Screens, auth, calls Supabase directly for reference data, runs the engine for what-if | `src/pages/*`, `src/lib/auth.tsx`, `vercel.json` |
| `api/` | Zod validation, rate limiting, token verification, admin stats, authoritative recommendations | `src/app.ts`, `src/middleware/*`, `src/routes/*` |
| `packages/engine/` | Pure scoring logic shared by web and API | `src/types.ts`, `recommend.ts`, `whatif.ts`, ... |
| `db/` | SQL: schema, RLS, seed, tests, resources, loans | `01` to `05` |

## Data model in three layers

**1. Reference data** (public read, admin write, audited, every row has `source_url` and `last_verified`)
`institutions`, `aps_bands`, `subjects`, `courses`, `course_requirements`, `funding_sources`, `scoring_weights`, `checklist_tasks`, `resources`.

**2. Student data** (owner-only via RLS)
`student_profiles`, `student_marks`.

**3. Behaviour** (owner-only; `events` and `recommendation_runs` are append-only)
`checklist_progress`, `events`, `recommendation_runs`.

`funding_sources` and `scoring_weights` are matched by **rules**, not foreign keys.

Columns added after the original ERD (update the diagram when time allows): `updated_at` and `updated_by` on reference tables, and on `funding_sources`: `description`, `income_floor`, `provider_type`.

## The recommendation engine

```
StudentProfile + ReferenceData + ScoringConfig
        |
        v
  for each course:
    1. Eligibility gate  (APS via the institution's strategy + subject minimums)
    2. Fit score 0-100   (interest overlap + subject strengths)
    3. Funding indicator (NSFAS bracket + matching bursaries)
        |
        v
  CourseResult { verdict, apsGap, subjectGaps, fit, funding, verifiedOn, stale }
        |
        v
  rank:  verdict tier first, then wFit*fit + wMargin*margin + wFunding*funding
        |
        v
  StatementBuilder -> plain-language recommendation (templates only)
```

**Verdicts (proposed rules, tune with personas):**
- `qualifies`: APS and every subject requirement met.
- `close`: APS short by at most 3 points AND at most one subject short by at most 5 percent.
- `not_yet`: everything else, shown with a constructive gap statement, never hidden.

**What-if:** run the engine twice (baseline and changed marks), collect courses whose verdict improved. The "unlocks 3 pathways" sentence is generated from that diff, never hard-coded.

**Deadline-risk nudge:** remaining checklist tasks' `est_days` (an **Assumption**) vs days left to the closing date.

**NSFAS indicator values:** `likely` (bracket up to R350k), `may_qualify` (R350k to R600k: loan, or bursary with a disability), `no` (above R600k), `unknown` (prefer not to say).

## Authentication and roles

- Supabase Auth: email and password, plus Google.
- Roles: normal students have no role; admins have `app_metadata.role = "admin"` (set by SQL, verified with a `returning` clause, effective after re-login).
- The API verifies the bearer token, then calls Supabase **as that user**, so RLS still applies.
- Admin-only SQL function `traction_stats()` returns counts only (students, with marks, runs, tasks completed) for traction numbers.

## Security layers (defence in depth)

1. **RLS** on every table (primary control).
2. **Grants**: logged-out visitors cannot touch student tables; append-only tables have update and delete revoked.
3. **Constraints**: marks 0 to 100, province list, income bracket list, unique pairs.
4. **API validation** (Zod, strict schemas) and rate limiting (stricter on recommendations).
5. **Headers**: CSP, nosniff, frame denial, referrer policy, HSTS (`web/vercel.json`, and Helmet on the API).
6. **No secrets** in the repo; `.env.example` files only; CI runs typecheck, tests, build and `npm audit`.

## Hosting and environments

| Piece | Where | Status |
|---|---|---|
| Web | Free static host (Vercel config ready) | Decided |
| API | **Undecided** (Q2) | Open |
| Database and Auth | Supabase free tier | Created |

Environment variables: `web/.env.local` (URL and anon key), `api/.env` (URL, anon key, allowed origins). **Never** a `service_role` key.

## Repository layout

```
beyond-tomorrow/
  web/               React + Vite + TS
  api/               Express + TS
  packages/engine/   shared pure scoring logic (+ tests)
  db/                01..05 SQL files
  docs/              these documents, diagrams, SSDLC tracker
  .github/           CI and pull request template
```
