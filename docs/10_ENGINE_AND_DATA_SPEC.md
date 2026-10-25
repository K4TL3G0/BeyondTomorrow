# 10. Engine and data spec: the Paperwork Readiness Coach

Companion to `09_BUILD_PLAN.md`. This is the technical blueprint: dependencies, types, engines and methods, rules format, data model, frontend spec, tests and file layout. Everything here is a **proposal for the team to implement**.

Conventions: TypeScript strict mode; engine functions are **pure** (no I/O, no `Date.now()` inside: pass `now`); all copy lives in `web/src/lib/copy.ts`.

---

## 1. How it fits the existing system

```
 Student (phone or laptop)
        |
        v
  React app (web/)
   |  - Coach pages, wizard, document cards
   |  - runs the engine IN THE BROWSER
   |  - reads rules and funding rows from Supabase (public read, RLS)
   |  - writes only non-special progress + fix clocks (owner-only RLS)
        |
        v
  Supabase (PostgreSQL + Auth)
     reference: document_types, document_rules, document_checks, funding_sources, scoring_weights
     student:   readiness_progress, fix_clocks, events (existing)
```

No new API routes are needed in P0. The existing Node API stays for rate-limited extras (optional event logging).

## 2. Dependencies

### Needed now

| Package | Where | Why |
|---|---|---|
| `zod` | `web` (already in `api`) | Validate reference rows and wizard answers at the edge; recursive schema for the condition format |
| `react`, `react-dom`, `react-router-dom`, `@supabase/supabase-js`, `typescript`, `vite` | existing | No change |
| `vitest` | `engine` (existing) | Unit tests |

The **engine stays dependency-free** (types and pure functions only). Validation happens before data reaches it.

### Optional (add only if time allows)

| Package | Where | Why |
|---|---|---|
| `@testing-library/react`, `@testing-library/user-event`, `jsdom` | `web` dev | Component tests for the wizard and document cards (add `vitest` to `web`) |
| `fast-check` | `engine` dev | Property tests for the condition evaluator and `criticalPathDays` |
| `eslint`, `eslint-plugin-jsx-a11y` | root dev | Catch accessibility mistakes early |

### Deliberately avoided

| Avoid | Reason |
|---|---|
| `moment`, `date-fns`, `lodash` | Not needed. Use native `Date` with explicit `+02:00`, and `Intl.DateTimeFormat('en-ZA', { timeZone: 'Africa/Johannesburg' })` |
| State libraries (Redux, Zustand) | React state plus one context is enough |
| UI kits, animation libraries | Keep bundle small for low-data users; reuse existing CSS tokens |
| PDF libraries | Use a print stylesheet |
| i18n libraries | `copy.ts` dictionary now; add a library only if translation is built |
| OCR, ML, document-upload libraries | Privacy and scope (decision D29) |

Run `npm run audit:high` after any install; keep versions pinned by the lockfile.

## 3. Domain types (engine, `household.ts` and `types.ts`)

```ts
// ---- Wizard answers ----
export type AgeBand = 'under18' | '18to34' | '35plus';
export type Supporter =
  | 'both_parents' | 'one_parent' | 'legal_guardian' | 'spouse' | 'myself' | 'other_relative';
export type ParentsOnRecord = 'both' | 'one' | 'none' | 'unsure';   // how many parents appear on your Home Affairs records
export type YesNoUnsure = 'yes' | 'no' | 'unsure';
export type Acceptance = 'accepted' | 'applied' | 'not_yet';

export interface HouseholdAnswers {
  incomeBracket?: IncomeBracket;            // existing type; comes from the profile
  ageBand?: AgeBand;
  supporter?: Supporter;
  parentsOnRecord?: ParentsOnRecord;
  supporterIsParentOnRecord?: YesNoUnsure;  // is the person supporting you your parent on Home Affairs records?
  acceptance?: Acceptance;
  // EPHEMERAL: never persisted, never logged (decision D25)
  vulnerableChild?: boolean;
  disabilityBasis?: boolean;
  receivesGrant?: boolean;
}

// ---- Condition format (stored as JSON in the database) ----
export type Cond =
  | { always: true }
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond }
  | { field: keyof HouseholdAnswers; op: 'eq' | 'neq' | 'in'; value: string | boolean | string[] };

export type Tri = 'yes' | 'no' | 'unknown';              // three-valued logic

// ---- Reference data ----
export type Verification = 'official' | 'reported' | 'secondary' | 'conflict';

export interface PreflightCheck {
  code: string; label: string; whyItFails: string; sortOrder: number;
  showWhen: Cond | null;
  sourceUrl: string | null; lastVerified: string | null; verification: Verification;
}
export interface DocumentType {
  code: string; name: string; summary: string; whoSigns: string | null;
  specialCategory: boolean; estDays: number; dependsOn: string[];   // document codes
  officialUrl: string | null; sortOrder: number;
  checks: PreflightCheck[];
  sourceUrl: string | null; lastVerified: string | null; verification: Verification;
}
export interface DocumentRule {
  id: string; documentCode: string; routeCodes: RouteCode[];
  when: Cond; onUnknown: 'include' | 'exclude'; reasonText: string; priority: number;
  sourceUrl: string | null; lastVerified: string | null; verification: Verification;
}

// ---- Outputs ----
export type RouteCode = 'nsfas_bursary' | 'nsfas_loan' | 'bursaries' | 'bank_loans';
export interface RouteResult {
  code: RouteCode; label: string;
  fit: 'likely' | 'may_qualify' | 'unlikely' | 'unknown';
  reasons: string[]; deadline: string | null;
  sourceUrl: string | null; lastVerified: string | null; isDebt: boolean;
}
export interface RequiredDocument {
  code: string; name: string; summary: string; whoSigns: string | null;
  reasons: string[]; confirmNeeded: boolean;           // true when included on unknown answers
  checks: PreflightCheck[]; specialCategory: boolean;
  estDays: number; dependsOn: string[];
  verification: Verification; stale: boolean; sourceUrl: string | null; lastVerified: string | null;
}
export interface PreflightResult {
  perDocument: { code: string; total: number; ticked: number; missing: PreflightCheck[] }[];
  allReady: boolean;
}
export interface RiskFactor { code: string; points: number; text: string }
export interface RiskForecast {
  level: 'low' | 'medium' | 'high'; score: number; reasons: RiskFactor[]; nextAction: string;
}
export type DeadlineStatus = 'on_track' | 'at_risk' | 'overdue';
export interface FixClock {
  kind: 'documents' | 'appeal'; notifiedOn: string; deadline: string;
  daysLeft: number; status: 'on_track' | 'urgent' | 'expired';
}
```

## 4. Engines and methods

### 4.1 `conditions.ts`

```ts
evaluateCondition(cond: Cond, answers: HouseholdAnswers): Tri
```
Three-valued (Kleene) logic so "unsure" is handled honestly:

| Case | Result |
|---|---|
| `always` | `yes` |
| `field/eq` | `unknown` if the answer is `undefined` or `'unsure'`; else `yes`/`no` by equality |
| `field/neq` | `unknown` if undefined or `'unsure'`; else `yes`/`no` |
| `field/in` | `unknown` if undefined or `'unsure'`; else membership |
| `all` | any `no` gives `no`; else any `unknown` gives `unknown`; else `yes` (empty list gives `yes`) |
| `any` | any `yes` gives `yes`; else any `unknown` gives `unknown`; else `no` (empty list gives `no`) |
| `not` | flips `yes` and `no`; `unknown` stays `unknown` |

Rules: never `eval`; unknown `op` or unknown `field` is a validation error at load time (zod), and `no` at runtime; maximum depth 5.

### 4.2 `routes.ts`

```ts
findFundingRoutes(answers: HouseholdAnswers, funding: FundingSource[], now: Date): RouteResult[]
```
Uses the existing `funding_sources` rows (`provider_type`, `income_floor`, `income_ceiling`, `deadline`). Order: government first, bursaries next, debt last.

| Bracket | `nsfas_bursary` | `nsfas_loan` | Notes |
|---|---|---|---|
| `up_to_350k` | `likely` | `unlikely` | Final decisions rest with NSFAS |
| `350k_to_600k` | `unlikely` (text: "higher threshold applies with a disability, confirm on NSFAS"; do not store disability) | `may_qualify` | The missing-middle route; loan is debt |
| `above_600k` | `unlikely` | `unlikely` | Show bursaries with higher ceilings and bank loans |
| `prefer_not_to_say` / unset | `unknown` | `unknown` | Show both, explain the thresholds |

Threshold values come from the rows, never hard-coded. Every result carries `sourceUrl` and `lastVerified`. Never produce a percentage.

### 4.3 `documents.ts`

```ts
requiredDocuments(
  answers: HouseholdAnswers, route: RouteCode,
  rules: DocumentRule[], docs: DocumentType[],
  now: Date, cfg: { staleAfterDays: number }
): RequiredDocument[]
```
Algorithm:
1. Keep rules whose `routeCodes` include `route`.
2. `t = evaluateCondition(rule.when, answers)`. Include when `t === 'yes'`, or when `t === 'unknown'` and `rule.onUnknown === 'include'` (then `confirmNeeded = true`).
3. Group by `documentCode`; merge `reasonText` values in `priority` order; a document is `confirmNeeded` only if **every** triggering rule was unknown.
4. Attach the `DocumentType`; filter its `checks` by `showWhen` (evaluate with the same function; hide on `no`).
5. Drop any row with `lastVerified === null` (decision D28). Set `stale` if older than `staleAfterDays`.
6. Sort by `sortOrder`.

```ts
displayable(row: { lastVerified: string | null }, now: Date, cfg): { show: boolean; stale: boolean }
```

### 4.4 `preflight.ts`

```ts
evaluatePreflight(docs: RequiredDocument[], ticks: Record<string, boolean>): PreflightResult
```
Tick key format: `"<documentCode>:<checkCode>"`. A document is ready when all its visible checks are ticked. `allReady` is true only if every document is ready and no document is `confirmNeeded`.

### 4.5 `deadlines.ts`

```ts
criticalPathDays(
  tasks: { code: string; estDays: number; dependsOn: string[] }[],
  done: Set<string>
): number
```
- Consider only tasks not in `done`; ignore dependencies that are already done.
- Longest path by `estDays` through the remaining dependency graph (topological order with memoisation). Parallel tasks do not add up.
- Throw on a dependency cycle or an unknown dependency code.

```ts
assessDeadlineRisk(input: {
  remainingCriticalDays: number; deadline: Date; now: Date; bufferDays?: number  // default 2
}): DeadlineStatus
```
- No remaining tasks: `on_track`.
- `now > deadline` with work remaining: `overdue`.
- `remainingCriticalDays + bufferDays > daysLeft`: `at_risk`; else `on_track`.
- This **replaces** the earlier stub that summed all remaining days.

```ts
computeFixClock(
  kind: 'documents' | 'appeal', notifiedOn: string /* ISO date */, now: Date, windowDays = 30
): FixClock
```
- `deadline = notifiedOn + windowDays`, at 23:59 SAST. `daysLeft = ceil((deadline - now)/day)`.
- `status`: `expired` when `daysLeft <= 0`; `urgent` when `<= 7` (**Assumption**, stored as `fix_urgent_days`); else `on_track`.
- Windows (30 days) are as reported by NSFAS; keep the number in data so it can be corrected.

### 4.6 `risk.ts`

```ts
forecastIncompleteRisk(input: {
  answers: HouseholdAnswers; docs: RequiredDocument[]; preflight: PreflightResult;
  deadlineStatus: DeadlineStatus | null; weights: RiskWeights; now: Date
}): RiskForecast
```
Transparent weighted factors. Weights default to the values below (**Assumptions**) and are stored in `scoring_weights` with `risk_` keys.

| Factor code | Fires when | Default points | Basis |
|---|---|---|---|
| `two_signatures` | `parentsOnRecord === 'both'` | 2 | NSFAS: consent often covers only one of two parents |
| `supporter_not_parent` | `supporterIsParentOnRecord === 'no'` | 3 | Declaration form plus a second consent form |
| `parent_status_unsure` | `parentsOnRecord` or `supporterIsParentOnRecord` is `unsure` | 1 | Cannot tell which forms apply |
| `consent_checks_open` | any visible consent-form check is unticked | 2 | Unsigned, undated and incomplete forms were the main failures |
| `special_forms_needed` | a special-category document is required | 1 | Extra forms mean extra chances to miss one |
| `not_yet_accepted` | `acceptance !== 'accepted'` | 1 | Proof of acceptance needed later |
| `deadline_tight` | `deadlineStatus === 'at_risk'` | 3 | Less time than the work needs |
| `deadline_passed` | `deadlineStatus === 'overdue'` | 5 | |
| `nothing_started` | zero checks ticked and fewer than 7 days left | 1 | |

Levels: `low` for score 0 to 2, `medium` for 3 to 5, `high` for 6 or more (**Assumption**, `risk_medium_at`, `risk_high_at`). Return the **top three factors by points** as `reasons` and a single `nextAction` derived from the highest factor (a fixed map, for example `two_signatures` gives "Ask both parents to sign and date the consent form"). It must never say "you will be rejected".

### 4.7 `statements.ts`

```ts
buildRouteStatement(r: RouteResult): string
buildDocumentGuidance(d: RequiredDocument): string
buildRiskStatement(f: RiskForecast): string
buildFixClockStatement(c: FixClock, outstanding: string[]): string
```
Rules:
- Deterministic templates filled from structured data; skip any sentence whose data is missing.
- Every statement ends with: "This is guidance, not a decision. Confirm on nsfas.org.za." plus the verified date.
- Rows with `verification` of `secondary` or `conflict` add "Confirm this on nsfas.org.za."
- Debt routes add: "This is a loan you must repay."
- A helper handles plurals ("1 day", "5 days") and SAST date formatting.

### 4.8 P2 modules (only after P0 and P1 ship)

Reuse the existing stubs, limited to **1 to 2 institutions** whose method is read from the institution's **own current page**: `ApsStrategy`, `evaluateEligibility`, `whatIf`. Output is always labelled "estimate". Do not claim coverage of all universities.

## 5. Rules in the database (format and examples)

Stored as `jsonb` and validated with a recursive zod schema (max depth 5, max 50 nodes).

```json
{ "always": true }

{ "all": [
  { "field": "supporterIsParentOnRecord", "op": "eq", "value": "no" },
  { "field": "ageBand", "op": "in", "value": ["under18", "18to34"] }
] }
```

## 6. Seed content to author (Daniel and the pitch lead)

Every row needs `source_url`, `last_verified` and `verification`. Wording below is a starting point; **confirm against official pages first** (build plan, section 7).

| Document code | Name | Applies when (rule) | Who signs | Special | Initial verification |
|---|---|---|---|---|---|
| `consent_form` | NSFAS consent form | Always (bursary and loan routes). Extra reason when `parentsOnRecord = both` | Parent(s) or guardian whose income is verified | No | `reported` / `secondary` |
| `declaration_form` | NSFAS declaration form | `supporterIsParentOnRecord = no` and age band under 35 (**confirm**); `onUnknown: include` | You and the declared person | No | `reported` / `secondary` |
| `declared_person_consent` | Consent form from the person you declared | Together with the declaration form | The declared person | No | `reported` |
| `proof_of_acceptance` | Proof of acceptance | `acceptance != accepted` | Issued by the institution | No | `reported` |
| `loan_agreement` | NSFAS loan agreement | Route `nsfas_loan` | You (and as NSFAS requires) | No | `official` (NSFAS loan page) |
| `vulnerable_child_form` | Orphan and vulnerable child declaration | `vulnerableChild = true` (**confirm condition**) | As NSFAS requires | **Yes** | `secondary` |
| `disability_annexure` | Disability Annexure A | `disabilityBasis = true` | As NSFAS requires | **Yes** | `secondary` |
| `parent_id_copies` | Parent or guardian ID copies | Candidate rule: if NSFAS requires them (**confirm**) | n/a | No | `secondary` |

Pre-submission checks (`document_checks`) to start with, for `consent_form`:

| Check code | Label | `showWhen` |
|---|---|---|
| `signed_by_parent` | Signed by your parent or guardian, not by you | always |
| `dated` | Signed and dated | always |
| `fields_complete` | Every mandatory field is filled in | always |
| `all_parents_covered` | Every parent on your Home Affairs records has completed and signed one | `parentsOnRecord = both` |
| `readable` | The whole page is visible and readable in the photo or scan | always |
| `right_category` | Uploaded under the correct document type on myNSFAS | always |

Add checks for `declaration_form` ("completed correctly and signed" and "the person you listed also signed a consent form"). Keep each `why_it_fails` sentence tied to a source.

## 7. Data model (coach reference migration `09_coach_reference_data.sql`)

Implementation note: migrations `06_profile_and_tracking.sql` and `08_subjects_and_marks.sql` already exist in this repository. Run `09_coach_reference_data.sql` after them; it adds the public-read/admin-write document reference tables, owner-only `fix_clocks`, a funding-source verification status used to gate deadlines, and guards against persisting special-category document codes. It intentionally contains no document seeds: only add rules after their source and verification date have been reviewed. `readiness_progress` is reused from migration 06.

```sql
-- Reference tables (public read, admin write, audited like the others)
create table public.document_types (
  code text primary key,
  name text not null, summary text not null default '',
  who_signs text, special_category boolean not null default false,
  est_days int not null default 1 check (est_days >= 0),
  depends_on text[] not null default '{}',
  official_url text, sort_order int not null default 0,
  source_url text, last_verified date,
  verification text not null check (verification in ('official','reported','secondary','conflict')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.document_rules (
  id uuid primary key default gen_random_uuid(),
  document_code text not null references public.document_types (code) on delete cascade,
  route_codes text[] not null,
  when_cond jsonb not null,
  on_unknown text not null default 'include' check (on_unknown in ('include','exclude')),
  reason_text text not null, priority int not null default 0,
  source_url text, last_verified date,
  verification text not null check (verification in ('official','reported','secondary','conflict')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.document_checks (
  id uuid primary key default gen_random_uuid(),
  document_code text not null references public.document_types (code) on delete cascade,
  check_code text not null, label text not null, why_it_fails text not null default '',
  sort_order int not null default 0, show_when jsonb,
  source_url text, last_verified date,
  verification text not null check (verification in ('official','reported','secondary','conflict')),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  unique (document_code, check_code)
);

-- Student tables (owner-only)
create table public.readiness_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  document_code text not null references public.document_types (code) on delete cascade,
  check_code text not null,
  checked boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (student_id, document_code, check_code)
);

create table public.fix_clocks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_profiles (id) on delete cascade,
  kind text not null check (kind in ('documents','appeal')),
  notified_on date not null,
  window_days int not null default 30 check (window_days between 1 and 90),
  created_at timestamptz not null default now()
);
```

Also required in the same file:
- **RLS enabled** on every new table; reference tables follow the existing pattern (public read, admin write, `touch_audit` trigger); student tables use owner-only policies on `student_id = (select auth.uid())`.
- **Grants:** `revoke all ... from anon` on the student tables; reference tables read-only for `anon`.
- **Indexes** on `document_rules(document_code)`, `document_checks(document_code)`, `readiness_progress(student_id)`, `fix_clocks(student_id)`.
- **Special-category guard** (defence in depth, decision D25): a `before insert or update` trigger on `readiness_progress` that raises an exception when `document_types.special_category` is true for the row's `document_code`. The app also never sends those rows.
- **Extend `traction_stats()`** to return counts only: coach starts, completed wizards, fix clocks created (from the `events` table and `fix_clocks`).
- Add `risk_*`, `fix_urgent_days`, `fix_window_days` keys to `scoring_weights`.

`readiness_progress` stores **no household answers**. The coach keeps non-sensitive answers, the selected funding route, and wizard position in `sessionStorage` scoped to the signed-in user; the browser clears it when the tab session ends. These values are not sent to or stored in the database. Optional sensitive answers (`vulnerableChild`, `disabilityBasis`, and `receivesGrant`) remain in React memory only and are excluded from session storage, database writes, and logs.

## 8. Frontend spec

### Routes
| Route | Screen |
|---|---|
| `/coach` | Route finder and entry |
| `/coach/questions` | Wizard (one question per screen) |
| `/coach/documents` | Document cards, pre-check, risk banner, countdown |
| `/coach/fix` | "My application is incomplete": 30-day clock |

(`/checklist` can redirect to `/coach/documents`; keep the existing generic steps as a short "before you start" panel.)

### Components
| Component | Props (summary) | Notes |
|---|---|---|
| `Wizard` | `questions`, `answers`, `onChange` | `fieldset` and `legend` per question; back/next; progress; moves focus to the question heading on step change |
| `RouteCard` | `RouteResult` | Fit label in words, not only colour; debt notice when `isDebt` |
| `DocumentCard` | `RequiredDocument`, ticks | Expand/collapse; shows why, who signs, checks |
| `PreflightList` | checks, ticks, `onToggle` | Native checkboxes, 44px targets |
| `VerifiedBadge` | `verification`, `lastVerified`, `stale`, `sourceUrl` | "Confirm on nsfas.org.za" for `secondary` and `conflict` |
| `RiskBanner` | `RiskForecast` | `role="status"`; level in text; top three reasons; one next action |
| `Countdown` | `deadline`, `now` | Updates each minute |
| `FixClockForm` | `kind`, `onSubmit` | Date picker, outstanding-items multi-select |
| `ScamNotice`, `DebtNotice` | none | Always visible where relevant |
| `ClearDataButton` | none | Clears local and session data on this device |

### State and persistence
- `useReadinessData()` loads reference rows (zod-validated), caches in memory.
- `useCoachState()`: answers (reducer), computed documents, ticks, risk. All calculations are `useMemo` over pure engine calls.
- Persist: ticks for **non-special** documents to `readiness_progress` (debounced); special-category ticks and answers on the device only; fix clocks to `fix_clocks`.

### Copy and i18n
`web/src/lib/copy.ts` exports one typed object of every string. No literals in components. Use plain language (target reading level of a Grade 8 learner); no jargon without an explanation.

### Accessibility and low-data
Labels on every input; `aria-live="polite"` for the risk banner; contrast checked in light and dark; works at 360px; no images beyond the logo; initial JS bundle kept small; print stylesheet shows each document with its checks as empty boxes and the verified date.

### Links
`safeExternalUrl(url)` allows only `https:`; checks the host against an allow-list (`nsfas.org.za`, `my.nsfas.org.za`, plus verified institution domains); adds `rel="noopener noreferrer"`.

## 9. Events (usage and traction, no answers)

`events.event_type` values (50 characters or fewer): `coach_started`, `route_selected`, `wizard_completed`, `check_ticked`, `risk_shown_high`, `fix_clock_started`, `checklist_printed`. `ref_id` is empty or a document id. **Never** log answers or the notification date.

## 10. Security and privacy additions

| Concern | Control |
|---|---|
| Malicious or malformed rule JSON | Admin-only writes (RLS); recursive zod schema; depth and size limits; engine never evaluates code |
| XSS | All text rendered by React as text; no `dangerouslySetInnerHTML`; URLs through `safeExternalUrl` |
| Special-category data | Ephemeral in memory; database trigger blocks persistence; no logging; "Clear my data" button |
| Minors | Categories only; no IDs, names or parent details; parental consent for testing sessions |
| Wrong advice | Verification badges; stale flag; hidden unverified rows; "guidance, not a decision" footer |
| Scams | `ScamNotice` on the coach and in resources; official domains only |
| Rate limits | Existing API limiter if event logging is routed through the API |

Add to the test pack: RLS tests for the new tables (owner-only, anon blocked, special-category trigger rejects a row) and a front-end check that no special answer appears in storage or network traffic.

## 11. File layout

```
packages/engine/src/
  types.ts household.ts conditions.ts routes.ts documents.ts
  preflight.ts deadlines.ts risk.ts statements.ts index.ts
packages/engine/test/
  conditions.test.ts routes.test.ts documents.test.ts preflight.test.ts
  deadlines.test.ts risk.test.ts statements.test.ts fixtures/scenarios.ts
web/src/
  lib/readiness.ts   lib/copy.ts   lib/safeUrl.ts   lib/schemas.ts
  pages/Coach.tsx    pages/CoachQuestions.tsx   pages/CoachDocuments.tsx   pages/CoachFix.tsx
  components/Wizard.tsx RouteCard.tsx DocumentCard.tsx PreflightList.tsx VerifiedBadge.tsx
             RiskBanner.tsx Countdown.tsx FixClockForm.tsx ScamNotice.tsx DebtNotice.tsx ClearDataButton.tsx
  styles/coach.css
db/
  06_readiness.sql  07_readiness_seed.sql  08_readiness_tests.sql
```

## 12. Test scenarios (write the expected results first)

Dates assume `now` is passed in. Rule data in these tests comes from a **fixtures file**, so tests do not depend on unverified live data.

| # | Persona and inputs | Expected |
|---|---|---|
| S1 | 17, both parents support, both on records, supporter is a parent, acceptance `applied`, bracket `up_to_350k` | Route `nsfas_bursary` likely. Documents: consent form (reasons include "every applicant" and "both parents on your records"), proof of acceptance. Risk: `two_signatures` (2) plus `not_yet_accepted` (1) gives score 3, **medium** |
| S2 | 18, legal guardian (aunt), one parent on record, supporter not a parent on record | Documents: consent form, declaration form, consent from the declared person. Risk: `supporter_not_parent` (3); with consent checks unticked (+2) gives 5, **medium**; with `deadline_tight` (+3) gives 8, **high** |
| S3 | 19, supports self, `parentsOnRecord: unsure` | Consent form included with `confirmNeeded = true`; risk `parent_status_unsure` (1), **low** |
| S4 | Bracket `350k_to_600k` | Route `nsfas_loan` may_qualify; loan agreement document; statement contains "loan you must repay"; no percentage anywhere |
| S5 | Bracket `above_600k` | NSFAS routes `unlikely`; bursaries and bank loans shown; debt notice present |
| S6 | `prefer_not_to_say` | Both NSFAS routes `unknown`; explanation of thresholds shown |
| S7 | Fix clock `documents`, notified 2026-12-10 | `now` 2026-12-20 gives `on_track`; `now` 2027-01-04 gives `urgent` (about 5 days); `now` 2027-01-10 gives `expired` |
| S8 | Tasks A (3 days), B (2 days, depends on A), C (4 days). Critical path = 5 | Deadline in 8 days: `on_track`. Deadline in 6 days (buffer 2): `at_risk`. With A done, path = 4 |

Additional unit tests: condition evaluator truth tables including `unknown`; cycle detection in `criticalPathDays`; rows without `lastVerified` are dropped; `stale` flag at `staleAfterDays`; special-category documents are marked and never appear in the persistence payload helper (`toPersistedTicks()`); statements always contain the caveat and the verified date; plural helper.

## 13. Build order (so something demo-able exists early)

1. Types, condition evaluator and tests (about 1 hour).
2. Fixtures and `requiredDocuments` plus `evaluatePreflight` (about 2 hours).
3. `findFundingRoutes` (about 1 hour).
4. Wizard and document cards on **fixtures** (UI team, in parallel).
5. Migration and seed (Daniel, in parallel), then swap fixtures for Supabase data.
6. `criticalPathDays`, `assessDeadlineRisk`, `computeFixClock` (about 2 hours).
7. `forecastIncompleteRisk` and statements (about 2 hours).
8. Print stylesheet, share text, events.
9. P2 only if everything above is on the hosted app.
