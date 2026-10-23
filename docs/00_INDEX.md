# Beyond Tomorrow: Project Documentation

FNB App of the Year Hackathon 2026. Track: **Access to higher education**.
Last updated: Friday 23 October 2026 (kickoff day).

## How to use these documents

| File | Read it when you want to know... |
|---|---|
| `01_PROJECT_OVERVIEW.md` | What we are building, for whom, and what we are deliberately not building |
| `02_DECISIONS.md` | Every important decision, with the reasons **for** it and the alternatives we **rejected** |
| `03_ARCHITECTURE.md` | How the system fits together: components, data, engine, auth, hosting |
| `04_TASKS_CHECKLIST.md` | What each person must do, in order, by day. Includes the MVP definition and the cut line |
| `05_SECURITY_AND_PRIVACY.md` | Data we hold, risks, controls, tests and the SSDLC mapping |
| `06_DATA_AND_FACTS.md` | Verified facts, conflicting sources, assumptions and data-curation rules |
| `07_RISKS_AND_OPEN_QUESTIONS.md` | What could go wrong, and questions that still need an answer |
| `08_SUBMISSION_AND_DEMO.md` | Submission checklist, demo script, deck outline, Lean Business Canvas draft |

## Status legend

- **Decided**: agreed, build on it
- **Proposed**: recommended but not yet confirmed by the team
- **Open**: needs an answer (see `07_RISKS_AND_OPEN_QUESTIONS.md`)
- **Verified**: checked against a source (named, with date)
- **Assumption**: our own estimate; tune or confirm before relying on it

## Team and roles

| Person | Role |
|---|---|
| Daniel | Database (Supabase schema, RLS, data curation, auth settings) |
| Jeremie and Andile | Backend (engine logic, API, validation, rate limiting). They share the same responsibilities |
| Blessing and Katlego | Frontend (React UI, HTML/CSS design, front-end security checks) |
| Security lead | **Not yet assigned** |
| Pitch and business lead | **Not yet assigned** |

## Rules for keeping these docs honest

1. If a fact has a source, name it and date it. If it does not, mark it **Assumption**.
2. When a decision changes, edit `02_DECISIONS.md` (do not delete the old reasoning; mark it superseded).
3. Do not put secrets, keys, real student data or demo passwords in any document.
