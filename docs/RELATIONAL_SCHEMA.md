# Relational Schema
Non of the following entries is nullable and empty. They all have default values on creation and have default values when empty (like with the cells)
## user

| Fields   | Type    | Constraints               |
| -------- | ------- | ------------------------- |
| id       | number  | unique, autoincrement, PK |
| email    | varchar | unique                    |
| password | varchar |                           |
## tag
Tag has a composite constraint UNIQUE(user_id, value), a user cannot create multiple tags with the same label

| Fields  | Type    | Constraints               |
| ------- | ------- | ------------------------- |
| id      | number  | unique, autoincrement, PK |
| value   | varchar |                           |
| user_id | number  | FK(user_id -> user.id)    |
## course

| Fields  | Type    | Constraints               |
| ------- | ------- | ------------------------- |
| id      | number  | unique, autoincrement, PK |
| title   | varchar |                           |
| user_id | number  | FK(user_id -> user.id)    |
## tag_assigned_to_course
tag_id and course_id form a composite primary key

| Fields    | Type   | Constraints                |
| --------- | ------ | -------------------------- |
| tag_id    | number | FK(tag_id -> tag.id)       |
| course_id | number | FK(course_id -> course.id) |
## row

| Fields    | Type    | Constraints                |
| --------- | ------- | -------------------------- |
| id        | number  | unique, autoincrement, PK  |
| table     | varchar | ('lecture'\|'assignment')  |
| value     | varchar |                            |
| course_id | number  | FK(course_id -> course.id) |
## calendar_date

| Fields | Type   | Constraints               |
| ------ | ------ | ------------------------- |
| id     | number | unique, autoincrement, PK |
| date   | date   |                           |
## row_assigned_to_date
calendar_date_id and row_id form a composite primary key

| Fields           | Type   | Constraints                              |
| ---------------- | ------ | ---------------------------------------- |
| calendar_date_id | number | FK(calendar_date_id -> calendar_date.id) |
| row_id           | number | FK(row_id -> row.id)                     |
## column

| Fields    | Type    | Constraints                |
| --------- | ------- | -------------------------- |
| id        | number  | unique, autoincrement, PK  |
| type      | varchar | ('bool'\|'number')         |
| table     | varchar | ('lecture'\|'assignment')  |
| course_id | number  | FK(course_id -> course.id) |
| label     | varchar |                            |
## custom_range_column

| Fields               | Type    | Constraints             |
| -------------------- | ------- | ----------------------- |
| id                   | number  | PK, FK(id -> column.id) |
| min                  | number  |                         |
| max                  | number  |                         |
| preferred_statistics | varchar | ('sum'\|'avg')          |
## boolean_cell
column_id and row_id form a composite primary key

| Fields    | Type    | Constraints                |
| --------- | ------- | -------------------------- |
| column_id | number  | FK(column_id -> column.id) |
| row_id    | number  | FK(row_id -> row.id)       |
| value     | boolean |                            |
## number_cell
column_id and row_id form a composite primary key

| Fields    | Type   | Constraints                |
| --------- | ------ | -------------------------- |
| column_id | number | FK(column_id -> column.id) |
| row_id    | number | FK(row_id -> row.id)       |
| value     | number |                            |
