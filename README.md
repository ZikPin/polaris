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
# all commands run from the repository root

# backend
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
flask db upgrade && flask seed     # seed creates the demo users alice, bob, carol (password polaris-demo)
flask run

# frontend (proxies /api to Flask)
npm install && npm start

# tests
pytest tests/system tests/unit
docker compose up -d               # a Postgres for the system tests, then:
TEST_DATABASE_URL=postgresql+psycopg2://polaris:polaris@localhost:5433/polaris_test pytest tests/system
npx playwright install chromium    # once, the browser of the acceptance tests
npm run acceptance                 # starts its own backend (5050) and frontend (4300), the dev servers can keep running
```

## Deploy (Render + Supabase)
1. Supabase: Connect, Session pooler. Put user, password, host, port and database name into `.env` as `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`.
2. Check the connection and create the tables once from your machine: `APP_ENV=production flask db upgrade`.
3. Push the repository to GitHub. In Render: New, Blueprint, pick the repository (`render.yaml`), and enter the five `DB_*` values. `SECRET_KEY` is generated.
4. Render builds the `Dockerfile`. The container runs `flask db upgrade` and then gunicorn. Never run `flask seed` there.

## Configuration
The backend has three configs, chosen by the `APP_ENV` variable (default `development`):

| `APP_ENV`     | Used for        | Secret key  | Database                                   |
| ------------- | --------------- | ----------- | ------------------------------------------ |
| `development` | local work      | built in    | SQLite file `instance/polaris.db`          |
| `test`        | the test suite  | built in    | temporary SQLite file per test, or the `TEST_DATABASE_URL` Postgres |
| `production`  | deployment      | `SECRET_KEY` | Postgres from `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME` |

Development and test need no setup. Production refuses to start unless `SECRET_KEY` and the five `DB_*` variables are set.

Variables come from, in this order of priority: the real environment, `.env` (your local copy of `.env.example`, ignored by git), and `.flaskenv` (committed, only tells `flask` where the app is). Only the `flask` command reads the two files. `pytest` selects the test config itself.

## Database migrations
The schema changes through migrations in `backend/migrations/versions`, never by editing the database by hand. After changing a model:
```
flask db migrate -m "describe the change"   # drafts a migration from the model diff
# review the new file in backend/migrations/versions
flask db upgrade                            # applies all pending migrations
```
Commit the model change and its migration together. Migrations never run on their own: run `flask db upgrade` after pulling, and as a deploy step in production before the new version starts. Do not edit a migration that was already applied somewhere, add a new one instead. `flask db check` fails if the models and the migrations disagree.

## Architecture in short
- Angular single-page app ⇄ JSON REST API ⇄ Flask backend ⇄ SQLAlchemy ⇄ SQLite (dev) / Postgres (prod)
- Backend layers: `routes` (blueprints) → `services` (business logic) → `models`. `schemas` hold the Marshmallow payload schemas, `utils` pure functions
- Session cookie login, one origin through the dev proxy, so no CORS

## Repository
```
docs/       vision, requirements, design, API schemas, backlog, change log
tests/      plans/ (test plans), acceptance/ (Playwright), system/ (pytest), unit/
backend/    Flask sources, migrations
frontend/   Angular sources
.claude/    skills to plan and implement features
```
Dependencies and tool configuration live at the root (`requirements.txt`, `.venv`, `package.json`, `angular.json`, `node_modules`), the sources stay in `backend/` and `frontend/`.

## Documentation
Read in this order, each is derived from the one before: [VISION](docs/VISION.md) → [STAKEHOLDER_REQ](docs/STAKEHOLDER_REQ.md) → [REQUIREMENTS](docs/REQUIREMENTS.md) → [DOMAIN_MODEL](docs/DOMAIN_MODEL.md) → [RELATIONAL_SCHEMA](docs/RELATIONAL_SCHEMA.md) → [ARCHITECTURE](docs/ARCHITECTURE.md) → [MARSHMALLOW_SCHEMAS](docs/MARSHMALLOW_SCHEMAS.md).
Test plans are in [tests/plans](tests/plans). Work is tracked in [BACKLOG](docs/BACKLOG.md) and [CHANGE_LOG](docs/CHANGE_LOG.md), the working rules are in [CLAUDE.md](CLAUDE.md).
