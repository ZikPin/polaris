# Polaris
Study planner (Angular + Flask, SQLite in dev, Postgres in prod). The docs are the source of truth, the code follows them.

## Documents
Each one is derived from the one before:
`docs/VISION.md` → `STAKEHOLDER_REQ.md` → `REQUIREMENTS.md` → `DOMAIN_MODEL.md` → `RELATIONAL_SCHEMA.md` → `ARCHITECTURE.md` → `MARSHMALLOW_SCHEMAS.md`

Test plans: `tests/plans/` (acceptance for vision and SRs, system for requirements and schema).
Work: `docs/BACKLOG.md` (tickets), `docs/CHANGE_LOG.md`.

## Rules
- Docs first. If the code has to differ from the docs, change the docs in the same change.
- A change of behavior updates every affected doc and test plan down the chain above, including traceability tables.
- Work on a BACKLOG ticket. Set its status when you start and when you finish.
- Every change gets one CHANGE_LOG line: date, ticket, what and why.
- IDs (SR-, REQ-, T-, ST-, AT-) are never renumbered or reused. New ones get the next number. A removed requirement is marked removed, and the tickets that depend on it become stale.
- DOMAIN_MODEL and RELATIONAL_SCHEMA stay consistent: same fields, entities singular, tables plural.
- Follow the layers in ARCHITECTURE.md: routes → services → models, pure functions in `utils` (no Flask or SQLAlchemy imports).
- Keep docs and code lean. Do not add anything the docs do not ask for. Ask first.
- Install nothing globally: `pip` only inside `.venv`, `npm` only in the project.
- Do not commit unless asked.

## Skills
- `/plan-feature <request>`: request → requirements, docs, test plans, tickets
- `/implement-feature <ticket>`: ticket → code, tests, docs, change log

## Commands
Everything runs from the repository root: `requirements.txt`, `.venv`, `package.json`, `angular.json` and `node_modules` live there, the sources are in `backend/` and `frontend/`.
```
python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
pytest                      # all tests in tests/
flask run                   # backend
flask db migrate -m "..."   # after a model change, then review the file in backend/migrations/versions
flask db upgrade
```
Frontend and acceptance test commands are added by their scaffold tickets.
