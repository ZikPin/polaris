# Architecture

## System Overview
The system is a client-server application. An Angular single-page application (client) communicates over a JSON REST API with a Flask backend (server), which persists the data in a SQL database through SQLAlchemy.

There are 3 environments:
- Development: for local development. SQLite database
- Test: for the automated tests. A temporary SQLite database for every test, or a Postgres from `docker-compose.yml` when `TEST_DATABASE_URL` is set (the tables are dropped around every test)
- Production: for deployment. Postgres database through Supabase

## Frontend Architecture
- The Angular workspace is at the repository root (`package.json`, `angular.json`, `node_modules`), the sources are in `frontend/`
- Angular standalone components are grouped in feature folders (`frontend/src/app/features`), shared code like the auth service and the route guard is in `core`
- The frontend only talks to the backend through the API
- One layout for all devices: the stylesheet switches to the mobile layout with a media query below 768 px (REQ-F-60 to 64), there is no separate mobile app or route. The wide layout is the default
- The color of a course comes only with the course (`color`). The dashboard and the calendar carry the `course_id` and the UI takes the color from the course list it already loads
- In development the Angular dev server proxies `/api` to Flask on port 5000 (`proxy.conf.json`), so the browser sees a single origin
- Routes: `/login`, `/register`, `/forgot-password`, `/reset-password` (opened from the email link, the token is in `?token=`), and the guarded `/courses`, `/courses/:id`, `/dashboard` and `/calendar`. Tags and table types have no route, they are managed in dialogs opened from the header. The route guard asks `GET api/auth/me` and redirects to `/login` if the user is not logged in or the check fails

## Backend Architecture
The backend is created by an app factory `create_app(config, overrides)` with a development, a test and a production configuration. The configuration is chosen by name or by the `APP_ENV` variable (default `development`). Production reads `SECRET_KEY`, `RESEND_API_KEY`, `APP_URL` (the public address of the app) and the database settings `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` and `DB_NAME` (a Postgres over SSL) from the environment and does not start without them. The extensions (SQLAlchemy, migrations, login) are initialized inside the factory. `requirements.txt` and the virtual environment are at the repository root, the sources are in `backend/`.

```
backend/app/
  models/     SQLAlchemy models and their database constraints
  schemas/    Marshmallow schemas: request validation and JSON output
  routes/     Flask blueprints exposing the API endpoints
  services/   use cases: ownership-scoped queries, business rules
  utils/      pure functions (statistics, bounds check), no Flask or SQLAlchemy imports
```

- Blueprints receive requests, validate and deserialize payloads via Marshmallow schemas, and forward them to Services together with the id of the logged-in user
- Services realize the business logic. They query the database through SQLAlchemy, fetch what they need and call functions of `utils` for the computations (for example the dashboard statistics)
- Responses are serialized back to JSON via Marshmallow schemas before returning

### Validation
Each kind of validation lives where it is declared:

| Kind                             | Example                                                      | Lives in                 |
| -------------------------------- | ------------------------------------------------------------ | ------------------------ |
| Request shape                    | non-empty title, valid email, password of at least 8 chars   | Marshmallow schemas      |
| Data integrity the DB can guard  | unique email, foreign keys, allowed values, nullability      | constraints in the models |
| Business rules                   | value within the column bounds, cell type matches the column | services (and `utils`)   |

### Ownership
Every service receives the id of the logged-in user. Lookups by id are always scoped to the owner, for example "course 7 of this user". Rows, columns and cells have no owner of their own, so they are reached through their course. Another user's resource is therefore not found, and the response is a 404.

Calendar dates are shared between users (the date table has no owner). Setting a day therefore only replaces the rows of the logged-in user, and reading a day only shows them.

### Database
- Models are defined with SQLAlchemy according to the relational schema
- Migrations are managed with Flask-Migrate (Alembic)
- On SQLite, foreign keys are enabled with `PRAGMA foreign_keys=ON` on every connection
- When a row or a column is created, the service creates its cells in the same transaction
- The `flask seed` command fills the database with the seed data described in the acceptance test plan

### Authentication and security
- Authentication uses Flask-Login with Flask's signed cookie session. Protected endpoints are guarded with `login_required`
- Passwords are hashed with Werkzeug
- A password reset link carries a signed token (see Password reset)
- The session cookie is `HttpOnly` and `SameSite=Lax`, and also `Secure` in production
- The browser always talks to a single origin (the dev proxy in development, one origin in production), so no CORS configuration is needed
- Request bodies are JSON only, and no CSRF tokens are used

### Deployment
One Docker image (`Dockerfile`): a Node stage builds the Angular app, a Python stage runs Flask with gunicorn, and Flask serves the built app next to `/api`, so the browser sees a single origin. It runs as a web service on Render (`render.yaml`), the database is the Supabase Postgres (Session pooler, SSL). Render terminates HTTPS and sends `X-Forwarded-*` headers, which the app trusts in production (REQ-NF-05). The container runs `flask db upgrade` before gunicorn starts, so every deploy migrates the database first. The seed command is never run in production.

## API

### Blueprints
| Blueprint | Responsibility                                                              |
| --------- | --------------------------------------------------------------------------- |
| auth      | registration, login, logout, current user, password reset                   |
| course    | course level: overview and edits of a course, including its tags            |
| tag       | the tags of the user                                                        |
| table_type | the table types of the user                                                |
| table     | the tables of a course: columns, rows and cells                             |
| calendar  | assigning rows of the tables to days                                        |
| dashboard | aggregated statistics over courses                                          |

### Conventions
- Requests and responses are JSON. Every endpoint except register and login needs a logged-in user
- A new item is created under its parent (`POST api/table/{course_id}/{table_type_id}/row`). An existing item is addressed by its own id only (`PATCH api/table/row/{row_id}`). The service finds the course, and with it the owner, through the item
- `{table_type_id}` is the id of a table type that is assigned to the course. Any other value is a 404
- Filters are repeated query parameters (`?tag_id=1&tag_id=2`). Several values mean at least one match
- Methods and success responses:
    - GET reads (200)
    - POST creates (201 with the created object)
    - PATCH changes only the sent fields (200 with the changed object)
    - PUT sets a cell value or a calendar day (200)
    - DELETE deletes (204 without body)
- Error responses:

| Status | Meaning                                                                                       |
| ------ | --------------------------------------------------------------------------------------------- |
| 400    | Invalid payload: wrong shape, a violated business rule, or an unknown id inside the body      |
| 401    | Not logged in, or wrong credentials on login                                                  |
| 404    | The resource of the URL does not exist or belongs to another user                             |
| 409    | Duplicate (email on registration, tag value, table type name)                                 |

- Every error body has an `error` message. A 400 also has `fields` with the messages per field:
```
{"error": "validation failed", "fields": {"title": ["Missing data for required field."]}}
```

### Authentication
```
POST api/auth/register   {email, password}  -> 201 {id, email}, the user is logged in
POST api/auth/login      {email, password}  -> 200 {id, email}, 401 with a generic message
POST api/auth/logout                        -> 204
GET  api/auth/me                            -> 200 {id, email}, 401 if there is no session
POST api/auth/forgot-password {email}       -> 204, the same whether or not the account exists
POST api/auth/reset-password {token, password} -> 200 {id, email}, the user is logged in, 400 for an invalid token
```

#### Password reset
`forgot-password` emails a link `{APP_URL}/reset-password?token=…` to an existing account, and answers 204 for every address (REQ-F-71). The token is signed with the `SECRET_KEY` (itsdangerous, salt `password-reset`) and holds the user id and the last characters of the current password hash. It is valid for one hour. A password change alters the hash, so a used link cannot be used again, and no token is stored (REQ-F-72). `reset-password` checks the token, saves the new password and logs the user in (REQ-F-73). An invalid, expired or used token is a 400 "This link is invalid or has expired." (REQ-F-74).

The email is sent by `services/mail.py` through the Resend API (`RESEND_API_KEY`), from `MAIL_FROM` (default `Polaris <onboarding@resend.dev>`, which Resend only delivers to the owner of the account until a domain is verified). The message is rendered from `backend/app/templates/reset_password_email.html` and has a plain text part. Without a key (development) the text with the link is written to the log instead. A failed send is logged and does not change the answer.

### Course
A table exists for every table type assigned to the course (`table_type_ids`) and is empty at first. A new course has none unless ids are sent (REQ-F-86).
```
GET    api/course?tag_id=         -> courses of the user, filtered by tags if given
POST   api/course                 -> create a course
GET    api/course/{course_id}     -> a course
PATCH  api/course/{course_id}     -> edit the course
DELETE api/course/{course_id}     -> delete the course with everything in it

Payload (POST, PATCH):  {"title": "Algorithms", "tag_ids": [2, 5], "table_type_ids": [1, 3], "description": "Spring term", "color": "sage", "hidden": false}
                        tag_ids and table_type_ids replace all tags and table types of the course (default none). description, color and hidden are optional (empty, 'clay', false)
Response:               {"id": 7, "title": "Algorithms", "description": "Spring term", "color": "sage", "hidden": false,
                         "tags": [{"id": 2, "value": "Semester 1"}],
                         "table_types": [{"id": 1, "name": "Assignments"}, {"id": 3, "name": "Lectures"}]}
```
The edit dialog sends all six fields in one PATCH (REQ-F-54), the add card in one POST (REQ-F-77). `hidden` only changes the navigation in the UI (REQ-F-68), the course list still returns hidden courses. Removing a table type from a course deletes that course's rows and columns of the type (REQ-F-85). An unknown tag or table type id (or one of another user) and a color outside the palette are a 400. The card cuts the description after 150 characters in the UI, the API always returns it whole.

### Tag
```
GET    api/tag                    -> tags of the user in alphabetical order
POST   api/tag                    -> create a tag
PATCH  api/tag/{tag_id}           -> edit the tag
DELETE api/tag/{tag_id}           -> delete the tag, courses keep existing without it

Payload:   {"value": "Semester 1"}
Response:  {"id": 2, "value": "Semester 1"}
```

### Table type
```
GET    api/table_type                    -> table types of the user in alphabetical order
POST   api/table_type                    -> create a table type
PATCH  api/table_type/{table_type_id}    -> rename the table type
DELETE api/table_type/{table_type_id}    -> delete the table type with its tables in all courses

Payload:   {"name": "Lectures"}
Response:  {"id": 1, "name": "Lectures"}
```
A new user gets Lectures and Assignments at registration (REQ-F-83).

### Table
```
GET    api/table/{course_id}                                   -> the tables of the course
POST   api/table/{course_id}/{table_type_id}/column            -> add a column
PATCH  api/table/column/{column_id}                            -> edit a column
DELETE api/table/column/{column_id}                            -> delete a column with its cells
POST   api/table/{course_id}/{table_type_id}/row               -> add a row
PATCH  api/table/row/{row_id}                                  -> edit the title of a row
DELETE api/table/row/{row_id}                                  -> delete a row with its cells
PUT    api/table/cell/{row_id}/{column_id}                     -> set the value of a cell
```
The title of a row is the default title column. It is not part of `columns` and cannot be deleted.

A table (the response of the `GET`) is not stored anywhere, the service builds it for every table type of the course, ordered by the name of the type (REQ-F-87). The cells of a row are keyed by column id:
```
[
  {"table_type": {"id": 1, "name": "Assignments"}, "columns": [], "rows": []},
  {
    "table_type": {"id": 3, "name": "Lectures"},
    "columns": [
      {"id": 3, "label": "Watched", "column_type": "bool"},
      {"id": 4, "label": "Grade", "column_type": "number", "min": 1, "max": 5, "preferred_statistic": "avg"}
    ],
    "rows": [
      {"id": 10, "title": "Chapter 1", "cells": {"3": true, "4": 2.5}}
    ]
  }
]
```
Payloads:
```
Add column (bool):    {"column_type": "bool", "label": "Watched"}
Add column (number):  {"column_type": "number", "label": "Grade", "min": 1, "max": 5, "preferred_statistic": "avg"}
                      min, max and preferred_statistic are optional (no bound, 'avg')
Edit column:          any of {"label", "min", "max", "preferred_statistic"}, null removes a bound
                      a bool column only accepts "label", the column_type cannot be changed
Add / edit row:       {"title": "Chapter 1"}
Set cell:             {"value": true} for a bool cell, {"value": 2.5} or {"value": null} for a number cell
```
Adding a row or a column returns the created object without cells. The UI reloads the table to get the new cells.

### Calendar
A day is identified by its date (`YYYY-MM-DD`). The date is created when the first row is assigned to it.
```
GET api/calendar?month=2026-11   -> the days of the month that have rows
PUT api/calendar/{date}          -> set the rows of the day

Payload (PUT):   {"row_ids": [10, 11, 25]}      replaces the rows of the day, an empty list clears it
Response:        {"date": "2026-11-03", "rows": [{"id": 10, "title": "Chapter 1", "table_type": {"id": 3, "name": "Lectures"}, "course_id": 7}]}
```
The rows of a day are listed by the name of their table type, then in creation order (REQ-F-46).

### Dashboard
All endpoints support the filters `tag_id` and `course_id`. If both are given, a course has to match both. The response contains an entry per matching course that has the table type assigned. The UI asks for every table type of the user and for the courses with their table types, and groups the answers by course, so a course without tables is listed too (REQ-F-91).
```
GET api/dashboard/{table_type_id}/column_statistics   -> statistics for every custom column of the table
GET api/dashboard/{table_type_id}/not_done            -> rows with at least one unchecked checkbox
```
Response of `column_statistics` (`value` is `null` if there is no data):
```
[{"course_id": 7, "title": "Algorithms",
  "columns": [
    {"column_id": 3, "label": "Watched", "column_type": "bool", "checked": 3, "unchecked": 1},
    {"column_id": 4, "label": "Grade", "column_type": "number", "statistic": "avg", "value": 2.5}
  ]}]
```
Response of `not_done` (a course without open rows has an empty list):
```
[{"course_id": 7, "title": "Algorithms", "rows": [{"id": 10, "title": "Chapter 1"}]}]
```
