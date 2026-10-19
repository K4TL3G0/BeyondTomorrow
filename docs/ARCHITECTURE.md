# Architecture

User -> React app (web) -> Node/TypeScript API (api) -> Supabase (PostgreSQL + Auth).
The web app also reads reference data directly from Supabase (public read via RLS).

- `packages/engine` is a pure function package used by both web (what-if slider, marks
  never leave the device) and api (authoritative result, stored in `recommendation_runs`).
- Authorisation: Supabase Auth JWT. Admin role lives in `app_metadata`. The API verifies
  the token, then acts as the user so RLS still applies. No service_role key anywhere.
- Diagrams: `docs/diagrams/beyond_tomorrow_erd_uml.html` (ERD + UML, printable).
- Hosting: web on a free static host (Vercel config in `web/vercel.json`). Decide API hosting
  early and check the free tier's current limits.
