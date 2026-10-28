# Polaris
A web-based study planner. Track lectures and assignments per course, add your own columns, and see per-course statistics, instead of maintaining a spreadsheet.

## Problem
Study apps tend to be overengineered and mix the lectures of different courses. Spreadsheets fix that, but they are tedious to maintain: a new column means editing every lecture, the style drifts, and dashboards need advanced formulas. Polaris keeps the spreadsheet's flexibility with a fixed, simple structure.

## Features
- Courses with a lecture table and an assignment table, grouped with tags (for example by semester)
- Custom columns: checkboxes and number ranges (grades, points) with average or sum
- Dashboard per course: checked and unchecked counts, grade statistics, what is still open; filter by tag or course
- Accounts with private data
- Planned: calendar to plan study days

## Status
Planning is done (requirements, design, test plans). Implementation has not started, see [docs/BACKLOG.md](docs/BACKLOG.md).

## Run
The commands below are the planned ones and get verified by the scaffold tickets.
```
# backend
cd backend && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
flask db upgrade && flask seed     # seed creates demo users alice, bob, carol
flask run

# frontend (proxies /api to Flask)
cd frontend && npm install && npm start

# tests
pytest tests/system tests/unit
npx playwright test
```

## Architecture in short
- Angular single-page app ⇄ JSON REST API ⇄ Flask backend ⇄ SQLAlchemy ⇄ SQLite (dev) / Postgres (prod)
- Backend layers: `routes` (blueprints) → `services` (business logic) → `models`. `schemas` hold the Marshmallow payload schemas, `utils` pure functions
- Session cookie login, one origin through the dev proxy, so no CORS

## Repository
```
docs/       vision, requirements, design, API schemas, backlog, change log
tests/      plans/ (test plans), acceptance/ (Playwright), system/ (pytest), unit/
backend/    Flask app, migrations
frontend/   Angular app
.claude/    skills to plan and implement features
```

## Documentation
Read in this order, each is derived from the one before: [VISION](docs/VISION.md) → [STAKEHOLDER_REQ](docs/STAKEHOLDER_REQ.md) → [REQUIREMENTS](docs/REQUIREMENTS.md) → [DOMAIN_MODEL](docs/DOMAIN_MODEL.md) → [RELATIONAL_SCHEMA](docs/RELATIONAL_SCHEMA.md) → [ARCHITECTURE](docs/ARCHITECTURE.md) → [MARSHMALLOW_SCHEMAS](docs/MARSHMALLOW_SCHEMAS.md).
Test plans are in [tests/plans](tests/plans). Work is tracked in [BACKLOG](docs/BACKLOG.md) and [CHANGE_LOG](docs/CHANGE_LOG.md), the working rules are in [CLAUDE.md](CLAUDE.md).
