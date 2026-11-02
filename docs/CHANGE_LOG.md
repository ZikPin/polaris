# Change Log
One line per finished ticket, newest first: date · ticket · one sentence.

- 2026-11-02 · T-022 · Design: wireframes and mock-ups for the course dialog, the course card with description, the course page with tags and description, and the mobile screens, with the brief updated.
- 2026-11-02 · T-027 · Mobile layout below 768 px: header with a burger menu, navigation with Log out at the bottom, stacked page heads, one column of cards and tables, and the calendar grid above the day list.
- 2026-11-02 · T-026 · Course tables: wider title column and long titles wrap instead of being cut off.
- 2026-11-02 · T-025 · The color of a course is used on its card, navigation dot, dashboard cards, calendar entries and table headers.
- 2026-11-02 · T-024 · The course card shows the description (cut after 150 characters) and the course page shows the tags and the full description.
- 2026-11-02 · T-023 · Edit dialog for a course with title, tags, description and one of ten colors, with `description` and `color` in the model, migration and API.
- 2026-11-01 · T-021 · Automated acceptance tests AT-02 to AT-14 as Gherkin features with step definitions for auth, courses, tables, tags, dashboard and calendar.
- 2026-10-29 · T-018 · Deployment: one Docker image on Render that serves the Angular build from Flask over HTTPS, with Supabase Postgres and `flask db upgrade` on every start.
- 2026-10-29 · T-017 · System suite on Postgres: `docker-compose.yml`, `TEST_DATABASE_URL` switch in the fixtures, Postgres driver, and prefixed `DB_*` production settings.
- 2026-10-29 · T-003 · Acceptance test setup: Playwright with playwright-bdd on Chromium, own backend and frontend ports, pristine database restored before every test, login fixture.
- 2026-10-29 · T-015 · Seed command `flask seed`: the users alice, bob and carol with demo data, safe to run twice.
- 2026-10-29 · T-020 · Design: light pearl theme with Manrope and CSS tokens applied to every screen, frame with navbar, tags and column dialogs, and in-place editing instead of browser prompts.
- 2026-10-29 · T-019 · Calendar: assign lectures and assignments to days in a month view, per user, lectures listed before assignments.
- 2026-10-29 · T-014 · Isolation tests: every protected endpoint needs a login and users cannot reach each other's data.
- 2026-10-29 · T-013 · Dashboard filters by tags (at least one) and by courses.
- 2026-10-29 · T-012 · Number column statistics on the dashboard: average or sum, empty cells are ignored.
- 2026-10-29 · T-011 · Number columns: add with optional min and max, edit values and bounds, delete.
- 2026-10-29 · T-010 · Dashboard lists of rows with at least one unchecked checkbox.
- 2026-10-29 · T-009 · Dashboard counts of checked and unchecked boxes per checkbox column.

- 2026-10-28 · T-008 · Tags: create, edit and delete tags, assign them to courses and filter the course list by tags.
- 2026-10-28 · T-007 · Checkbox columns: add, rename and delete columns and check or uncheck cells, which are created together with rows and columns.
- 2026-10-28 · T-006 · Lecture and assignment rows: add, rename and delete rows in both tables of a course.
- 2026-10-28 · T-005 · Courses: add, edit and delete courses with a confirmation, both empty tables exist from the start.
- 2026-10-28 · T-004 · Authentication: register, log in, log out and current user, with hashed passwords and a login guard in the UI.

- 2026-10-28 · T-002 · Frontend scaffold: Angular workspace at the root with the app in frontend/, dev proxy to Flask, routing with a login guard.

- 2026-10-28 · T-001 · Backend scaffold: app factory, configs, models and initial migration for the whole schema, JSON error handlers, system test fixtures.
- 2026-10-28 · — · Planning finished: vision, requirements, design docs, test plans, backlog and Claude workflow.
