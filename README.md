# Polaris
A web-based study planner. Track lectures and assignments per course, add your own checkbox and number columns, and see per-course statistics, instead of maintaining a spreadsheet. [Go to the page:](https://polaris-5r82.onrender.com/)

## Structure and approach
An Angular single-page app talks JSON to a Flask backend (`routes` → `services` → `models`, Marshmallow `schemas`, pure functions in `utils`) on SQLite in development and Postgres in production. Login is a session cookie and the browser sees one origin, so there is no CORS. The project is documentation-driven: the docs in `docs/` (start with [VISION](docs/VISION.md), each document derives from the one before) are the source of truth and the code follows them. Work is tracked in [BACKLOG](docs/BACKLOG.md) and [CHANGE_LOG](docs/CHANGE_LOG.md), the working rules are in [CLAUDE.md](CLAUDE.md), the test plans are in [tests/plans](tests/plans).

## Setup
Everything runs from the repository root. You need Python 3.13 and Node.js.
```
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
npm install
```

## Boot
```
flask db upgrade && flask seed     # creates the tables and the demo users alice, bob, carol (password polaris-demo)
flask run                          # backend on :5000
npm start                          # frontend on :4200, proxies /api to Flask
```
Open http://localhost:4200. Development needs no configuration (SQLite file `instance/polaris.db`). `APP_ENV` selects `development` (default), `test` or `production`, see [ARCHITECTURE](docs/ARCHITECTURE.md).

## Build
`npm run build` writes the Angular app to `dist/polaris/browser`, which Flask then serves next to `/api`. The `Dockerfile` does both steps in one image. It is deployed on Render with a Supabase Postgres, see [ARCHITECTURE](docs/ARCHITECTURE.md). Never run `flask seed` in production.

## Database migrations
After changing a model:
```
flask db migrate -m "describe the change"   # drafts a migration, review it in backend/migrations/versions
flask db upgrade
```
Commit the model change and its migration together, and run `flask db upgrade` after pulling. Do not edit a migration that was already applied, add a new one.

## Tests
```
pytest                             # system and unit tests, on temporary SQLite databases
docker compose up -d               # a Postgres on :5433, then run the system suite on it:
TEST_DATABASE_URL=postgresql+psycopg2://polaris:polaris@localhost:5433/polaris_test pytest tests/system
npx playwright install chromium    # once
npm run acceptance                 # Playwright + Gherkin, starts its own backend (:5050) and frontend (:4300)
```
