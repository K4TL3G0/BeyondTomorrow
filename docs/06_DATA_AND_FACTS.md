# 06. Data, facts and verification

Wrong data in a funding and admissions tool harms students. This file records what we checked, what conflicts, and what is just our assumption.

## Curation rules (Daniel)

1. Every course, institution, funding and resource row has `source_url` and `last_verified`.
2. Copy requirements and APS methods from the institution's **published** page. Do not guess.
3. Start with 2 or 3 institutions and a handful of courses. Small and accurate beats large and wrong.
4. Link only to official domains. Fake NSFAS and bursary links are a known scam risk.
5. Re-running a seed script must not change `last_verified`; only a person who re-checked may.
6. Remove all `SAMPLE DATA` rows before the real demo.
7. Show the verified date in the UI, and flag data older than 90 days (**Assumption**, `stale_after_days`).

## NSFAS facts

| Fact | Status | Source and notes |
|---|---|---|
| 2027 applications opened 18 Sep 2026 | **Verified** (news coverage) | Government news agency and business press |
| Closing date | **CONFLICT** | SAnews reported 18 Nov 2026 (outcomes in December). Later coverage reported 31 Oct 2026 with no extension; one site said the official NSFAS site lists 31 Oct. One blog said 21 Jan 2027, which contradicts everything else (ignore). **We use 31 Oct as the working date** (stricter). **Re-verify on nsfas.org.za** |
| Public TVET applications closed 30 Sep 2026 | Reported | SAnews |
| Bursary income threshold R350,000 household income per year; R600,000 with disability | **Verified** (consistent across sources; not yet read on the official page) | Re-check on nsfas.org.za |
| Social grant recipients (Foster Care, Care Dependency, Child Support) meet financial criteria | Reported | Secondary source; verify |
| Loan band R350,000 to R600,000 | **Verified** | NSFAS loan page, read 23 Oct 2026: household income between R350,000 and R600,000, public university or TVET, loan agreement and consent form required, NSFAS listed as a registered credit provider |
| NSFAS loan page currency | **Caution** | Page text still refers to 2024 applicants, so the current-year process may differ |
| Meeting the threshold does not guarantee funding or a place | Reported | Always say so in the UI |

Source-quality note: most NSFAS information above came from news and guidance sites, not the official pages. Treat anything not read on nsfas.org.za as provisional.

## Loan providers (checked 23 Oct 2026)

| Provider | Status | Key points |
|---|---|---|
| NSFAS Missing Middle Loan | Verified | See above |
| Standard Bank Student Loan | Verified | Full- or part-time study, with or without surety. The page says applications for the Standard Bank-backed **no-surety** option are **closed** (time-sensitive). Online quote available |
| Absa Study Loan | Verified | Covers tuition, accommodation, books, equipment, one year at a time, minimum R15,000. Borrower must be a SA citizen or permanent resident earning over R3,000 per month, and may be a parent, sponsor or guardian. Interest-only for the first 12 months possible. Credit life insurance mandatory |
| Manati | Verified | Online, individually assessed, registered credit provider. Calculator uses an illustrative rate only |
| Fundi | **Not verified** | Page did not render its terms when checked. Verified date left empty. Do not list until checked |
| UJ page | Verified | It is a **partnership with Student Hero**, a free comparison service listing several lenders, not UJ's own loan product. Stored as a guide in `resources` |

Rules for loans: bursaries first; loans labelled as debt; bank and private loans are options to compare, never "matched"; link out and never collect lender application data. Check each lender's National Credit Regulator registration before listing (NSFAS, Standard Bank, Absa and Manati state theirs on their pages; not confirmed for Fundi).

## Hackathon facts (from the brief)

| Fact | Notes |
|---|---|
| Static sites and CMS-built sites are not allowed | App must receive and process data in real time |
| Hosting | Free hosting allowed (for example Vercel, Firebase). Web apps must be hosted |
| Submission | Deck (10 slides max), SSDLC form, Lean Business Canvas, demo video (90 seconds max), demo account for judges |
| Deck format | **Inconsistent in the brief:** "PDF preferred" vs "PowerPoint Slides" in the checklist. Confirm with support@geekulcha.dev |
| Existing app | Allowed if at least one feature is built during the hackathon and the team attends all programme sessions |
| Deadline | Monday 26 Oct, 23:59 via Sonke; hackathon itself ends Sunday 25 Oct with no mentor support after |

## Assumptions (our own numbers: tune or confirm)

| Assumption | Where | How to validate |
|---|---|---|
| Scoring weights 0.5 fit, 0.3 margin, 0.2 funding | `scoring_weights` | Test against the five personas |
| "Close" = within 3 APS points, one subject within 5 percent | `scoring_weights` | Personas; sanity-check with real students |
| Checklist `est_days` (3, 1, 5, 1, 2, 3, 1) | `checklist_tasks` | Ask a few real applicants |
| Stale after 90 days | `scoring_weights` | Team decision |
| 7-point scale (80 to 100 = 7 ... 0 to 29 = 1) | Sample institution only | Each real institution publishes its own |
| Income brackets break at R350k and R600k | `student_profiles` check | Update yearly |

## Open data questions

- Which 2 or 3 institutions do we curate first, and who picks them?
- Which bursaries qualify for the demo, and are they currently open?
- Do we show any lender rates? **No**, unless verified and dated. Show "indicative only".
