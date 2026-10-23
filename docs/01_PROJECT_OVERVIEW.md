# 01. Project overview

## The challenge

> How might technology help young South Africans find suitable study pathways, compare funding options, complete applications and remain supported from acceptance through graduation?

Possible focus areas from the brief: applications, bursaries and NSFAS guidance, cost planning, student wellness, academic persistence, connectivity and accessible learning.

## What we are building

**Beyond Tomorrow** is a web app that takes a student from "here are my marks" to "here is a ranked, explained set of study options, the funding I may qualify for, and a deadline-aware plan to apply."

One user journey, end to end:

1. **Sign up / sign in** (email or Google).
2. **Enter details**: marks per subject, province, income bracket, interests.
3. **See ranked pathways**: courses scored on eligibility and fit, each with plain-language reasons.
4. **Explore "what if"**: move a marks slider and watch courses unlock.
5. **See funding**: NSFAS indicator, matching bursaries, then loans to compare.
6. **Follow a checklist**: application steps with a countdown to closing dates and a risk nudge.
7. **Use resources**: curated guides and scam warnings.

## Modules

| Module | Purpose | Owner |
|---|---|---|
| APS system | Calculates a student's APS the way each institution does, checks entry requirements | Jeremie and Andile (logic), Daniel (data) |
| Bursaries (funding) | NSFAS indicator, bursary matching, loan options | Daniel (data), Jeremie and Andile (matching) |
| Resources | Verified guides, scam safety, application help | Daniel (data), Blessing and Katlego (UI) |

## What we are deliberately NOT building

| Cut | Why |
|---|---|
| "Connect" page (social/community) | No judging criterion rewards it; lowest value per hour |
| Student wellness features | Out of scope for the one journey we can finish well |
| Machine learning predictions | No real user data yet; we would be faking it. See decision D04 |
| NSFAS approval percentage | We cannot know it; only NSFAS decides. See D10 |
| Collecting ID numbers, payslips, exact income | Data minimisation, minors, POPIA. See D09 |
| Drop-off prediction from usage | Needs usage history we will not have by Sunday |
| Native mobile apps / WhatsApp bot | Extra effort or extra rules for no gain. See D01 |

## Judging criteria (each scored 0 to 10)

| Criterion | What judges ask | How we answer it |
|---|---|---|
| **Product** | Complete? Polished? Solves the need? Market need? Traction? | One finished journey, real data for a few institutions, 20 to 30 real users tried it |
| **Creativity** | New approach to an old problem? | "What can I get into **and afford**" in one place, South African specific, what-if simulator |
| **Usability** | Easy to use, clear next step? | Three steps or fewer, one clear action per screen, tested on outsiders |
| **Sustainability** | Can it grow? Path to revenue? | Revenue model that protects student trust (see `08_...`), scalable data model |
| **Impact** | Size and importance of the problem | Application volumes, funding gap, first-generation students |
| **Presentation** | Story and communication | 10-slide deck, 90-second video built around one student |
| **Intelligence** | Can it think, forecast, predict? | Scoring model, what-if forecasting, deadline-risk nudge. Honest about being rule-based |

Security is **not** a scored criterion, but the SSDLC form is a submission requirement and trust matters for Product and Presentation. We spend roughly a tenth of our time on it, not more.

## Key dates

| When | What |
|---|---|
| Fri 23 Oct, 10:00 | Kickoff (virtual). Watch on appoftheyear.co.za |
| Sat 24 Oct | Day 2: war rooms. Attend them |
| Sun 25 Oct | Hackathon ends. No mentor support or official scheduling after this |
| **Mon 26 Oct, 23:59** | **Submission deadline** via Sonke. Aim to submit hours earlier |

## Tech stack (decided)

React, TypeScript, Vite (web); Node/TypeScript with Express (API); PostgreSQL on Supabase (database, auth, RLS); shared TypeScript scoring engine; HTML/CSS design from the team. Java and C++ are not used. See D02.
