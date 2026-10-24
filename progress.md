# Beyond Tomorrow: Project Progress & Task Tracker

This progress document cross-references the tasks outlined in `docs/04_TASKS_CHECKLIST.md` and other documentation (`docs/01_PROJECT_OVERVIEW.md`, `docs/08_SUBMISSION_AND_DEMO.md`), tracking what has been completed and what remains for final submission.

Last updated: **Saturday 24 October 2026**.

---

## Summary of Completed Work `[x]`

### 1. Documentation & Architecture (`docs/`)
- [x] **Project Overview & Index**: Defined the hackathon challenge (Access to Higher Education), core modules (APS system, Bursaries, Resources), and scoped-out features (`docs/01_PROJECT_OVERVIEW.md`).
- [x] **Decisions & Architecture**: Recorded architectural decisions (D01–D10) and system architecture covering front-end, API, Supabase backend, and shared engine (`docs/02_DECISIONS.md`, `docs/03_ARCHITECTURE.md`).
- [x] **Security, Privacy & Data**: Configured data minimisation, POPIA compliance, security checklist, and data curation rules (`docs/05_SECURITY_AND_PRIVACY.md`, `docs/06_DATA_AND_FACTS.md`).
- [x] **Submission & Demo Planning**: Drafted submission checklist, 90-second video storyboard, 10-slide deck outline, and Lean Business Canvas (`docs/08_SUBMISSION_AND_DEMO.md`).
- [x] **Visual Diagrams & Trackers**: Included ERD HTML diagrams (`docs/diagrams/beyond_tomorrow_erd_uml.html`) and SSDLC tracker (`docs/ssdlc-tracker.html`).

### 2. Database & Security Setup (`db/`)
- [x] **Schema & RLS**: PostgreSQL tables, constraints, audit triggers, and Row Level Security (RLS) policies (`db/01_schema_and_rls.sql`).
- [x] **Seed Data & Resources**: Initial subjects, weights, checklist items, funding opportunities, student loans, and resource guides (`db/02_seed.sql`, `db/04_resources.sql`, `db/05_student_loans.sql`).
- [x] **RLS Testing**: Security test scripts for verifying data isolation (`db/03_rls_tests.sql`).

### 3. Backend API (`api/`)
- [x] **Node / TypeScript Server**: Express server setup with authentication middleware (`auth.ts`), input validation (`validate.ts`), rate limiting (`rateLimit.ts`), and error handling (`errors.ts`).
- [x] **API Routes**: Health check (`health.ts`), recommendations engine integration (`recommendations.ts`), and admin stats (`admin.ts`).

### 4. Shared Scoring Engine (`packages/engine`)
- [x] **Types & Configuration**: Shared TypeScript type definitions and configuration rules (`packages/engine/src/types.ts`, `config.ts`).
- [x] **APS Calculation Logic**: Percentage-to-points mapping and institution strategy registration (`packages/engine/src/aps.ts`).
- [x] **Unit Testing**: Vitest test suite (`packages/engine/test/engine.test.ts`) covering basic configuration and APS band calculations.

### 5. Frontend React Application (`web/`)
- [x] **Scaffold & Styling**: React + Vite + TypeScript application with responsive CSS design tokens (`tokens.css`, `app.css`, `aps.css`, `funding.css`, `institutions.css`).
- [x] **Authentication**: Supabase Auth integration (`web/src/lib/auth.tsx`, `supabase.ts`).
- [x] **Core Pages Built & Styled**:
  - [x] `Home`: Landing page and overview.
  - [x] `Login`: Supabase email & Google auth UI.
  - [x] `Onboarding`: Student profile entry (marks, province, income bracket).
  - [x] `Pathways`: Ranked course cards with plain-language reasons and verdict tiers.
  - [x] `Funding`: NSFAS indicator, bursaries, and loan options.
  - [x] `Checklist`: Application steps with countdown to closing dates and risk nudge.
  - [x] `Resources`: Curated guides and scam warnings.
  - [x] `ApsCalculator`: Interactive APS calculation tool featuring a layered two-column explainer with a thin dividing line, responsive hover-styled tables, and horizontally expanding subject entry fields.
  - [x] `Institutions`: Institution directory with filters and document checklists (`web/src/features/applications/`).

---

## Remaining Tasks `[ ]`

### 1. Engine & API Logic Refinement (Saturday / Sunday)
- [ ] Complete remaining engine scoring stubs (`evaluateEligibility`, `scoreFit`, `matchFunding`, `recommend`, `whatif`, `statement`, `deadlineRisk`).
- [ ] Turn all persona test stubs in `packages/engine/test/engine.test.ts` into passing unit tests.
- [ ] Wire up frontend what-if slider and pathway recommendations to the engine / API.

### 2. Testing & Usability (Sunday)
- [ ] Deploy hosted app (e.g. Vercel) and test on the hosted version.
- [ ] Conduct usability tests with 2–3 external users; record feedback and refine top issues.
- [ ] Gather initial traction (20–30 real users tried it with guardian consent where applicable).
- [ ] Run security audit (`npm run audit:high`) and verify security headers.

### 3. Submission & Packaging (Monday 26 Oct, 23:59)
- [ ] Record 90-second maximum demo video.
- [ ] Finalise 10-slide presentation deck (including demo account credentials and video link).
- [ ] Complete SSDLC form and Lean Business Canvas.
- [ ] Final end-to-end test of the demo account.
- [ ] **Submit through Sonke dashboard** and save confirmation.
- [ ] Post-judging: delete test accounts and demo account.
