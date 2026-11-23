# Domain Model
## Entities
### User
A simple entity representing the actual user

| Fields   | Required  | Notes               |
| -------- | --------- | ------------------- |
| id       | yes       | primary identifier  |
| email    | yes       | unique              |
| password | yes       | saved hashed        |
### Tag
A simple tag entity for conceptual grouping of the courses

| Fields | Required  | Notes                     |
| ------ | --------- | ------------------------- |
| id     | yes       | primary identifier        |
| value  | yes       | unique per user           |
### TableType
A kind of table that a course can have, like Lectures or Assignments. The user defines them, like tags. New users get Lectures and Assignments, which can be renamed and deleted like any other

| Fields | Required  | Notes                     |
| ------ | --------- | ------------------------- |
| id     | yes       | primary identifier        |
| name   | yes       | unique per user           |
### Course
Represents the course entity to which the tables (rows and columns of its table types) belong

| Fields      | Required | Notes                                                                                 |
| ----------- | -------- | ------------------------------------------------------------------------------------- |
| id          | yes      | primary identifier                                                                    |
| title       | yes      |                                                                                       |
| description | yes      | free text, empty by default, at most 1000 characters                                  |
| color       | yes      | name of an accent color of the design brief (clay, mustard, olive, sage, teal, blue, periwinkle, plum, rose, stone), default 'clay' |
| hidden      | yes      | whether the course is left out of the navigation, default false                       |
### Row
Represents one row of a table, for example one lecture or one assignment. The title of the row is the default title column of its table, which cannot be removed. The table of a row is the table type it belongs to in its course. Rows are displayed in the order they were created

| Fields     | Required | Notes                                          |
| ---------- | -------- | ---------------------------------------------- |
| id         | yes      | primary identifier                             |
| title      | yes      | the actual title                               |
### Column *(abstract)*
Base entity for all custom column types in a table. Columns are displayed in the order they were created

| Attribute  | Required | Notes                              |
|------------|----------|------------------------------------|
| id         | Yes      | Unique identifier                  |
| label      | Yes      | User-defined column name           |

Subtypes: CheckboxColumn, CustomRangeColumn
### CheckboxColumn
*Inherits all attributes from Column.*
No additional attributes.

Cells of this column type store a boolean (checked/unchecked) value.
### CustomRangeColumn
*Inherits all attributes from Column.*

| Attribute           | Required | Notes                                                |
|---------------------|----------|------------------------------------------------------|
| min                 | No       | Minimum allowed value, empty means no lower bound    |
| max                 | No       | Maximum allowed value, empty means no upper bound    |
| preferred_statistic | Yes      | 'avg' or 'sum', default 'avg'                        |

Cells of this column type store a number or are empty. Only the bounds that are set are used to validate the values.
### Cell *(abstract)*
Base entity for all cell types in a table. column_id and row_id form a **composite primary key**. One cell exists for every pair of row and column of the same table

| Attribute | Required | Notes                            |
| --------- | -------- | -------------------------------- |
| column_id | Yes      | To which column the cell belongs |
| row_id    | Yes      | To which row the cell belongs    |

Subtypes: BoolCell, NumberCell
### BoolCell
*Inherits all attributes from Cell.*

| Attribute | Required | Notes                           |
| --------- | -------- | ------------------------------- |
| value     | yes      | boolean, default false          |

### NumberCell
*Inherits all attributes from Cell.*

| Attribute | Required | Notes                           |
| --------- | -------- | ------------------------------- |
| value     | no       | number, empty by default        |
### CalendarDate
Stores the calendar dates which have lectures and/or assignments assigned to

| Attribute | Required | Notes                                         |
| --------- | -------- | --------------------------------------------- |
| id        | yes      | identifies the triplet of day, month and year |
| date      | yes      |                                               |

## Relationships

| Entity        | Cardinality | Entity | Notes                                                                                             |
| ------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------- |
| User          | 1:N         | Tag    | A user can define many tags. Tags are not shared between users, so two users can have the same tag value |
| User          | 1:N         | TableType | A user can define many table types. They are not shared between users, so two users can have the same name |
| User          | 1:N         | Course | A user can define many courses. Courses are not shared between users                              |
| Course        | N:M         | TableType | The tables of a course: one for each table type assigned to it, none if nothing is assigned     |
| TableType     | 1:N         | Row    | A row belongs to one table type. Deleting the type deletes its rows                               |
| TableType     | 1:N         | Column | A column belongs to one table type. Deleting the type deletes its columns                         |
| Tag           | N:M         | Course | Courses can have multiple tags and tags can be assigned to multiple courses                       |
| Course        | 1:N         | Row    | Each row belongs to only one course. Titles like "introduction" are just duplicated for each course |
| Course        | 1:N         | Column | Represents all the columns belonging to a course                                                  |
| CalendarDate  | N:M         | Row    | One date can have multiple rows and one row can be assigned to multiple dates                     |
| Row, Column   | 1:1:1       | Cell   | One (Row, Column) pair corresponds to exactly one Cell                                            |
The fields that help identify the relationships are derived later in the relational schema. For example:
the user_id for Tag, TableType and Course, the course_id and table_type_id for Row and Column and etc.
