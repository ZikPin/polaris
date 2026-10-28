# System Test Plan

Validates [REQUIREMENTS.md](../../docs/REQUIREMENTS.md). It answers: *does the backend implement every requirement?*

## Approach
- **Level:** the whole backend (routes, services, database) driven through its HTTP API, without the browser. Automated with pytest and the Flask test client in `tests/system/`.
- **Environment:** a fresh temporary SQLite database for every test. Tests build their own data through the API, so they do not use the seed data.
- **Clients:** most tests use one logged-in client. Tests with two users use two clients with separate session cookies.
- **Terms:** a lecture or assignment is "not done" when at least one checkbox column of its row is unchecked.

## Pass criteria for the release
- All tests for requirements of Must have stakeholder requirements pass.
- Tests for Should have requirements pass, or the failure is recorded with a decision to defer it.
- Tests for Could have requirements (calendar) are deferred until the calendar is built.

## Test cases

### Courses and tables

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-01 | F-01, 02, 03 | Create a course, rename it, delete it. | The course list shows the course after creating, the new title after renaming, and nothing after deleting. |
| ST-02 | F-04 | Create a course and read its tables. | A lecture table and an assignment table exist. Each has only the default title column, no rows and no custom columns. |
| ST-03 | F-03 | Course with rows, columns and cell values. Delete the course. | Its tables can no longer be read. Creating a new course with the same title gives empty tables. |

### Rows

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-04 | F-05, 06, 07, 08 | Add lectures "B" then "A", rename "B", delete "A". | Lectures are returned in creation order. The rename and the delete take effect. |
| ST-05 | F-09, 10, 11, 12 | Same as ST-04 for assignments. | Same as ST-04. |
| ST-06 | F-07, 11 | Row with values in a checkbox column and a number column. Delete the row. | The row and its values are gone. Other rows keep their values. |
| ST-07 | F-05, 09 | Add a row named "Intro" to a lecture table and to an assignment table. | Each row only appears in its own table. |

### Columns and cells

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-08 | F-13 | Table with 2 rows. Add a checkbox column, then add a third row. | The column exists, and all three rows are unchecked. |
| ST-09 | F-14 | Check a box, read it back, uncheck it, read it back. | Each read returns the last written state. |
| ST-10 | F-15 | Delete a checkbox column that has values. | The column and its values are gone. Rows remain. |
| ST-11 | F-16, 17 | Add a number column with min 1 and max 5. Set the values 3, then 6, then "abc". | 3 is stored. 6 and "abc" are rejected with a client error, and the stored value stays 3. |
| ST-12 | F-16 | Add a number column without min and max. Set -100 and 1000. | Both are accepted. |
| ST-13 | F-18 | Change min and max of a number column. | The new bounds apply to later writes. |
| ST-14 | F-19 | Delete a number column that has values. | The column and its values are gone. |
| ST-15 | F-20 | Add checkbox column "X", then number column "Y", then checkbox column "Z". | Columns are returned as title column, X, Y, Z. |
| ST-16 | F-21 | Try to delete the default title column. | The request is rejected, and the column remains. |
| ST-17 | F-22, 23 | Add a column with a label, then change the label. | The new label is returned. |

### Tags

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-18 | F-24, 25 | Create tag "ML", rename it to "AI". Try to create "AI" again. | The rename works. The duplicate is rejected. |
| ST-19 | F-26 | Delete a tag that two courses carry. | The tag is gone. Both courses still exist without it. |
| ST-20 | F-27, 28 | Give a course tags "B" and "A", then replace them with "C". | Both tags are stored at first, and only "C" afterwards. |
| ST-21 | F-29 | Courses 1 (tag "A"), 2 (tags "A", "B"), 3 (none). Filter by "A", then by "B". | The first filter returns 1 and 2, and the second returns 2. |
| ST-22 | F-30 | Create tags "b", "a", "c". | They are listed as a, b, c. |

### Dashboard

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-23 | F-31, 32 | Lectures L1 to L4 with checkbox column "W" (L1 to L3 checked). Assignments A1, A2 with column "S" (A1 checked). | Lecture statistics: W is 3 checked, 1 unchecked. Assignment statistics: S is 1 checked, 1 unchecked. |
| ST-24 | F-33, 34, 35 | Number column "Grade" with values 1, 2, 3. Read statistics, set the statistic to sum, read again. | Default: avg 2. After the change: sum 6. Same for a lecture column and an assignment column. |
| ST-25 | F-36 | Number column with values 2, empty, 4. Then a column with all cells empty. | The first gives avg 3, because the empty cell is ignored. The second reports no data. |
| ST-26 | F-37, 38 | Rows with two checkbox columns "W" and "N": R1 both checked, R2 only "W", R3 neither. Do it for lectures and assignments. | Not-done lists contain R2 and R3 but not R1. After checking "N" on R2, R2 is gone. |
| ST-27 | F-37, 38 | Table with no checkbox column and some rows. | The not-done lists are empty. |
| ST-28 | F-39 | Courses with different tags. Restrict the dashboard to one tag. | Only the courses with the tag are in the result. |
| ST-29 | F-40 | Restrict the dashboard to two chosen courses. | Only these two are in the result. |

### Calendar (deferred)

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-30 | F-41 to 46 | Assign a lecture and an assignment to a day, read the day, remove the lecture. | The day lists both, in the order assigned. After removing, only the assignment remains. |

### Authentication and isolation

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-31 | F-47 | Register with a valid email and a good password. Then try an existing email, an invalid email, and a 7-character password. | The first succeeds. The other three are rejected, and no account is created for them. |
| ST-32 | F-48 | Log in with the right credentials, a wrong password, and an unknown email. | The right credentials create a session. The two failures are rejected with the same generic error message. |
| ST-33 | F-49 | Log in, then log out, then call a protected endpoint. | The call is rejected as unauthenticated. |
| ST-34 | F-50 | Without logging in, call every protected endpoint. | Every call is rejected as unauthenticated. |
| ST-35 | F-50 | User A creates a course with rows, columns, a tag and cell values. User B reads, edits and deletes each of these by id. | Every call is rejected, no data of A is returned, and A's data is unchanged. |
| ST-36 | F-50 | User B tries to give B's course A's tag. | The request is rejected. |
| ST-37 | F-50 | Both users create a tag with the same value and courses with the same title. | Both succeed, and each user's lists only contain their own entries. |

### Validation

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-38 | F-51 | Create or rename a course, a row, a column label and a tag to an empty or whitespace-only value. | Every attempt is rejected and nothing changes. |

### Non-functional

| ID | Requirements | Scenario | Pass criterion |
| --- | --- | --- | --- |
| ST-39 | NF-01 | Create data, log out, and read it with a new client after logging in again. | All data is still there. |
| ST-40 | NF-03 | Call every endpoint once on a database with the amount of data of the acceptance seed. | Each response arrives in under 500 ms. This is a necessary condition for the UI test AT-V-06. |

## Checks outside the system tests
- **UI only:** REQ-F-52 (delete confirmation) and REQ-NF-02 (browsers) are verified in the acceptance tests, and REQ-NF-03 also in AT-V-06.
- **Integration level:** REQ-NF-04 (passwords stored hashed) needs access to the database, so it belongs to the integration test plan.
- **Deployment check:** REQ-NF-05 (HTTPS) is checked once against the production deployment, by requesting the site over HTTP and over HTTPS.
- **Constraints:** REQ-C-01 to 03 are checked by inspection of the repository and deployment, not by tests.

## Traceability

| Requirement | Tests |
| --- | --- |
| REQ-F-01, 02 | ST-01 |
| REQ-F-03 | ST-01, ST-03 |
| REQ-F-04 | ST-02 |
| REQ-F-05 to 08 | ST-04, ST-06, ST-07 |
| REQ-F-09 to 12 | ST-05, ST-06, ST-07 |
| REQ-F-13 | ST-08 |
| REQ-F-14 | ST-09 |
| REQ-F-15 | ST-10 |
| REQ-F-16 | ST-11, ST-12 |
| REQ-F-17 | ST-11 |
| REQ-F-18 | ST-13 |
| REQ-F-19 | ST-14 |
| REQ-F-20 | ST-15 |
| REQ-F-21 | ST-16 |
| REQ-F-22, 23 | ST-17 |
| REQ-F-24, 25 | ST-18 |
| REQ-F-26 | ST-19 |
| REQ-F-27, 28 | ST-20 |
| REQ-F-29 | ST-21 |
| REQ-F-30 | ST-22 |
| REQ-F-31, 32 | ST-23 |
| REQ-F-33 to 35 | ST-24 |
| REQ-F-36 | ST-25 |
| REQ-F-37, 38 | ST-26, ST-27 |
| REQ-F-39 | ST-28 |
| REQ-F-40 | ST-29 |
| REQ-F-41 to 46 | ST-30 |
| REQ-F-47 | ST-31 |
| REQ-F-48 | ST-32 |
| REQ-F-49 | ST-33 |
| REQ-F-50 | ST-34, ST-35, ST-36, ST-37 |
| REQ-F-51 | ST-38 |
| REQ-F-52 | Acceptance (AT-03) |
| REQ-NF-01 | ST-39, acceptance (AT-07) |
| REQ-NF-02 | Acceptance (browser projects) |
| REQ-NF-03 | ST-40, acceptance (AT-V-06) |
| REQ-NF-04 | Integration test plan |
| REQ-NF-05 | Deployment check |
