# Relational Schema
The schema is derived from the [domain model](DOMAIN_MODEL.md). Table names are plural (`user` is a reserved word in Postgres, as are `table`, `row` and `column`).

General rules:
- No field is nullable, except `min` and `max` of `custom_range_columns` (empty means no bound) and `value` of `number_cells` (empty means no value yet)
- Defaults: `bool_cells.value` is false, `custom_range_columns.preferred_statistic` is 'avg'
- Every foreign key is `ON DELETE CASCADE`, so deleting a parent (for example a course) deletes everything below it
- SQLite does not enforce foreign keys unless `PRAGMA foreign_keys=ON` is set on every connection
- Tables have no inherent order, so every query that lists rows or columns uses `ORDER BY id`. The autoincrement id grows with every insert, so id order is creation order and no order field is needed (rows and columns cannot be reordered)
- When a row or column is created, its cells are created with it (one cell per pair of row and column of the same course and table_type)
- The following cannot be expressed with simple foreign keys, so the service layer enforces them: a cell's table matches its column's `column_type`, row and column belong to the same course and the same `table_type`, and number cell values, if not empty, are within the `min` and `max` of the column if set

## users

| Fields   | Type    | Constraints               |
| -------- | ------- | ------------------------- |
| id       | integer | unique, autoincrement, PK |
| email    | varchar | unique                    |
| password | varchar |                           |
## tags
Tag has a composite constraint UNIQUE(user_id, value), a user cannot create multiple tags with the same value

| Fields  | Type    | Constraints               |
| ------- | ------- | ------------------------- |
| id      | integer | unique, autoincrement, PK |
| value   | varchar |                           |
| user_id | integer | FK(user_id -> users.id)   |
## courses

| Fields  | Type    | Constraints               |
| ------- | ------- | ------------------------- |
| id      | integer | unique, autoincrement, PK |
| title   | varchar |                           |
| user_id | integer | FK(user_id -> users.id)   |
## course_tags
tag_id and course_id form a composite primary key

| Fields    | Type    | Constraints                 |
| --------- | ------- | --------------------------- |
| tag_id    | integer | FK(tag_id -> tags.id)       |
| course_id | integer | FK(course_id -> courses.id) |
## course_rows

| Fields     | Type    | Constraints                 |
| ---------- | ------- | --------------------------- |
| id         | integer | unique, autoincrement, PK   |
| table_type | varchar | ('lecture'\|'assignment')   |
| title      | varchar |                             |
| course_id  | integer | FK(course_id -> courses.id) |
## calendar_dates

| Fields | Type    | Constraints               |
| ------ | ------- | ------------------------- |
| id     | integer | unique, autoincrement, PK |
| date   | date    | unique                    |
## calendar_date_rows
calendar_date_id and row_id form a composite primary key

| Fields           | Type    | Constraints                                |
| ---------------- | ------- | ------------------------------------------ |
| calendar_date_id | integer | FK(calendar_date_id -> calendar_dates.id)  |
| row_id           | integer | FK(row_id -> course_rows.id)               |
## course_columns
The subtype of the column is stored in `column_type`. A 'bool' column is a checkbox column and needs no further table. A 'number' column has an entry in `custom_range_columns`

| Fields      | Type    | Constraints                 |
| ----------- | ------- | --------------------------- |
| id          | integer | unique, autoincrement, PK   |
| column_type | varchar | ('bool'\|'number')          |
| table_type  | varchar | ('lecture'\|'assignment')   |
| label       | varchar |                             |
| course_id   | integer | FK(course_id -> courses.id) |
## custom_range_columns
`min` and `max` are nullable. If both are set, min <= max

| Fields              | Type    | Constraints                        |
| ------------------- | ------- | ---------------------------------- |
| id                  | integer | PK, FK(id -> course_columns.id)    |
| min                 | float   | nullable                           |
| max                 | float   | nullable                           |
| preferred_statistic | varchar | ('sum'\|'avg'), default 'avg'      |
## bool_cells
column_id and row_id form a composite primary key

| Fields    | Type    | Constraints                          |
| --------- | ------- | ------------------------------------ |
| column_id | integer | FK(column_id -> course_columns.id)   |
| row_id    | integer | FK(row_id -> course_rows.id)         |
| value     | boolean | default false                        |
## number_cells
column_id and row_id form a composite primary key

| Fields    | Type    | Constraints                          |
| --------- | ------- | ------------------------------------ |
| column_id | integer | FK(column_id -> course_columns.id)   |
| row_id    | integer | FK(row_id -> course_rows.id)         |
| value     | float   | nullable                             |
