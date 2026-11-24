# Backlog
Statuses: `todo`, `in progress`, `done`, `stale` (the request or requirement it depends on changed or was removed), `won't do` (dropped on purpose). Every ticket is a slice that includes API, UI and tests. The ids never change.

The tickets are split into three blocks. A ticket moves to the next block when its status changes, the rows are never re-sorted:
- **In progress**: in the order they are implemented.
- **To do**: in the order they are implemented, `stale` tickets stay here until decided. New tickets are inserted at the place they should be built.
- **Done**: in the order they were finished, a ticket that is done or `won't do` is added at the bottom.

## In progress

| Ticket | Request             | Status | Description |
| ------ | ------------------- | ------ | ----------- |
| T-056  | SR-M-06             | in progress | Tags without colors: the tags dialog looks like the Tables dialog (no swatches, rows in the panel tone), the tag color tokens, swatch styles and the open point are removed from the brief, the CSS, the mock-ups and the wireframes (BRIEF 3.4, 6.3, 6.4, 6.9, 11) |

## To do

| Ticket | Request             | Status | Description |
| ------ | ------------------- | ------ | ----------- |
| T-045  | TBD                 | todo   | Subtasks: add, rename and delete subrows under a row of a table, expandable in the UI, no statistics |
| T-046  | TBD                 | todo   | Subtasks: subrows have their own values for the checkbox and number columns of the parent table, independent of the parent row |
| T-038  | TBD                 | todo   | Media log: page and navigation entry, media cards with title and type (movie, book, anime, game): add, rename and delete |
| T-039  | TBD                 | todo   | Media log: edit dialog with description and color, shown on the media card and page |
| T-040  | TBD                 | todo   | Media log: own tags (create, rename, delete, assign, filter), separate from course tags |
| T-041  | TBD                 | todo   | Media log: custom tables on media items, reusing the custom table types |
| T-042  | TBD                 | todo   | Media log: decide whether it needs a dashboard and what it shows. Output: a decision, and a follow-up ticket if yes |
| T-033  | TBD                 | todo   | Analysis: the possibility of async table rendering (each table loaded and rendered when it arrives), measured first with a large seed, compared with cheaper options like local updates after an edit. Output: findings, a decision and follow-up tickets |
| T-043  | TBD                 | todo   | Analysis: generalize the frontend, find duplicated dialogs, cards, lists and forms that can become generic components. Output: findings and follow-up tickets |
| T-044  | TBD                 | todo   | Analysis: simplify the backend, find duplicated routes, services and schemas between courses, tags, tables and media. Output: findings and follow-up tickets |
| T-047  | TBD                 | todo   | Custom logs: update VISION and STAKEHOLDER_REQ for the wider audience (courses and media become two kinds of log) |
| T-048  | TBD                 | todo   | Custom logs: create, rename and delete your own log categories, with their own entry in the navigation |
| T-049  | TBD                 | todo   | Custom logs: items (cards) inside a custom log, reusing the generic card, edit dialog and page |
| T-050  | TBD                 | todo   | Custom logs: own tags per log category |
| T-051  | TBD                 | todo   | Custom logs: custom tables on the items of a custom log |
| T-052  | TBD                 | todo   | Custom logs: fold courses and the media log into default log categories, without losing data (migration) |
| T-032  | TBD                 | todo   | Support button in the UI linking to an external donation page (PayPal, Buy Me a Coffee), URL taken from the config |

## Done

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
| T-015  | infra               | done   | Seed command that creates the users alice, bob and carol with demo data (ST-27) |
| T-003  | infra               | done   | Set up the acceptance tests: Playwright with playwright-bdd on Chromium, database restore and login fixtures (REQ-NF-02) |
| T-021  | SR-M, SR-S, SR-C    | done   | Automated acceptance tests AT-02 to AT-14 as Gherkin features with step definitions (AT-01 exists since T-003, the timed and negative checks belong to T-016 and are manual) |
| T-016  | Vision              | won't do | Success criteria: timed tests and the 500 ms feedback check (AT-V-01 to 06, REQ-NF-01, 03) |
| T-017  | infra               | done   | Run the system suite against Postgres with docker-compose |
| T-018  | infra               | done   | Decide hosting and deploy over HTTPS, with `flask db upgrade` as a deploy step before the new version starts (REQ-C-02, REQ-NF-05) |
| T-022  | infra               | done   | Design: wireframes and mock-ups for the course dialog, the course card with description, the course page with tags and description, and the mobile screens (BRIEF 3.4, 6.5, 6.7, 6.9, 6.11) |
| T-023  | SR-M-01, SR-S-04    | done   | Course edit dialog with title, tags, description and color: `description` and `color` in model, migration, API and UI, replacing the inline card edit (REQ-F-53 to 56, ST-32 to 34, AT-03 and AT-08 updated) |
| T-024  | SR-S-04             | done   | Show the trimmed description on the course card and the tags plus the full description on the course page (REQ-F-57, 58, AT-15) |
| T-025  | SR-S-04             | done   | Apply the course color to the card, navigation dot, dashboard, calendar and table headers (REQ-F-59, AT-16) |
| T-026  | SR-S-06             | done   | Wider title column in the tables, long titles wrap (REQ-F-65, 66, AT-19) |
| T-027  | SR-S-05             | done   | Mobile layout below 768 px: header with burger, navigation, stacked head, cards, tables and calendar, plus the phone-viewport acceptance tests (REQ-F-60 to 64, REQ-NF-06, AT-17, 18) |
| T-028  | SR-S-07             | done   | Hide a course from the navigation with an option in the course edit dialog, it stays on every other page (REQ-F-53, 67, 68, ST-33 to 35, AT-20) |
| T-029  | SR-S-08             | done   | Welcome dialog over the courses page after registration, logging in skips it, the content is decided during implementation (REQ-F-69, AT-01 updated) |
| T-030  | SR-S-09             | done   | Password reset: forgot-password and reset-password endpoints with a signed one-hour token, the two pages and the link on the login page, the reset logs in (REQ-F-70 to 74) |
| T-031  | SR-S-09             | done   | Password reset: send the email in prod through Resend (key, sender and app address from the environment), with an HTML message in the style of the page (REQ-F-72) |
| T-037  | SR-S-11             | won't do | Calendar: assign rows of custom tables to days, folded into T-034 where the calendar lists the rows by table type |
| T-053  | SR-S-10             | done   | Design: wireframes and mock-ups for the add card, collapsed and expanded, on wide and phone screens (BRIEF 6.5, 6.9, 10) |
| T-054  | SR-S-10             | done   | Add card on the courses page: title and add button as card header, expandable with the tags, description, color and hide fields shared with the course dialog as one component (title and buttons stay in each host), created in one POST (REQ-F-75 to 79, ST-36, AT-21) |
| T-055  | SR-S-11             | done   | Design: wireframes and mock-ups for table types: the Tables button and dialog, the table options with the always visible danger mark in the course dialog, the Tables dialog with the same mark, the empty course page and dashboard note, the dashboard with several tables per course (BRIEF 6.1, 6.5 to 6.9, 10) |
| T-034  | SR-S-11             | done   | Table types as data: `table_types` and `course_table_types`, rows and columns reference a type, a migration that keeps all data, Lectures and Assignments for new users and the seed, tables, dashboard and calendar loop over the types of a course, tick them in the course dialog (with the danger mark) and the add card, a new course starts without tables (REQ-F-46, 83 to 88, 90, ST-38, 40, 41, AT-04 to AT-14 adapted) |
| T-035  | SR-S-11             | done   | Manage table types: Tables button and dialog to create, rename and delete, the danger mark is always shown, deleting asks for confirmation and removes the type from all courses (REQ-F-52, 80 to 82, 90, ST-37, 39, AT-22) |
| T-036  | SR-S-11             | done   | Empty states and several tables: message on the course page and a note in the dashboard for a course without tables, the dashboard cards wrap for more than two tables (REQ-F-89, 91, AT-23) |
