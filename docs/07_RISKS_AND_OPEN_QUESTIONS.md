# 07. Risks and open questions

## Project risk register

| # | Risk | Likelihood | Impact | Mitigation | Trigger to act |
|---|---|---|---|---|---|
| R1 | Scope creep across the broad problem statement | High | High | Decision D03 and the cut line in `04_...` | Any new feature request before the MVP works |
| R2 | Engine logic takes longer than planned (team new to TypeScript) | Medium | High | Pair on the engine; write persona tests first; keep functions small | Eligibility not working by Saturday midday |
| R3 | Real data not ready, demo looks empty | Medium | High | Daniel starts curation Friday; start with 2 institutions | No real courses loaded by Saturday evening |
| R4 | Wrong or stale data shown to students | Medium | High | `source_url`, `last_verified`, stale flag, estimate labels | Any unverified row reaching the demo |
| R5 | API hosting not decided or free tier fails | Medium | Medium | Decide Friday (Q2); fallback is Supabase-only | No hosted API by Saturday night |
| R6 | Email confirmation does not reach judges | Medium | High | Pre-created auto-confirmed demo account; test it | Demo sign-in fails in a clean browser |
| R7 | Google sign-in blocked (app in Testing status) | Medium | Medium | Publish the OAuth app or rely on email for judges | Non-listed Google accounts rejected |
| R8 | Supabase project paused or limited on the free tier | Low to medium | High | Check current limits; keep a SQL export; open the app Sunday and Monday | App unreachable (**unverified, check current rules**) |
| R9 | Nobody owns the pitch, deck, video | **High** | High | Assign a pitch lead today | Still unassigned Saturday morning |
| R10 | Traction numbers missing | Medium | Medium | Plan 20 to 30 users on Sunday; consent for minors | Fewer than 10 users by Sunday evening |
| R11 | Team member unavailable | Medium | Medium | Backups listed in `04_...`; small pull requests | Anyone offline more than half a day |
| R12 | Last-hour submission failure on Sonke | Medium | High | Submit by mid-afternoon Monday; keep confirmation | Not submitted by 18:00 Monday |
| R13 | Disqualified as a "static site" | Low | Critical | Real sign-in, real database writes shown in the demo; confirm with organisers (Q3) | Organiser feedback |
| R14 | Pre-work questioned | Low | Medium | Features built during the event; written confirmation (Q1) | Organiser feedback |
| R15 | Merge conflicts and broken main | Medium | Medium | Branch per person, pull requests, CI, second reviewer | Failing CI on `main` |
| R16 | Overspending time on security | Medium | Medium | Decision D20 (about a tenth) | Security tasks crowding out the journey |

## Open questions

| # | Question | Owner | How to resolve | Needed by |
|---|---|---|---|---|
| Q1 | How much pre-work is acceptable before kickoff? | Team lead | Email support@geekulcha.dev or Help Me button; keep the reply | Friday |
| Q2 | Where does the Node API run for free (or do we drop it for Supabase-only)? | Jeremie, Andile, Daniel | Compare free tiers; decide on whether the API is needed for judged features | Friday |
| Q3 | Is a hosted React app with a live Supabase backend clearly "not a static site"? | Team lead | Ask organisers; keep the demo showing live writes | Friday |
| Q4 | Deck format: PDF or PowerPoint? | Pitch lead | Ask support@geekulcha.dev | Saturday |
| Q5 | Custom SMTP, or pre-created demo accounts only? | Daniel | Check Supabase's current email limits; decide | Saturday |
| Q6 | Consent handling for minors; add a `consent_at` column? | Team | Agree wording; add to `student_profiles` | Saturday |
| Q7 | Which institutions and bursaries do we curate? | Daniel and team | Pick by student demand and published data quality | Friday |
| Q8 | Who is the security lead? | Team | Assign | Friday |
| Q9 | Who is the pitch lead? | Team | Assign | Friday |
| Q10 | Do we need an installable PWA, or is a responsive web app enough? | Frontend | Responsive first; PWA only if time remains | Sunday |
| Q11 | ERD and UML still show the original schema: update before the deck? | Daniel | Add audit columns and funding columns to the diagrams | Sunday |
| Q12 | Which weights and margins do we settle on? | Backend | Tune against the five personas | Saturday |

## Things we said we would verify

- [ ] NSFAS closing date and thresholds on nsfas.org.za
- [ ] Each institution's APS method and requirements
- [ ] Supabase free-tier limits (email delivery, inactivity pause)
- [ ] Google OAuth publishing rules
- [ ] Free API hosting limits
- [ ] Lender registration with the National Credit Regulator; Fundi's terms
