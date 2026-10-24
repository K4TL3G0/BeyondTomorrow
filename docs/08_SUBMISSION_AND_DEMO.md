# 08. Submission and demo

## Submission checklist (Sonke, deadline Mon 26 Oct 23:59)

You must have created a **team profile** first (one person only).

- [ ] Deck, **10 slides max** (PDF preferred; confirm vs PowerPoint)
- [ ] Demo video, **90 seconds max**, link on the slides
- [ ] Demo account details on the slides (a normal user, fake data)
- [ ] SSDLC form
- [ ] Lean Business Canvas
- [ ] App hosted and reachable (free hosting is fine; no static-only site)

## Demo account

Normal user, fake data, auto-confirmed, **no admin role**. Test it in a clean browser. Delete it after judging. Never put the password in the repo or in these docs; put it only on the slides or the form.

## 90-second video storyboard

| Time | Show | Say (idea) |
|---|---|---|
| 0:00 to 0:10 | Problem | "Thousands of matriculants miss funding and places because the information is scattered and confusing." |
| 0:10 to 0:30 | Sign in, enter marks, province, income bracket | "Beyond Tomorrow starts with your marks, not a guess." |
| 0:30 to 0:55 | Ranked pathways with plain-language reasons | "Every recommendation explains why, shows its source and when it was last verified." |
| 0:55 to 1:10 | Drag the Maths slider; courses unlock | "What if you raise Maths by eight percent? Here is what opens up." |
| 1:10 to 1:20 | Funding indicator, then the checklist with a countdown | "NSFAS and bursaries first, and a plan that tells you when you are running out of time." |
| 1:20 to 1:30 | Impact and next step | "Built to grow with more institutions, and with student trust at the centre." |

Tips: one student's story, real screens, no jargon, rehearse twice, record on a phone-sized view too.

## Deck outline (10 slides)

1. **Title and the problem:** the funding and pathway gap, one striking number (sourced)
2. **Who it is for and the user journey story:** one student, start to finish
3. **Solution overview:** the three modules (APS, Bursaries, Resources)
4. **Screenshots:** onboarding, pathways, what-if, funding, checklist
5. **Intelligence:** scoring model, what-if forecasting, deadline-risk; honest about being rule-based; event log for learning
6. **Technical architecture:** the diagram (web, API, Supabase, shared engine)
7. **Security and SSDLC:** data minimisation, RLS, test evidence, headers
8. **Demo details:** link, demo account, how to try the key moment
9. **Business model and sustainability:** the Lean Business Canvas in brief
10. **Impact, traction and roadmap:** users tried it, quote, next institutions, wellness and persistence features

## Lean Business Canvas (DRAFT for the pitch lead to refine)

| Block | Draft |
|---|---|
| Customer segments | Matriculants and first-generation students; TVET applicants; parents and guardians. Early adopters: learners in under-resourced schools |
| Problem | Information is scattered; students do not know what they qualify for or what they can afford; deadlines are missed; scams target applicants |
| Unique value proposition | "What can I get into, and what can I afford", explained, in one place, with sources and dates |
| Solution | Explained pathway scoring; what-if simulator; funding indicator and options; deadline-aware checklist; verified resources |
| Channels | Schools and teachers; social media; university and TVET access offices; community organisations; WhatsApp sharing of the link |
| Revenue streams | Labelled sponsored bursary listings; anonymised, aggregated insights for institutions and bursary providers; CSI and partner programmes. **Never** pay-to-rank or hidden placement |
| Cost structure | Hosting and database (free tiers now, paid at scale); data curation and verification time; support; compliance |
| Key metrics | Students onboarded; completed plans; applications started; checklist completion; return users; data freshness |
| Unfair advantage | Verified, dated, South African specific data; transparent reasoning; trusted by schools; a growing dataset of anonymised needs |

Keep revenue claims honest: these are **ideas**, not signed deals.

## Traction plan (Product criterion)

- Target 20 to 30 real users by Sunday evening.
- Where: friends' siblings, school and community groups, alumni chats.
- Minors: get parental or guardian consent; collect no more than the app already stores.
- Record: sign-ups (use `traction_stats()` as an admin), completed onboarding, one short quote, one thing we changed because of feedback.
- Put the numbers on slide 10 and say them in the video if they fit.

## Presentation tips by criterion

| Criterion | One thing to make obvious |
|---|---|
| Product | It works end to end on a real account |
| Creativity | "And afford" is the twist |
| Usability | One next action per screen; three steps to a result |
| Sustainability | Revenue that does not compromise students |
| Impact | The scale of applications and the funding gap, sourced |
| Presentation | One student's story told clearly |
| Intelligence | Show the slider unlocking courses, then explain it in one sentence |

## Before you press submit

- [ ] Hosted link opens on a phone and a laptop
- [ ] Demo account signs in from a clean browser
- [ ] Video plays from the link without a login
- [ ] Slides count 10 or fewer; video link works
- [ ] SSDLC and canvas saved
- [ ] No secrets or passwords anywhere in the deck
- [ ] Submission confirmation saved (screenshot)
