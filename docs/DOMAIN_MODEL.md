# Domain Model
## Entities
### User
A simple entity representing the actual user

| Fields   | Required  | Notes               |
| -------- | --------- | ------------------- |
| id       | yes       | primary identifier  |
| email    | yes       |                     |
| password | yes       | saved hashed        |
### Tag
A simple tag entity for conceptual grouping of the courses

| Fields | Required  | Notes               |
| ------ | --------- | ------------------- |
| id     | yes       | primary identifier  |
| value  | yes       |                     |
### Course
Represents the course entity to which the lectures and assignments belong

| Fields | Required | Notes              |
| ------ | -------- | ------------------ |
| id     | yes      | primary identifier |
| title  | yes      |                    |
### Row
Represents the titles of each lecture and/or assignment. The distinction between the actual table is done through "table" attribute

| Fields | Required | Notes                                            |
| ------ | -------- | ------------------------------------------------ |
| id     | yes      | primary identifier                               |
| order  | yes      | order inside the table (later used for indexing) |
| table  | yes      | identifies the table (lectures or assignments)   |
| title  | yes      | the actual title                                 |
### Column *(abstract)*
Base entity for all column types in a table.

| Attribute  | Required | Notes                              |
|------------|----------|------------------------------------|
| id         | Yes      | Unique identifier                  |
| label      | Yes      | User-defined column name           |
| table_type | Yes      | Either 'lecture' or 'assignment'   |

Subtypes: CheckboxColumn, CustomRangeColumn
### CheckboxColumn
*Inherits all attributes from Column.*
No additional attributes.

Cells of this column type store a boolean (checked/unchecked) value.
### CustomRangeColumn
*Inherits all attributes from Column.*

| Attribute           | Required | Notes                              |
|---------------------|----------|------------------------------------|
| min                 | No       | Minimum allowed value              |
| max                 | No       | Maximum allowed value              |
| preferred_statistic | No       | 'avg' or 'sum', default 'avg'      |
### Cell *(abstract)*
Base entity for all cell types in a table. columndId and rowId form a **composite primary key**

| Attribute | Required | Notes                               |
| --------- | -------- | ----------------------------------- |
| columnId  | Yes      | To which column the cell belongs    |
| rowId     | Yes      | The order of the cell in the column |

Subtypes: BoolCell, NumberCell
### BoolCell
*Inherits all attributes from Cell.*

| Attribute | Required | Notes                              |
| --------- | -------- | ---------------------------------- |
| value     | no       | default if empty, has boolean type |

### NumberCell
*Inherits all attributes from Cell.*

| Attribute | Required | Notes                             |
| --------- | -------- | --------------------------------- |
| value     | no       | default if empty, has number type |
### CalendarDate
Stores the calendar dates which have lectures and/or assignments assigned to

| Attribute | Required | Notes                                         |
| --------- | -------- | --------------------------------------------- |
| id        | yes      | identifies the triplet of day, month and year |
| day       | yes      |                                               |
| month     | yes      |                                               |
| year      | yes      |                                               |
## Relationships

| Entity        | Cardinality | Entity | Notes                                                                                             |
| ------------- | ----------- | ------ | ------------------------------------------------------------------------------------------------- |
| User          | 1:N         | Tag    | User can define many tags and tags are not duplicate-free, so not shared between users            |
| User          | 1:N         | Course | User can define many courses and courses are not duplicate-free, so not shared between users      |
| Tag           | N:M         | Course | Courses can have multiple tags and tags can be assigned to multiple courses                       |
| Course        | 1:N         | Title  | Each title belongs to only course. Titles like "introduction" are just duplicated for each course |
| Course        | 1:N         | Column | Represents all the columns belonging to a course                                                  |
| CalendarDate  | N:M         | Title  | One date can have multiple titles and one title can be assigned multiple times                    |
| Title, Column | 1:1:1       | Cell   | One (Title, Column) pair corresponds to exactly one Cell                                          |
The fields that help identify the relationships are derived later in the architecture. For example:
The user_id for Tag and Course, course_id for Title and etc.