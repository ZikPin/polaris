# System Test Plan

Validates [REQUIREMENTS.md](../../docs/REQUIREMENTS.md), [DOMAIN_MODEL.md](../../docs/DOMAIN_MODEL.md) and [RELATIONAL_SCHEMA.md](../../docs/RELATIONAL_SCHEMA.md). It answers: *does the backend, together with its database, implement every requirement and every schema rule?*

## Approach
- **Level:** the whole backend (routes, services, database) without the browser. Automated with pytest in `tests/system/`.
- **How:** the app is created by the app factory with a test configuration. Tests send requests through Flask's test client, which runs them in-process without a network server and keeps cookies, so sessions work. Tests that check the database itself use the database session of the same app.
- **Environment:** a fresh temporary SQLite database for every test, with foreign keys enabled. Tests build their own data through the API, so they do not use the seed data. Before a release the whole suite also runs on Postgres (started with docker-compose), because SQLite and Postgres differ in constraints, aggregates and result order.
- **Clients:** most tests use one logged-in client. Tests with two users use two clients with separate cookies.
- **Terms:** a lecture or assignment is "not done" when at least one checkbox column of its row is unchecked.

## Pass criteria for the release
- All tests pass on SQLite and on Postgres.
- Tests for the calendar (ST-18) are deferred until the calendar is built.

## Test cases

### Courses and tables

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-01 | F-01, 02, 03, 04 | Create a course, read its tables, rename the course, delete it. | The new course has a lecture table and an assignment table, each empty, with no rows and no custom columns. The rename and the delete take effect. |
| ST-02 | F-03 | Course with rows, columns, cell values, tags and a calendar link. Delete the course. | All of it is gone, and its tables can no longer be read. The user and the tag remain. A new course with the same title has empty tables. |

### Rows

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-03 | F-05, 06, 08, 09, 10, 12 | In a lecture table and in an assignment table, add "B" then "A", rename "B" (the first one added), delete "A", add "C". | Each table lists its own rows in creation order: B (renamed), C. A row never shows up in the other table. |
| ST-04 | F-07, 11 | Row with values in a checkbox column and a number column, next to a second row with values. Delete the first row. | The row and its values are gone. The other row keeps its values. |

### Columns and cells

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-05 | F-13, 14, 22, 23 | Table with 2 rows. Add a checkbox column with a label, add a third row, check a box, read it back, uncheck it, rename the label. | All three rows have the box unchecked. Each read returns the last written state, and the new label is returned. The other table is unchanged. |
| ST-06 | F-15, 19 | Delete a checkbox column and a number column that have values. | The columns and their values are gone. The rows remain. |
| ST-07 | F-16, 17 | Number columns with min 1 and max 5, only a min, only a max, and neither. Write values inside, on and outside each bound, and "abc". Then clear a value. | Values on or inside the bounds that are set are accepted. Values outside a set bound and "abc" are rejected with a client error, and the stored value stays. Without bounds every number is accepted. A cleared value is empty again. |
| ST-08 | F-18 | Number column with values 1 to 5. Change min to 3, then write 2 and 4 to other cells. | The stored values stay as they are. 2 is rejected, and 4 is accepted. |
| ST-09 | F-20, 21 | Add checkbox column "X", number column "Y", checkbox column "Z", rename "X". | The table lists the columns X, Y, Z in creation order. The title is part of each row, not a column, so it is not listed and there is nothing to delete. |
| ST-10 | Schema: cells | Write a bool value to a number column, a number to a checkbox column, and a cell for a row and a column of different courses or table types. | Every write is rejected, and the stored data is unchanged. |

### Tags

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-11 | F-24, 25, 30 | Create tags "b", "a", "c", rename "c" to "d". Try to create "a" again. | Tags are listed a, b, d. The duplicate is rejected. |
| ST-12 | F-26, 27, 28 | Give a course the tags "A" and "B", replace them with "C", then add "A" and delete tag "A". | Both tags are stored at first, only "C" afterwards. After deleting "A", the course still exists with only "C". |
| ST-13 | F-29 | Courses 1 (tag "A"), 2 (tag "B"), 3 (tags "A", "B"), 4 (none). Filter by "A", by "B", then by both. | "A" returns 1 and 3, "B" returns 2 and 3, and both together return 1, 2 and 3. Each course appears once. |

### Dashboard

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-14 | F-31, 32 | Lectures L1 to L4 with checkbox column "W" (L1 to L3 checked). Assignments A1, A2 with column "S" (A1 checked). | Lecture statistics: W is 3 checked, 1 unchecked. Assignment statistics: S is 1 checked, 1 unchecked. |
| ST-15 | F-33, 34, 35, 36 | Number column "Grade" with values 2, empty, 4, for lectures and for assignments. Read the statistics, set the statistic to sum, read again. Then a column with only empty cells. | Default: avg 3, because the empty cell is ignored. After the change: sum 6. The all-empty column reports no data. |
| ST-16 | F-37, 38 | Rows with two checkbox columns "W" and "N": R1 both checked, R2 only "W", R3 neither. Do it for lectures and assignments. Also a table with no checkbox column. | Not-done lists contain R2 and R3 but not R1. After checking "N" on R2, R2 is gone. The table without checkbox columns gives an empty list. |
| ST-17 | F-39, 40 | Courses 1 (tag "A"), 2 (tag "B"), 3 (tags "A", "B"). Restrict the dashboard to "A", then to "A" and "B", then to courses 2 and 3. | The results are courses 1 and 3, then 1, 2 and 3 (each once), then 2 and 3. |

### Calendar (deferred)

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-18 | F-41 to 46 | Set a day to two lectures and an assignment (sent in mixed order), set a second day to the first lecture, then set the first day again without one lecture. Delete the other lecture. A second user sets the same date to their own row. | The day lists the lectures first, then the assignments, each in creation order. Setting a day replaces its rows, and the date is created on first use. Deleting a row removes its calendar links. The second user's row on the same date is untouched and not shown to the first user. |

### Authentication and isolation

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-19 | F-47 | Register with a valid email and a good password. Then try an existing email, an invalid email, and a 7-character password. | The first succeeds. The other three are rejected, and no account is created for them. |
| ST-20 | F-48, 49 | Log in with the right credentials, a wrong password, and an unknown email. Then log out and call a protected endpoint. | The right credentials create a session. The two failures are rejected with the same generic error message. After the logout the call is rejected as unauthenticated. |
| ST-21 | F-50 | Without logging in, call every protected endpoint. | Every call is rejected as unauthenticated. |
| ST-22 | F-50 | User A creates a course with rows, columns, a tag and cell values. User B reads, edits and deletes each of these by id, and gives B's course A's tag. Both users also create a tag with the same value and courses with the same title. | Every attempt on A's data is rejected, no data of A is returned, and A's data is unchanged. The equal tag values and titles are accepted, and each user's lists only contain their own entries. |

### Validation

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-23 | F-51 | Create or rename a course, a row, a column label and a tag to an empty or whitespace-only value. | Every attempt is rejected and nothing changes. |
| ST-30 | Architecture: error format | Request an unknown URL, send a payload that fails validation, and call a protected endpoint without logging in. | The answers are 404, 400 and 401, each with a JSON body that has an `error` message. The 400 also has `fields` with the messages per field. |

### Database

| ID | Source | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-24 | Schema | Run all migrations on an empty database, then ask the migration tool for a diff against the models. | Every table of RELATIONAL_SCHEMA exists, and there is no diff. |
| ST-25 | Schema: constraints | Directly in the database, one case per rule: a course with an unknown user_id, a duplicate email, a duplicate tag value for the same user, a duplicate date, a duplicate cell, a duplicate course-tag link, an invalid table_type, column_type or preferred_statistic, a range column with min greater than max, and a NULL in a required field. Also insert records without optional values, and delete a course directly. | Every violation is rejected. A bool cell is false by default, preferred_statistic is 'avg', and min, max and number cell value can be NULL. Deleting the course also deletes its rows, columns, cells, tag links and calendar links, while the user, the tag and the date remain. |
| ST-26 | REQ-NF-04 | Register two users with the same password. | The stored passwords are not the plain text, differ from each other, and each verifies against its own password. |
| ST-27 | Acceptance plan: seed data | Run the seed command on an empty database, then run it again. | Users alice, bob and carol exist with the data described in the acceptance plan. The second run leaves exactly the same data. |

### Non-functional

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-28 | NF-01 | Create data, log out, and read it with a new client after logging in again. | All data is still there. |
| ST-29 | NF-03 | Call every endpoint once on a database with the amount of data of the acceptance seed. | Each response arrives in under 500 ms. This is a necessary condition for the UI test AT-V-06. |

## Checks outside the system tests
- **UI only:** REQ-F-52 (delete confirmation) and REQ-NF-02 (browsers) are verified in the acceptance tests, and REQ-NF-03 also in AT-V-06.
- **Deployment check:** REQ-NF-05 (HTTPS) is checked once against the production deployment, by requesting the site over HTTP and over HTTPS.
- **Constraints:** REQ-C-01 to 03 are checked by inspection of the repository and deployment, not by tests.

## Traceability

| Requirement | Tests |
| --- | --- |
| REQ-F-01, 02, 04 | ST-01 |
| REQ-F-03 | ST-01, ST-02 |
| REQ-F-05, 06, 08, 09, 10, 12 | ST-03 |
| REQ-F-07, 11 | ST-04 |
| REQ-F-13, 14 | ST-05 |
| REQ-F-15, 19 | ST-06 |
| REQ-F-16, 17 | ST-07 |
| REQ-F-18 | ST-08 |
| REQ-F-20, 21 | ST-09 |
| REQ-F-22, 23 | ST-05 |
| REQ-F-24, 25, 30 | ST-11 |
| REQ-F-26, 27, 28 | ST-12 |
| REQ-F-29 | ST-13 |
| REQ-F-31, 32 | ST-14 |
| REQ-F-33 to 36 | ST-15 |
| REQ-F-37, 38 | ST-16 |
| REQ-F-39, 40 | ST-17 |
| REQ-F-41 to 46 | ST-18 |
| REQ-F-47 | ST-19 |
| REQ-F-48, 49 | ST-20 |
| REQ-F-50 | ST-21, ST-22 |
| REQ-F-51 | ST-23 |
| REQ-F-52 | Acceptance (AT-03) |
| REQ-NF-01 | ST-28, acceptance (AT-07) |
| REQ-NF-02 | Acceptance (Chromium run) |
| REQ-NF-03 | ST-29, acceptance (AT-V-06) |
| REQ-NF-04 | ST-26 |
| REQ-NF-05 | Deployment check |
| Schema rules | ST-10, ST-24, ST-25 |
| Error format | ST-30 |
| Seed command | ST-27 |
