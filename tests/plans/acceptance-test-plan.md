# Acceptance Test Plan

Validates [VISION.md](../../docs/VISION.md) and [STAKEHOLDER_REQ.md](../../docs/STAKEHOLDER_REQ.md). It answers: *does the finished app do what the stakeholder asked for?*

## Approach
- **Level:** black-box, through the browser UI only. Automated with Playwright in `tests/acceptance/`, except the timed tests (AT-V-01 to 03) and the negative checklist (AT-N-01), which are manual.
- **Environment:** the development environment (SQLite) with a deterministic seed (see Seed data). The database is restored to the seeded state before every test, by copying a pristine seeded database file over the live one. Tests can therefore change data freely and never depend on run order. The suite runs with a single worker, because all tests share one database file.
- **Style (BDD):** the scenarios below are written as Given/When/Then. Acceptance tests are implemented as Gherkin `.feature` files in `tests/acceptance/features/`, one scenario per test case and tagged with its id (for example `@AT-07 @SR-M-05`), plus step definitions. They run on Playwright through playwright-bdd, which compiles the feature files into Playwright tests, so Playwright fixtures can be used inside steps. Other test levels stay plain tests.
- **Browser:** the automated suite runs in Chromium only. Other Chromium-based browsers (for example Edge) are expected to behave the same (REQ-NF-02).
- **Fixtures:** Playwright fixtures (setup/teardown units requested by tests) provide the database restore and logging in as a seeded user.
- **Terms:** a lecture or assignment is "done" when every checkbox column in its row is checked. It is "not done" when at least one checkbox column is unchecked.

## Seed data
The seed is created by the `flask seed` command (`backend/app/seed.py`), which also serves as demo data for development. All seed users have the password `polaris-demo`. A user that already exists is skipped, so a second run changes nothing. The pristine database used for the restore is built from it: `tests/acceptance/server.py` applies the migrations and the seed to a new file every time the suite starts.

| User  | Content | Used for |
| ----- | ------- | -------- |
| alice | Tags Semester 1, Semester 2, CS, Math and ML, and five courses. **Algorithms** (Semester 1, CS): lectures Chapter 1 to 4 with the checkbox columns Watched (checked on 1 to 3) and Notes (checked on 1), assignments Sheet 1 to 3 with Solved and the number column Points (0 to 20, statistic sum). **Linear Algebra** (Semester 1, Math): all lectures watched, assignments with Grade 1, 2 and 3 (1 to 6, default statistic). **Databases** (Semester 2, CS) and **Machine Learning** (Semester 2, CS, ML) with a mix of checked and unchecked cells, **Statistics** without tags and with empty tables. Calendar entries on today, in 2 and in 5 days | Read-only tests: dashboard, filters, not-done lists |
| bob   | Tag Lab and the courses Biology and Chemistry | Isolation test AT-02 |
| carol | Registered, no courses | Tests that create, rename or delete data, and the timed tests |

Registration tests use new email addresses. Where a scenario below describes specific data (for example "L1 to L4 with L1 to L3 checked"), either alice's seed contains exactly that (AT-09 and AT-13 do: Algorithms and Linear Algebra), or the test creates it first as carol.

## Pass criteria for the release
- All **Must have** tests (AT-01 to AT-10) and all success-criteria tests (AT-V-*) pass.
- All **Should have** tests (AT-11 to AT-13) pass, or the failure is recorded with a decision to defer it.
- **Could have** tests (AT-14) are deferred until the calendar is built. They are not release blockers.

## Test cases

### Must have

| ID | Source | Scenario | Pass criterion |
| --- | --- | --- | --- |
| AT-01 | SR-M-09 | Register as user A, log out, then log in again. | After registering, the main page opens. After logout, opening any app page redirects to login. After login, the main page opens again. Wrong password is rejected with an error. |
| AT-02 | SR-M-09 | User A creates course "Algorithms". User B logs in. | User B's course list is empty. Opening the URL of A's course as B shows "not found" or "forbidden" and no data from A. |
| AT-03 | SR-M-01 | Add course "Algorithms". Rename it to "Algorithms 1". Delete it. | The course appears in the list after adding, shows the new title after renaming, and is gone after deleting (also after a reload). Before deleting, the app asks for confirmation, and cancelling keeps the course. A new course with the same title starts with empty lecture and assignment tables. |
| AT-04 | SR-M-02 | In one course, add lecture "Intro" and assignment "Sheet 1". Rename both. Delete both. | Each row appears only in its own table. Rename and delete work in both tables, and the changes survive a reload. |
| AT-05 | SR-M-03, SR-M-04 | Add the checkbox column "Watched" to the lectures table, with 2 lectures present. Then add a third lecture. | The column appears with the label "Watched". All three rows show it unchecked. The assignments table is unchanged. |
| AT-06 | SR-M-03 | Delete the "Watched" column. | The column and its values disappear. Lecture titles remain. |
| AT-07 | SR-M-05 | Check a box, reload, then uncheck it and reload again. | The checked state persists after the first reload and the unchecked state after the second. |
| AT-08 | SR-M-06 | Create tags "Semester 1" and "ML". Assign "Semester 1" to courses A and B, and "ML" to courses B and C. On the main page, filter by "Semester 1", by "ML", then by both. | "Semester 1" shows A and B, "ML" shows B and C, and both together show A, B and C. Tags are listed alphabetically. A course can carry several tags. |
| AT-09 | SR-M-07 | Lectures L1 to L4 with column "Watched" where L1 to L3 are checked. Open the course dashboard. | The dashboard shows "Watched: 3 checked, 1 unchecked" for lectures. Assignment columns are counted separately. |
| AT-10 | SR-M-08 | Lectures with two checkbox columns "Watched" and "Notes": L1 has both checked, L2 has only "Watched", L3 has neither. Same setup for assignments. | The not-done list for lectures contains L2 and L3 but not L1. The assignments list follows the same rule. After checking the missing box on L2, it disappears from the list. |

### Should have

| ID | Source | Scenario | Pass criterion |
| --- | --- | --- | --- |
| AT-11 | SR-S-01 | Add a number column "Grade" to the assignments table. Enter 1, 2, 3 in three rows, change one value, then delete the column. | Values are accepted and edits persist after a reload. The column and its values are gone after deleting. Non-numeric input is rejected. |
| AT-12 | SR-S-02 | With courses of different tags, restrict the dashboard to one tag, then to one course. | Only the selected courses appear. Removing the filter shows all courses again. |
| AT-13 | SR-S-03 | Assignment column "Grade" with values 1, 2, 3. Open the dashboard, then switch the statistic from the default to sum. | The default shows average 2. After switching, it shows sum 6. The choice persists after a reload. |

### Could have (deferred)

| ID | Source | Scenario | Pass criterion |
| --- | --- | --- | --- |
| AT-14 | SR-C-01, SR-C-02 | Assign a lecture and an assignment to a day in the calendar. Remove them again. | Both appear on that day in one list. After removal the day is empty. No deadline is enforced or shown as overdue. |

### Success criteria (Vision)

| ID | Source | Scenario | Pass criterion |
| --- | --- | --- | --- |
| AT-V-01 | Vision | Add a course, timed from the main page until it appears in the list. | Median of 5 runs is under 20 s. |
| AT-V-02 | Vision | Add a lecture, then an assignment, timed separately. | Median of 5 runs is under 20 s for each. |
| AT-V-03 | Vision | Add a custom column with a label, and for a number column choose its statistic. | Median of 5 runs is under 60 s. |
| AT-V-04 | Vision | Two courses with different lecture and assignment titles. Open each. | Each course view lists only its own titles and none from the other. |
| AT-V-05 | Vision | Course with lectures and assignments, some done, some graded. Open its dashboard. | The dashboard shows the number of done assignments, the grade overview, the progress per lecture, and the number of lectures left. |
| AT-V-06 | Vision (timed tasks), REQ-NF-03 | On the seed data, perform each main interaction: add, rename and delete a row, check a box, open the dashboard. | Visible feedback appears within 500 ms each time. |

### Out of scope (negative check)

| ID | Source | Scenario | Pass criterion |
| --- | --- | --- | --- |
| AT-N-01 | Won't have, Vision out of scope | Manual walkthrough of every screen. | No UI for deadlines, sharing courses, file uploads, university events or spaced repetition. |

## Traceability

| Requirement | Tests |
| --- | --- |
| SR-M-01 | AT-03 |
| SR-M-02 | AT-04 |
| SR-M-03 | AT-05, AT-06 |
| SR-M-04 | AT-05 |
| SR-M-05 | AT-07 |
| SR-M-06 | AT-08 |
| SR-M-07 | AT-09 |
| SR-M-08 | AT-10 |
| SR-M-09 | AT-01, AT-02 |
| SR-S-01 | AT-11 |
| SR-S-02 | AT-12 |
| SR-S-03 | AT-13 |
| SR-C-01, SR-C-02 | AT-14 |
| Vision success criteria | AT-V-01 to AT-V-05 |
| Won't have | AT-N-01 |
