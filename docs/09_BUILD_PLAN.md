# 09. Build plan: the Paperwork Readiness Coach

Status: **Proposed** (agreed in principle by the team). Written Saturday 24 October 2026.
Companion file: `10_ENGINE_AND_DATA_SPEC.md` (engines, methods, types, data, dependencies).

---

## 1. The one thing we do better than everyone else

**Beyond Tomorrow makes a student's NSFAS application complete the first time.**

Why this and not course matching:

| Evidence | Source |
|---|---|
| For the 2026 intake NSFAS received **893,847** first-time applications: 609,403 qualified, 49,538 were rejected, **218,043 (about 24%) were still incomplete** because documents were missing, and 16,863 were withdrawn | NSFAS briefing reported by Business Report, TimesLIVE and News24, 3 to 6 Jan 2026 |
| The outstanding documents were mainly the **parental consent form** and a correctly completed, signed **declaration form** | TimesLIVE, 5 Jan 2026 |
| Typical consent-form failures: signed by the student instead of the parent, undated, mandatory fields missing, only one parent covered when Home Affairs records show two, declaration form needed when the person listed is not the parent on record | SAnews, 5 Feb 2026 (NSFAS acting CEO) |
| Applicants have **30 days** from notification to supply missing documents, or the application is treated as unsuccessful | NSFAS, via TimesLIVE |
| APS calculators and course matchers already exist (UniApplyForMe, UniAPS, FundiConnect, GoCareers and others), and their rules often disagree with each other | Our research, 24 Oct 2026 |

The rejection rate is about 5.5%; the paperwork failure rate is about 24%. The expensive problem is not eligibility, it is paperwork. Existing sites explain it in articles. We make it **personal, interactive and time-aware**.

**Pitch line:** "About 1 in 4 first-time NSFAS applications was still incomplete. Beyond Tomorrow makes yours complete the first time."

Caveat to keep honest: "incomplete" was a snapshot at announcement time; some students fixed theirs afterwards.

---

## 2. What we build, in priority tiers

| Tier | Feature | Why it earns marks |
|---|---|---|
| **P0 (must ship)** | **Funding route finder**: income bracket to the right NSFAS or other route, including the "missing middle" (R350,001 to R600,000) loan route | Impact, Creativity |
| **P0** | **Household wizard** (about 6 questions) producing a **personalised document list**: which forms, who signs, why | Product, Usability |
| **P0** | **Document cards with a pre-submission check** (signed by the right person, dated, all fields, both parents covered, readable photo) | Product, Usability |
| **P0** | **Deadline countdown** on the NSFAS closing date and per-document due dates | Usability |
| **P1 (should ship)** | **Risk forecast**: "your most likely failure points are X, Y, Z" (rule-based, transparent) | Intelligence |
| **P1** | **30-day fix clock** for "my application is incomplete" | Impact, Intelligence |
| **P1** | **Printable and shareable checklist** (print stylesheet, no personal data in shared text) | Usability, low-data access |
| **P2 (only if time remains)** | **Light feasibility check** for 1 to 2 institutions verified from official pages, plus the **what-if slider** | Creativity (demo moment) |
| **P2** | Plain-language verdict wording reused from the coach's statement builder | Presentation |

## 3. What we keep, demote and cut

| Existing item | Decision |
|---|---|
| Auth (email and Google), Supabase, RLS, audit columns, admin flag | **Keep** |
| `funding_sources` (NSFAS bursary and loan rows, `income_floor`, `provider_type`) | **Keep**: it feeds the route finder |
| `checklist_tasks` and `checklist_progress` | **Keep and extend**: tasks gain dependencies; document checks are added |
| Scoring engine stubs (APS strategies, fit, eligibility, recommend) | **Demote to P2**. Do not invest before P0 and P1 are done |
| What-if slider | **P2**, demo moment only, on verified sample institutions |
| Resources module | **Keep, trimmed**: scam warning, official links, "how to appeal" |
| Loans comparison (banks) | **Keep as a small "if you still have a gap" section**, labelled as debt |
| Pitch/business-model PDF | **Update** to lead with the paperwork problem (section 10) |
| "Connect" page, wellness, ML prediction | **Stay cut** |

## 4. The core user journey (what the judge sees)

1. **Sign in** (demo account).
2. **Route**: pick an income bracket. The app shows the route (for example "NSFAS bursary, likely" or "NSFAS loan, may qualify") with source and verified date.
3. **Wizard**: six short questions (age band, who supports you, how many parents appear on your records, whether the person supporting you is your parent on record, acceptance status, optional special circumstances that stay on the device).
4. **Your documents**: cards for each required document, each saying why it is needed, who signs, and a three to five item pre-submission check.
5. **Risk banner**: for example "High risk of being returned: 2 signatures needed, and a declaration form". Top three reasons, one next action.
6. **Deadline countdown**: days left to the NSFAS closing date and the estimated days of work remaining.
7. **If already marked incomplete**: pick the status, enter the notification date, and a **30-day clock** starts with the outstanding items.
8. **Print or share the checklist.**

## 5. Schedule (hackathon ends Sun 25 Oct 17:00; submit Mon 26 Oct 23:59)

Assumption: feature freeze at Sunday 17:00 (Q13 in `07_...`). Sizes: S up to 1h, M 2 to 3h, L 4h or more.

| Block | When | Goal | Who |
|---|---|---|---|
| **A. Facts and data** | Sat afternoon | Verify NSFAS rules from official pages (section 7); lock the question list; write the SQL migration; agree types | Daniel, pitch lead, Jeremie and Andile |
| **B. Engine and skeleton** | Sat evening | Engine modules with tests; wizard and route screens with fake data; migration applied | Jeremie and Andile (engine), Blessing and Katlego (UI), Daniel (DB) |
| **C. Integrate** | Sun morning | Real rule data loaded; document cards, pre-flight, risk banner, countdown wired to the engine | All |
| **D. Prove it** | Sun 12:00 to 16:00 | Hosted deploy, usability test with outsiders, 10 to 15 real users, security tests, fixes | All, security lead |
| **E. Freeze** | Sun 16:00 to 17:00 | Final fixes only; tag a release; record screenshots | All |
| **F. Package** | Mon | Video, deck, SSDLC form, canvas, submit early | Pitch lead, security lead |

## 6. Task breakdown by person

### Daniel (database and data)
- [ ] **(M)** Write and run `06_readiness.sql` (tables in the spec, section 7), with RLS and grants, committed to `/db`
- [ ] **(L)** Author the **seed content**: document types, rules, checks, each with `source_url`, `last_verified`, `verification` status
- [ ] **(M)** Update `funding_sources` NSFAS rows (deadline, route codes); verify dates on nsfas.org.za
- [ ] **(S)** Extend `traction_stats()` with coach counts (counts only)
- [ ] **(S)** Run RLS tests for the new tables; screenshot for the SSDLC form
- [ ] **(S)** Demo account with a realistic fake household scenario

### Jeremie and Andile (engine and API)
- [ ] **(M)** New engine types and the **condition evaluator** (`rules.ts`)
- [ ] **(M)** `findFundingRoutes` (`routes.ts`)
- [ ] **(M)** `requiredDocuments` and `evaluatePreflight` (`documents.ts`)
- [ ] **(M)** `criticalPathDays`, `computeFixClock`, revised `assessDeadlineRisk` (`deadlines.ts`)
- [ ] **(M)** `forecastIncompleteRisk` (`risk.ts`)
- [ ] **(M)** Statement builders (`statements.ts`) with templates and caveats
- [ ] **(M)** Unit tests for the 8 scenario personas (spec, section 12)
- [ ] **(S)** Zod schemas for reference data loaded from Supabase (validate at the edge)
- [ ] **(optional)** API route for rate-limited event logging

### Blessing and Katlego (frontend)
- [ ] **(S)** `copy.ts`: all user-facing strings in one file (translation-ready)
- [ ] **(M)** Route screen and `RouteCard`
- [ ] **(L)** `Wizard` (one question per screen, back/next, progress)
- [ ] **(L)** `DocumentCard` with `PreflightList` and `VerifiedBadge`
- [ ] **(M)** `RiskBanner` and `Countdown`
- [ ] **(M)** `FixClock` screen
- [ ] **(S)** Print stylesheet and share-as-text
- [ ] **(M)** Mobile, keyboard and screen-reader pass; 360px width
- [ ] **(S)** Scam notice and debt notice components

### Security lead (to be assigned)
- [ ] Review new tables' RLS; confirm special-category items never persist (spec, section 7)
- [ ] Run the extended test pack; keep evidence
- [ ] Final check of the hosted app, demo account and headers

### Pitch lead (to be assigned)
- [ ] Verification checklist (section 7), shared with Daniel
- [ ] Usability and traction sessions (section 9)
- [ ] Updated storyboard, deck, canvas (section 10)

## 7. Facts to verify before the rules are coded

Everything marked "secondary" comes from news or third-party guides, not nsfas.org.za. **Do not hard-code a rule until it is confirmed on an official NSFAS page or a university/NSFAS-published guide.** Record the source and date in the data row.

| # | Fact | Current evidence | Status |
|---|---|---|---|
| V1 | NSFAS 2027 closing date | 31 Oct 2026 (several sites); one site expects January 2027 | **Conflict**: confirm on nsfas.org.za |
| V2 | Signed and dated consent form required for **every** applicant | Wits-hosted 2027 NSFAS guide | Secondary |
| V3 | Consent form must cover **every parent identified on Home Affairs records**, even if only one supports you | SAnews, 5 Feb 2026 | Reported by NSFAS acting CEO |
| V4 | Declaration form needed when the people you declare are not your parents on Home Affairs records (the Wits guide says "under 35"), and that person also signs a consent form | SAnews; Wits guide | Secondary; confirm age condition |
| V5 | Orphan and vulnerable child form (Wits guide says "under 18, may be required") | Wits guide; third-party guides | Secondary; confirm condition |
| V6 | Disability Annexure A for disability-based applications | Wits guide | Secondary |
| V7 | Proof of acceptance needed for some first-time students who qualify financially | NSFAS via TimesLIVE | Reported |
| V8 | **Certified copies**: one guide says certification is no longer required, others still list certified copies | Conflicting third-party guides | **Conflict** |
| V9 | Phone photos accepted if the whole document is visible and readable | Third-party 2027 guide | Secondary |
| V10 | Documents older than three months can cause delays | One third-party guide | Secondary |
| V11 | 30-day window for missing documents; incomplete after that is "unsuccessful" | NSFAS statement | Reported |
| V12 | 30-day window to submit a complete appeal | NSFAS statement | Reported |
| V13 | Official application channel (myNSFAS web, and whether an official mobile app exists) | Sources disagree on the app | **Conflict**: only advise "official channel" until verified |
| V14 | NSFAS never charges to apply | Third-party scam warnings | Secondary; confirm |
| V15 | Income thresholds R350,000 and R600,000; loan band | NSFAS loan page verified earlier; bursary threshold from secondary sources | Verify bursary threshold on official page |
| V16 | Whether SASSA grant recipients meet the financial criteria automatically | Secondary | Secondary |

**Rule for the UI:** a row with status "secondary" or "conflict" shows "Confirm on nsfas.org.za" beside it. A row with no verified date is not shown.

## 8. Acceptance criteria (definition of done)

**P0 done when** a person who did not build it can, on the hosted app and in under 3 minutes:
1. choose a bracket and see the correct route with source and date,
2. finish the wizard and see a document list that matches the scenario,
3. tick the pre-submission checks and see unticked items called out,
4. see the countdown to the NSFAS closing date,
5. with no crashes on bad or missing input.

**P1 done when** the risk banner shows level, top three reasons and a next action, and the fix clock counts down from a notification date.

**Data done when** every displayed rule has `source_url`, `last_verified` and a `verification` status, and V1, V2, V3, V8 and V13 are resolved or visibly flagged.

## 9. Test and traction plan

**Engine tests:** eight scenario personas (spec, section 12), written with expected outputs **before** the engine code.

**Usability test (Sunday late morning):** two people outside the team. Task: "Find out what you need to apply for NSFAS and what could go wrong." Record where they hesitate. Fix the top two problems.

**Traction and effect (Sunday midday to afternoon):** 10 to 15 real learners.
- Before the tool: ask them to list the documents they think they need.
- After the tool: repeat.
- Record: documents correctly named before and after, time taken, one quote.
- Report only what you measure, as a small pilot, not as proof of a reduction in incomplete applications.
- Minors: get parental or guardian consent; keep the session to categories, never IDs.

## 10. Pitch and judging alignment

**Updated 90-second storyboard**

| Time | Show | Say |
|---|---|---|
| 0:00 to 0:12 | The statistic | "About 1 in 4 first-time NSFAS applications was still incomplete last year. Missing paperwork, not eligibility." |
| 0:12 to 0:30 | Sign in, pick income bracket, route appears | "Beyond Tomorrow shows your route, including the missing middle." |
| 0:30 to 0:55 | Wizard, then document cards with the pre-check | "Six questions. It tells you exactly which forms, and who must sign." |
| 0:55 to 1:12 | Risk banner and countdown | "It predicts where you are most likely to be returned, and how many days you have." |
| 1:12 to 1:22 | Fix clock for an incomplete application | "Already marked incomplete? Your 30 days start here." |
| 1:22 to 1:30 | Close | "Don't just guess your future. Unlock it." |

| Criterion | How we show it |
|---|---|
| Product | End-to-end journey on a real account with sourced data |
| Creativity | Paperwork readiness as the product, not another course list |
| Usability | One question per screen, one next action |
| Sustainability | Schools, NGOs, funders and institutions all gain from fewer incomplete applications (planned, not validated) |
| Impact | About 218,000 incomplete first-time applications (2026 intake) |
| Presentation | One student's story, one statistic |
| Intelligence | Transparent rule-based risk forecast from household inputs; honest that it is not machine learning |

## 11. Decisions to record in `02_DECISIONS.md`

| ID | Decision | Why | Why not the alternative |
|---|---|---|---|
| D23 | Core focus is **NSFAS paperwork readiness**, not course matching | Sourced pain point (about 24% incomplete); crowded APS market; our strength is the process side | APS-first: others already do it and sources disagree on rules |
| D24 | **Rules are data** (tables), evaluated by a small typed condition evaluator, never `eval` | NSFAS rules change yearly; admin updates without redeploy; auditable with sources | Hard-coded rules go stale; `eval` or free-form code in data is a security risk |
| D25 | **Special-category answers (disability, vulnerable child) never leave the device** | POPIA special personal information; minors | Persisting them for convenience is not worth the risk |
| D26 | Engine runs **in the browser** for the coach; no new API routes in P0 | Fewer moving parts; privacy; free hosting | A server round trip adds hosting risk for no gain |
| D27 | Risk forecast is a **transparent weighted rule list**, weights stored as data | Honest "Intelligence"; explainable; tunable | A trained model: no data, would be fake |
| D28 | Unverified rules are **displayed with "Confirm on nsfas.org.za"** or hidden | Wrong paperwork advice harms students | Presenting secondary information as fact |
| D29 | **No document uploads, no ID numbers, no parent details** | Data minimisation, minors, POPIA | Upload-based "AI document checking" is out of scope and a privacy risk |
| D30 | APS and what-if are **P2** and limited to institutions verified from official pages | Avoid inaccurate numbers (third-party sources contradict each other) | Claiming "all universities, instantly" |

## 12. Risks and open questions

| # | Risk or question | Mitigation or action |
|---|---|---|
| R20 | Rules turn out different on the official pages | Block A is verification first; show verification status in the UI |
| R21 | Too much scope for about 30 hours | P0 first; P1 only after P0 is on the hosted app; P2 only if time is left |
| R22 | We cannot see a student's real NSFAS status | All copy is guidance; the user self-reports; no claims of tracking |
| R23 | The "24%" statistic is a snapshot | Say "were still incomplete when announced" |
| R24 | Backend pair new to TypeScript | Pure functions, tests first, pair on `rules.ts` |
| Q15 | Is the NSFAS closing date 31 Oct or later? | V1 above |
| Q16 | Is advising "certified copy needed" right for 2027? | V8 above |
| Q17 | Which languages for the demo? | English now; strings live in `copy.ts` so isiZulu and others can follow |

## 13. Documents to update after this plan is accepted

- `02_DECISIONS.md`: add D23 to D30
- `03_ARCHITECTURE.md`: add the readiness engines and new tables
- `04_TASKS_CHECKLIST.md`: replace Saturday and Sunday build tasks with section 6
- `06_DATA_AND_FACTS.md`: add the V1 to V16 table
- `07_RISKS_AND_OPEN_QUESTIONS.md`: add R20 to R24 and Q15 to Q17
- `08_SUBMISSION_AND_DEMO.md`: replace the storyboard and deck outline with section 10
- ERD and UML diagrams: add the new tables and engine modules
