# 04. Tasks and checklist

Today is **Friday 23 October** (kickoff 10:00). Submission is **Monday 26 October, 23:59**.
Tick items as they are done. "Evidence" means keep a screenshot for the SSDLC form.

## Needs an owner today

- [ ] **Security lead** assigned (keeps the checklist and evidence screenshots)
- [ ] **Pitch and business lead** assigned (deck, video, Lean Business Canvas, traction)
- [ ] One person **creates the team profile on Sonke** (nothing can be submitted without it)
- [ ] Everyone knows the war-room time on Saturday and the Help Me button for mentors

## Friday: foundations (anything unfinished moves to first thing Saturday)

### Everyone
- [ ] Team profile created on Sonke; members added
- [ ] Post your workspace on social media (prize eligibility)
- [ ] Old static files removed on a `chore/restructure` branch; scaffold merged via pull request
- [ ] Branch protection on `main` (pull request and one review required)
- [ ] `npm install`, `.env` files created from the examples, app runs locally
- [ ] Hand-write **five fictional student personas** with expected results (they become unit tests and demo characters). Include one exactly at an APS cut-off and one on an income-threshold boundary

### Daniel (Database)
- [ ] Run SQL in order: `01_schema_and_rls.sql`, `02_seed.sql`, `04_resources.sql`, `05_student_loans.sql`
- [ ] Confirm all tables show RLS enabled; check the Security advisor
- [ ] Create Daniel's account; set the **admin flag**; confirm the `returning` row shows `role: admin`; sign out and in (evidence)
- [ ] Create two non-admin test users; run `03_rls_tests.sql` one test at a time (evidence)
- [ ] Auth settings: email on, confirm email on, password minimum 8, URL configuration, Google provider (see `AUTH_SETUP.md`)
- [ ] Decide custom SMTP vs pre-created demo account for judges (Q5)
- [ ] Start curating **2 or 3 institutions**: APS method, band table, 5 to 10 courses with requirements, each with `source_url` and `last_verified`

### Jeremie and Andile (Backend)
- [ ] Agree TypeScript pairing approach; run engine tests locally
- [ ] Confirm engine types match the schema (add `description`, `income_floor`, `provider_type` to `FundingSource`)
- [ ] Turn the five personas into `it.todo` then failing tests (write tests first)
- [ ] Decide API hosting with Daniel (Q2)

### Blessing and Katlego (Frontend)
- [ ] Port the existing design (colours, fonts, logo, login layout) into `web/src/styles` and components
- [ ] Layout, navigation and sign-in page working with Supabase auth (email and Google)
- [ ] Sketch the four key screens: Onboarding, Pathways (with slider), Funding, Checklist

## Saturday: build the core (war rooms today)

### Jeremie and Andile
- [ ] `pointsForMark` and the **APS strategy** for each verified institution method
- [ ] `evaluateEligibility` (qualifies / close / not_yet with numeric rules)
- [ ] `scoreFit`
- [ ] `matchFunding` (government rows matched; bank and private loans listed as options)
- [ ] `recommend` (rank by verdict tier, then weighted blend)
- [ ] `whatIf` (diff of baseline vs changed marks)
- [ ] `buildStatement` (templates, caveat, last-verified date, plurals, "2 of 5 steps")
- [ ] `assessDeadlineRisk`
- [ ] API: `POST /api/recommendations` validates, runs the engine, stores a `recommendation_runs` row
- [ ] All five persona tests green

### Daniel
- [ ] Real data loaded for the chosen institutions; **sample rows removed** (clean-up lines at the end of `02_seed.sql`)
- [ ] NSFAS deadline and thresholds re-verified on nsfas.org.za (sources conflicted: 31 Oct vs 18 Nov)
- [ ] Resources rows added (each with source and date), including a scam-safety guide
- [ ] Funding rows: NSFAS bursary and loan, 2 or 3 verified bursaries; Fundi only if verified
- [ ] Judges' **demo account** created (normal user, auto-confirmed, fake data)

### Blessing and Katlego
- [ ] Onboarding form: marks 0 to 100, province, income bracket, interests (validated, labels clear)
- [ ] Pathways page: ranked course cards showing the statement, verdict and caveat
- [ ] **What-if slider** wired to the engine in the browser
- [ ] Funding page: NSFAS indicator, bursaries, then loans with a "this is debt you repay" notice
- [ ] Checklist page with **countdown to closing dates** and the risk nudge
- [ ] Resources page with the scam warning
- [ ] Works on a small phone screen; keyboard and screen-reader basics

## Sunday: test, harden, get users

- [ ] Hosted app live (web and API); tested on the **hosted** version, not localhost
- [ ] **Usability test** with two people outside the team; fix the top two problems
- [ ] **Traction:** 20 to 30 real users tried it (parental or guardian consent where users may be minors); record sign-ups and one quote
- [ ] Security tests run and evidenced (see `05_SECURITY_AND_PRIVACY.md`)
- [ ] `npm run audit:high` clean; secrets scan of Git history and the built bundle
- [ ] Security headers confirmed on the hosted site
- [ ] Demo account tested end to end by someone who did not build it
- [ ] Record screenshots for the deck
- [ ] Remember: **no mentor support after Sunday**

## Monday: package and submit (target: done by mid-afternoon)

- [ ] Demo video recorded, **90 seconds maximum**
- [ ] Deck finished, **10 slides maximum**, includes demo video link and demo account details
- [ ] Confirm deck format with support@geekulcha.dev (brief says PDF preferred, checklist says PowerPoint)
- [ ] SSDLC form filled in (use the tracker and screenshots)
- [ ] Lean Business Canvas filled in
- [ ] Final production re-test; demo account works
- [ ] **Submit through Sonke** (Dashboard or team page, "Submit Files"); keep the confirmation
- [ ] After judging: delete test accounts and the demo account

## MVP: definition of done

A judge can open the hosted link, sign in with the demo account, and in under two minutes:
1. see ranked pathways with reasons for a sample student,
2. move the slider and see courses unlock,
3. see the funding indicator and options,
4. see a checklist with a live countdown,
5. read verified resources.

All data shown has a source and a verified date. Nothing crashes on bad input.

## Cut line (drop from the bottom if time runs short)

Protect in this order, drop in reverse:

1. Working journey with correct, small data
2. Explained recommendations
3. What-if slider
4. Funding indicator and bursaries
5. Checklist with countdown
6. Deadline-risk nudge
7. Resources page
8. Loan options
9. Google sign-in (email still works)
10. Polish, animations, extra institutions

## Ownership summary

| Area | Primary | Backup |
|---|---|---|
| RLS, schema, data, auth config | Daniel | Security lead |
| Engine, API, validation, rate limiting | Jeremie and Andile | Daniel |
| UI, front-end security, usability | Blessing and Katlego | Pitch lead |
| Evidence, SSDLC form | Security lead (TBC) | Daniel |
| Deck, video, canvas, traction | Pitch lead (TBC) | Blessing and Katlego |
