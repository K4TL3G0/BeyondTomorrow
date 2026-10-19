# Beyond Tomorrow

Helping young South Africans find a study pathway, see what they can afford,
finish their applications and stay supported through to graduation.

FNB App of the Year Hackathon 2026, track: **Access to higher education**.
Modules: **APS system, Bursaries, Resources**.

## Structure

| Path | What it is | Owner |
|---|---|---|
| `web/` | React + Vite + TypeScript front end | Blessing and Katlego |
| `api/` | Node/TypeScript API (validation, rate limiting, admin stats) | Jeremie and Andile |
| `packages/engine/` | Pure scoring engine shared by web and api | Jeremie and Andile |
| `db/` | Supabase SQL: schema, RLS, seed, tests | Daniel |
| `docs/` | Security checklist, submission checklist, diagrams, SSDLC tracker | Security lead (TBC) |

## Quick start

```bash
npm install
cp web/.env.example web/.env.local     # add Supabase URL + anon key
cp api/.env.example api/.env           # add Supabase URL + anon key
npm run dev                            # web app at http://localhost:5173
npm run dev:web                        # http://localhost:5173
npm run dev:api                        # http://localhost:3001
```

Other commands: `npm run typecheck`, `npm test`, `npm run build`, `npm run audit:high`.

## Rules of the repo

- Work on a branch, open a pull request, get a **second reviewer**. No direct pushes to `main`.
- Never commit secrets. Only `*.example` env files are tracked. The `service_role` key is never used.
- The engine is a pure function (no I/O) so the same code runs in the browser and on the API.
- Show estimates as estimates: every result carries a "verify with the institution" caveat and a last-verified date.
- Read `docs/SECURITY.md` before your first pull request.

## Status

Scaffold only: structure, configuration, types, security middleware and database
scripts are in place. Feature logic (APS strategies, eligibility, fit, funding,
what-if, statement, deadline risk) and the page UIs are stubs to be built during
the hackathon. Stubs throw `not implemented` on purpose.
