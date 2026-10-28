# Change Log
One line per change, newest first: date · ticket · what — why.

- 2026-10-28 · T-001 · README section on database migrations, T-018 now includes running migrations on deploy — migrations never run automatically, so the deploy has to do it

- 2026-10-28 · T-001 · Added .env.example and a Configuration section to the README — the production setup (APP_ENV, SECRET_KEY, DATABASE_URL) was not visible in the repo

- 2026-10-28 · T-001 · Scaffolded the backend: app factory with configs, models and initial migration for the whole schema, JSON error handlers, system test fixtures with ST-24, ST-25 and ST-30 (new) — first step of the implementation
- 2026-10-28 · — · .gitignore: package-lock.json is committed again, Python and instance ignores added — the lockfile is needed for reproducible installs

- 2026-10-28 · — · Dependencies and tool config (requirements.txt, package.json, angular.json, node_modules) at the repository root, sources stay in backend/ and frontend/ — no `cd` needed, one place for tooling
- 2026-10-28 · — · Added AUDIT_REPORT.md — full consistency audit of the docs, test plans and skills; no doc was changed
- 2026-10-28 · — · Added CLAUDE.md, the plan-feature and implement-feature skills, BACKLOG.md, CHANGE_LOG.md and a new README — keep docs, tickets and code in sync
- 2026-10-28 · — · Added MARSHMALLOW_SCHEMAS.md — payload shapes are fixed before implementation
- 2026-10-28 · — · Rewrote the API section (conventions, payloads, calendar keyed by date) — the old overview was not enough to implement
- 2026-10-28 · — · Rewrote ARCHITECTURE.md (client-server, layers, ownership, security) — "MVC" hid the service layer and treated the database as the model
- 2026-10-28 · — · Aligned DOMAIN_MODEL and RELATIONAL_SCHEMA (plural tables, nullable number cells, cascades, no row order field) — names, nullability and order did not match
- 2026-10-28 · — · Reworked REQUIREMENTS.md and froze REQ-F-01 to 52 — gaps (bounds, auth, validation) and untestable wording
- 2026-10-28 · — · Reworked VISION.md and STAKEHOLDER_REQ.md, added SR-M-09 — unmeasurable criteria, scope contradiction, no auth request
- 2026-10-28 · — · Wrote the acceptance and system test plans — every request and requirement needs a pass criterion
