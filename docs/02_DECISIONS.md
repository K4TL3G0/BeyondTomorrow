# 02. Decision log

Each decision: **what**, **why we chose it**, **why not the alternatives**, and **when to revisit**.
Status: Decided / Proposed / Open.

---

## D01. Build a data-driven web app (React, optionally installable as a PWA)
**Status:** Decided

**Why.** The brief allows native apps, web apps, PWAs and "over the top" bots, but **bans static sites**: the app must receive and process data in real time. A React app with accounts and a live database satisfies that, runs on any phone browser, and is the cheapest to host.

**Why not:**
- *Static HTML/CSS site* (our first repo): explicitly disallowed for submission.
- *WhatsApp bot*: needs evidence of data ownership and a clear commercialisation strategy, which is extra work in a weekend.
- *Native app*: slower to build, and judges would need a build file instead of a link.

**Revisit if** organisers say hosting static files with a live backend is a problem (see open question Q3).

---

## D02. Stack: React + Vite + TypeScript, Node/TypeScript API, Supabase (PostgreSQL)
**Status:** Decided

**Why.** TypeScript everywhere means one shared engine package, shared types, fewer integration bugs. Supabase gives Postgres, Auth, and Row Level Security on a free tier, which removes the need to hand-build auth and access control.

**Why not Java / C++ for the backend or engine:**
- Vercel (our planned free host) does not run Java, so hosting becomes a new problem.
- The what-if slider must run **in the browser**, which needs TypeScript.
- Two more languages means more setup and more attack surface in three days.
- *Trade-off we accept:* Jeremie and Andile work mostly in Java/C++, so they take on a language they know less well. Mitigation: they pair on the engine, and the engine is plain functions with tests.

**Revisit if** the team cannot be productive in TypeScript by Saturday morning.

---

## D03. One sharp wedge, not the whole problem statement
**Status:** Decided

**Why.** The problem statement is huge (pathways, funding, applications, wellness, persistence, connectivity). Judges reward a complete, polished journey over a wide, shallow one ("Is the app a complete solution?").

**What we chose:** marks to pathways to funding to checklist, backed by the APS, Bursaries and Resources modules. Everything else is roadmap, mentioned in the deck only.

**Why not build more:** every extra feature dilutes polish and the demo. The "Connect" page was cut for this reason.

---

## D04. "Intelligence" = a transparent scoring model + what-if forecasting + deadline-risk nudge. Not machine learning.
**Status:** Decided

**Why.** The Intelligence criterion asks whether the app can forecast or predict from patterns. We can honestly deliver:
- a **fit and eligibility score** with reasons,
- a **what-if simulator** ("raise Maths by 8% and these courses unlock"), which is forecasting a threshold,
- a **deadline-risk check** (estimated work remaining vs days left).

**Why not ML:** we have no user history, so any "trained model" would be fake, and judges will ask what data it learned from. We say instead: "transparent rules today, an event log in place so it can learn as usage grows."

**Why not drop-off prediction:** it needs real usage patterns we will not have by Sunday.

**Revisit if** we collect meaningful usage data during traction testing (still probably too little).

---

## D05. The scoring engine is a pure TypeScript package shared by web and API
**Status:** Decided

**Why.**
- The **same code** runs in the browser (instant what-if, and marks never leave the device) and on the API (authoritative result).
- Pure functions (no I/O) are easy to unit-test with hand-computed students.
- One source of truth for rules.

**Why not duplicate logic in the front end and back end:** the two copies drift apart and give different answers.

---

## D06. APS calculation uses a Strategy pattern, one strategy per institution method
**Status:** Decided (strategies themselves **not yet verified**)

**Why.** Institutions calculate APS differently (for example, how Life Orientation is treated, or how many subjects count). Each method is a small plug-in behind one interface, keyed by `institutions.aps_method_code`. Adding an institution means data plus (maybe) one strategy; the engine does not change.

**Why not one formula:** it would be wrong for some institutions, and wrong advice harms students.

**Condition.** Every method must be copied from the institution's **published** rules, with `source_url` and `last_verified`. The "7-point scale" seed bands apply to the **sample** institution only.

---

## D07. Recommendation text comes from deterministic templates, never free-form generation
**Status:** Decided

**Why.** In admissions and funding, a made-up bursary or wrong requirement does real harm. Templates fill each sentence from a structured result and skip anything missing. They are testable, fast, explainable, and send no student data to a third party.

**Why not an LLM-written paragraph:** risk of invented facts, privacy concerns, harder to test.

**Allowed later:** an LLM may *rephrase* a finished template for tone, but never supply facts.

---

## D08. Row Level Security is the primary access control. Admin = `app_metadata.role`. No `service_role` key anywhere.
**Status:** Decided

**Why.**
- The Supabase anon key is public by design; **RLS is the real guard**.
- Admin role lives in `app_metadata`, which users cannot edit (they *can* edit `user_metadata`).
- The API acts **as the signed-in user** (their own token), so RLS still applies and no all-powerful key exists to leak.

**Why not the `service_role` key:** it bypasses RLS entirely; one leak exposes every student's data.

**Why not a custom auth system:** slower, riskier, no benefit.

**Consequence.** An admin must sign out and in again after receiving the flag, and the flag must be verified (see `05_...`).

---

## D09. Minimum data: marks, province, income bracket, interests. Never ID numbers, payslips or SASSA documents. No disability flag.
**Status:** Decided

**Why.** Many users may be minors, and POPIA treats children's information as special personal information. Less data held means less to leak.
- **Income bracket, not exact income.** Brackets break at the published NSFAS thresholds (R350,000 and R600,000), which is all the funding indicator needs.
- **No disability flag.** The `350k_to_600k` bracket lets the engine say "may qualify" without collecting health information.

**Why not collect more "for better matching":** the matching gain is small and the risk and compliance cost are large.

**Gap.** A consent timestamp on profiles is recommended but not yet added (Q6).

---

## D10. NSFAS is shown as an indicator against the published threshold, never an approval prediction
**Status:** Decided

**Why.** Only NSFAS decides. We compare the student's bracket with published thresholds and always say "final decisions rest with NSFAS." A fake percentage would mislead students and damage credibility.

---

## D11. Reference data is hand-curated, small, and every row carries `source_url` and `last_verified`
**Status:** Decided

**Why.** A small accurate dataset (2 or 3 institutions, a handful of courses) beats a large wrong one. Visible verification dates build trust and let the app flag stale data.

**Why not scraping:** fragile, legally grey, and error-prone for requirements that change yearly.

**Rule.** Re-running seed scripts must **not** re-stamp `last_verified`; only a human who re-checked a source may change it.

---

## D12. Funding order: government and bursaries first, loans as "options to compare". Bank loans are not "matched".
**Status:** Decided

**Why.**
- Free money should come before debt.
- Bank and private loans depend on a credit assessment and often a parent's or guarantor's income, so they cannot honestly be matched to a student's income bracket. A `provider_type` column separates government rows (matched) from bank and private rows (compared).
- NSFAS's loan has a published income band (R350,000 to R600,000), modelled with `income_floor` and `income_ceiling`.

**Why not rank loans alongside bursaries:** it nudges young people toward debt.

**Why not collect lender application data:** lenders ask for ID numbers and income; we link out instead, to keep our data-minimisation promise.

**Why not affiliate or sponsored placement now:** it would undermine trust. If added later, disclose it clearly.

**Note.** Fundi's terms could not be read when checked, so it has no verified date and should not be listed until checked.

---

## D13. Subjects use a fixed-code table, not free text or JSON
**Status:** Decided

**Why.** "Maths", "Mathematics" and "Mathematical Literacy" must never be confused; the difference changes eligibility. A `subjects` table with codes plus a `course_requirements` join table lets the database enforce validity.

---

## D14. Scoring weights are data, and every run stores a snapshot of the weights used
**Status:** Decided

**Why.** Tune without redeploying, and keep results reproducible ("why did this change?"). Weights (50/30/20 for fit, margin, funding) and margins (3 APS points, 5 percent) are **Assumptions** to tune against test personas.

---

## D15. `events` and `recommendation_runs` are append-only
**Status:** Decided

**Why.** An audit trail and honest traction data. Students cannot edit or delete these rows (grants revoked); deleting the account cascades.

---

## D16. Sign-in: email and password, plus Google
**Status:** Decided; setup in progress

**Why.** Email is universal; Google lowers friction for students.

**Cautions.**
- Supabase's built-in email sending is heavily limited and may only deliver to team members (**unverified, check current docs**). Judges therefore get a **pre-created, auto-confirmed demo account**.
- While the Google OAuth app is in "Testing" status, only listed test users can sign in. Move it to production before judging.
- Test accounts stay non-admin so the security tests prove something.

---

## D17. Hosting: web on a free static host (Vercel config prepared); API host is undecided
**Status:** Web decided; API **Open** (Q2)

**Why.** The built React app is static files, but the **app** receives and processes live data through Supabase. Security headers are configured in `web/vercel.json`.

**Open:** where the Express API runs for free. Options: a free tier of a Node host (check limits), or move the few server-side jobs (validation, admin stats) into Supabase functions and RLS, dropping the API. Decide early.

---

## D18. Monorepo with workspaces; the old static prototype is retired
**Status:** Decided

**Structure:** `web/`, `api/`, `packages/engine/`, `db/`, `docs/`, plus CI and a pull request template.

**Why.** One repo, shared types, one install, simple CI. The old HTML pages are ported into React; their design (colours, fonts) is reused, not thrown away.

**Why not keep the static pages:** not an allowed app type.

---

## D19. The scaffold ships with stubs; features are built during the hackathon
**Status:** Decided

**Why.** The setup (structure, database, auth, security middleware) is preparation. The engine logic and UIs are intentionally left as "not implemented" stubs so the real feature work happens at the event, in line with the rule that an existing app must have at least one feature built during the hackathon.

**Open (Q1):** confirm with organisers how much pre-work is acceptable, and get the answer in writing.

---

## D20. Security gets about a tenth of our time
**Status:** Decided

**Why.** The seven judging criteria do not include security, but the SSDLC form is required, and a leak would sink Product and Presentation. We keep RLS, validation, secrets hygiene and a short test pack, and no more.

---

## D21. Weekend priorities (the order we protect)
**Status:** Decided

1. A working end-to-end journey on real (small) data.
2. The what-if slider and the explained recommendations (Intelligence, Creativity).
3. Usability on a phone.
4. Traction: 20 to 30 real people tried it.
5. Deck, 90-second video, SSDLC form, Lean Business Canvas.
6. Everything else.

If we fall behind, use the **cut line** in `04_TASKS_CHECKLIST.md`.
