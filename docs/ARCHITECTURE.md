# Architecture

## System Overview
The System utilizes MVC Architecture with Model defined through SQLAlchemy, Controller defined through Flask and View defined in Angular:
- View sends requests to a Controller that exposes API-Endpoints
- Controller then handles the requests (serializes the payloads through Marshmallow) and manipulates the Model if needed

There 2 environments:
- Development: for local development. SQLite Database
- Prodcution: for deployment. Postgres Database through Supabase

## Frontend Architecture
- Angular components are grouped in feature-based modules

## Backend Architecture
- Flask exposes API-Endpoints through Blueprints
- Blueprints receive requests, validate and deserialize payloads via Marshmallow schemas, and forward to Services
- Services realize the business logic and interact with SQLAlchemy Models as needed
- Responses are serialized back to JSON via Marshmallow schemas before returning
- Authentication uses Flask server-side sessions; protected endpoints are guarded with a login_required decorator

## API Endpoints overview 
```
// Authentication
api/auth/login                              -> loging in
api/auth/logout                             -> logging out
api/auth/register                           -> registration

// Course
api/course                                  -> getting all the courses (supports ?tag_id= filter)
api/course/{id}                             -> getting, editing, deleting specific course

// Tag
api/tag                                     -> getting all the tags
api/tag/{id}                                -> getting, editing, deleting a specific tag

// Table (table name is constrained for now to either "lecture" or "assignment")
api/table/{course_id}                                           -> getting both tables (rows, column, cells)
api/table/{course_id}/{table_name}/column                       -> adding a column
api/table/{course_id}/{table_name}/column/{column_id}           -> editin/deleting a column (label)
api/table/{course_id}/{table_name}/row                          -> adding a row
api/table/{course_id}/{table_name}/row/{row_id}                 -> editing/deleting a row (label)    
api/table/{course_id}/{table_name}/cell/{row_id}/{column_id}    -> changing the cell value

// Calendar
api/calendar                                -> gets all calendar dates, or adds a new date (supports ?month= filter)
api/calendar/{date_id}                      -> assigns the payloaded entries to the date with the given id

// Dashboard (supports ?tag_id= filter)
api/dashboard/lecture/column_statistics     -> gets the statistics per column for lectures
api/dashboard/lecture/not_done              -> gets lectures that are not done according to requirements
api/dashboard/assignment/column_statistics  -> gets the statistics per column for assignments
api/dashboard/assignment/not_done           -> gets assignments that are not done according to requirements
```