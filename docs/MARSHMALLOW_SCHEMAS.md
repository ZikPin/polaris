# Marshmallow Schemas
Payload schemas for the endpoints in [ARCHITECTURE.md](ARCHITECTURE.md). Request schemas validate and deserialize (`load`), response schemas serialize (`dump`). They only check the shape of the data. Rules that need the database are checked by the services (see Validation in ARCHITECTURE.md).

## Conventions
- Request schemas end with `RequestSchema`, response schemas with `ResponseSchema`
- Request schemas reject unknown fields (`unknown = RAISE`). PATCH requests are loaded with `partial=True` and must contain at least one field
- `NonEmptyStr` is a string that is stripped and must not be empty afterwards (REQ-F-51)
- Numbers are `Float(allow_nan=False)`
- Query parameters are loaded from `request.args.to_dict(flat=False)`, so repeated parameters become lists
- A `ValidationError` becomes the 400 response through one error handler in the app factory
- Response schemas never expose the password or an `user_id`

## Error
```
ErrorResponseSchema                  every error response
  error    Str                       required
  fields   Dict[Str, List[Str]]      only in a 400
```

## Authentication
```
RegisterRequestSchema                POST api/auth/register
  email      Email                   required, stripped and lower-cased
  password   Str                     required, at least 8 characters

LoginRequestSchema                   POST api/auth/login
  email      Email                   required, stripped and lower-cased
  password   Str                     required, no length rule

UserResponseSchema                   register, login, me
  id         Int
  email      Str
```

## Tag
```
TagRequestSchema                     POST, PATCH api/tag
  value      NonEmptyStr             required

TagResponseSchema                    GET, POST, PATCH api/tag, nested in courses
  id         Int
  value      Str
```

## Course
```
CourseQuerySchema                    GET api/course
  tag_id     List[Int]               optional

CourseRequestSchema                  POST, PATCH api/course
  title      NonEmptyStr             required (not on PATCH)
  tag_ids    List[Int]               optional, default [], unique values, replaces the tags of the course

CourseResponseSchema                 GET, POST, PATCH api/course
  id         Int
  title      Str
  tags       List[TagResponseSchema]
```

## Table
```
ColumnCreateRequestSchema            POST api/table/{course_id}/{table_type}/column
  column_type          Str           required, 'bool' or 'number'
  label                NonEmptyStr   required
  min                  Float         optional, nullable, only for 'number'
  max                  Float         optional, nullable, only for 'number'
  preferred_statistic  Str           optional, 'avg' or 'sum', default 'avg', only for 'number'
  rule: min <= max if both are set; a 'bool' column must not contain min, max or preferred_statistic

ColumnUpdateRequestSchema            PATCH api/table/column/{column_id}
  label                NonEmptyStr   optional
  min                  Float         optional, nullable (null removes the bound)
  max                  Float         optional, nullable (null removes the bound)
  preferred_statistic  Str           optional, 'avg' or 'sum'
  rule: min <= max if both are sent. The service checks the rest, because it needs the column:
        a 'bool' column only accepts label, and a sent bound is compared with the stored other bound

ColumnResponseSchema                 POST, PATCH column, items of columns in a table
  id                   Int
  label                Str
  column_type          Str           'bool' or 'number'
  min                  Float|null    only for 'number'
  max                  Float|null    only for 'number'
  preferred_statistic  Str           only for 'number'

RowRequestSchema                     POST api/table/{course_id}/{table_type}/row, PATCH api/table/row/{row_id}
  title      NonEmptyStr             required

RowResponseSchema                    POST, PATCH row
  id         Int
  title      Str

CellRequestSchema                    PUT api/table/cell/{row_id}/{column_id}
  value      Bool|Float|null         required. Strings are rejected. The service checks the type against the column
                                     (a Python bool is also an int, so check for bool first), the bounds and that null is only used for number cells

CellResponseSchema                   PUT cell
  row_id     Int
  column_id  Int
  value      Bool|Float|null

TableRowResponseSchema               items of rows in a table
  id         Int
  title      Str
  cells      Dict[Str, Bool|Float|null]   column id as key

TableResponseSchema                  one table
  columns    List[ColumnResponseSchema]
  rows       List[TableRowResponseSchema]

CourseTablesResponseSchema           GET api/table/{course_id}
  lecture    TableResponseSchema
  assignment TableResponseSchema
```

## Calendar
```
CalendarQuerySchema                  GET api/calendar
  month      Str                     required, format YYYY-MM

CalendarDayRequestSchema             PUT api/calendar/{date}
  row_ids    List[Int]               required, unique values, empty list clears the day

CalendarRowResponseSchema
  id         Int
  title      Str
  table_type Str                     'lecture' or 'assignment'
  course_id  Int

CalendarDayResponseSchema            GET (list), PUT
  date       Date                    YYYY-MM-DD
  rows       List[CalendarRowResponseSchema]    lectures first, then assignments, each in creation order
```
The `{date}` in the path must be a valid `YYYY-MM-DD`, otherwise the response is a 400.

## Dashboard
```
DashboardQuerySchema                 GET api/dashboard/{table_type}/column_statistics, .../not_done
  tag_id     List[Int]               optional
  course_id  List[Int]               optional

ColumnStatisticResponseSchema        item of columns
  column_id    Int
  label        Str
  column_type  Str                   'bool' or 'number'
  checked      Int                   only for 'bool'
  unchecked    Int                   only for 'bool'
  statistic    Str                   only for 'number', 'avg' or 'sum'
  value        Float|null            only for 'number', null if there is no data

CourseStatisticsResponseSchema       column_statistics, a list of these
  course_id  Int
  title      Str
  columns    List[ColumnStatisticResponseSchema]

NotDoneRowResponseSchema
  id         Int
  title      Str

CourseNotDoneResponseSchema          not_done, a list of these
  course_id  Int
  title      Str
  rows       List[NotDoneRowResponseSchema]    empty if nothing is open
```
