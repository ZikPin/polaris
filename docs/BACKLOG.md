# Backlog
Statuses: `todo`, `in progress`, `done`, `stale` (the request or requirement it depends on changed or was removed). Tickets are listed in the suggested order of implementation, the ids never change. Every ticket is a slice that includes API, UI and tests.

| Ticket | Request             | Status | Description |
| ------ | ------------------- | ------ | ----------- |
| T-001  | infra               | done   | Scaffold the backend (`requirements.txt` at the root, sources in `backend/`): app factory with configs, models for the whole schema and the initial migration, error handler, pytest fixtures (ST-24, ST-25, ST-30) |
| T-002  | infra               | done   | Scaffold the frontend: Angular workspace at the root (`package.json`, `angular.json`) with the app sources in `frontend/`, feature folders, routing, login guard and dev proxy to Flask |
| T-004  | SR-M-09             | done   | Register, log in, log out and current user, with the login guard in the UI (REQ-F-47 to 49, REQ-NF-04) |
| T-005  | SR-M-01             | done   | Course list: add, rename and delete with confirmation, both empty tables exist from the start (REQ-F-01 to 04, 51, 52) |
| T-006  | SR-M-02             | done   | Add, rename and delete lecture and assignment rows in the table view (REQ-F-05 to 12, 51) |
| T-007  | SR-M-03, M-04, M-05 | done   | Checkbox columns: add with label, rename, delete, and check or uncheck the cells (REQ-F-13 to 15, 20 to 23, 51, 52) |
| T-008  | SR-M-06             | done   | Tags: create, rename, delete, assign to courses and filter the course list (REQ-F-24 to 30, 51, 52) |
| T-009  | SR-M-07             | done   | Dashboard per course with checked and unchecked counts per checkbox column (REQ-F-31, 32) |
| T-010  | SR-M-08             | done   | Dashboard lists of lectures and assignments with at least one unchecked checkbox (REQ-F-37, 38) |
| T-011  | SR-S-01             | done   | Number columns: add with optional min and max, edit values and bounds, delete (REQ-F-16 to 19) |
| T-012  | SR-S-03             | done   | Dashboard statistics for number columns: choose avg or sum, empty cells are ignored (REQ-F-33 to 36) |
| T-013  | SR-S-02             | done   | Restrict the dashboard to selected tags and courses (REQ-F-39, 40) |
| T-014  | SR-M-09             | done   | Verify that users only reach their own data on every endpoint (REQ-F-50, ST-21, ST-22) |
| T-019  | SR-C-01, SR-C-02    | done   | Calendar: assign lectures and assignments to days (REQ-F-41 to 46) |
| T-020  | infra               | done   | Design: wireframes, a color palette as a theme (CSS variables) and a UX pass (too many buttons, browser prompts for renaming rows and columns), applied to the screens built so far |
| T-015  | infra               | in progress | Seed command that creates the users alice, bob and carol with demo data (ST-27) |
| T-003  | infra               | in progress | Set up the acceptance tests: Playwright with playwright-bdd on Chromium, database restore and login fixtures (REQ-NF-02) |
| T-016  | Vision              | todo   | Success criteria: timed tests and the 500 ms feedback check (AT-V-01 to 06, REQ-NF-01, 03) |
| T-017  | infra               | todo   | Run the system suite against Postgres with docker-compose |
| T-018  | infra               | todo   | Decide hosting and deploy over HTTPS, with `flask db upgrade` as a deploy step before the new version starts (REQ-C-02, REQ-NF-05) |
