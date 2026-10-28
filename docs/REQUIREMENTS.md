# Requirements
- This document lists the extracted and formalized requirements from the stakeholder requirements defined in STAKEHOLDER_REQ.md
- The priority (Must, Should, Could) of a requirement is the priority of the stakeholder requirement it covers

## Traceability table

| Stakeholder requirement | Covered by                           |
| ----------------------- | ------------------------------------ |
| SR-M-01                 | REQ-F-01, 02, 03, 04                 |
| SR-M-02                 | REQ-F-05 to 12, 21                   |
| SR-M-03                 | REQ-F-13, 15, 20                     |
| SR-M-04                 | REQ-F-22, 23                         |
| SR-M-05                 | REQ-F-14                             |
| SR-M-06                 | REQ-F-24 to 30                       |
| SR-M-07                 | REQ-F-31, 32                         |
| SR-M-08                 | REQ-F-37, 38                         |
| SR-M-09                 | REQ-F-47, 48, 49, 50                 |
| SR-S-01                 | REQ-F-16, 17, 18, 19                 |
| SR-S-02                 | REQ-F-39, 40                         |
| SR-S-03                 | REQ-F-33, 34, 35, 36                 |
| SR-C-01                 | REQ-F-41, 42, 45, 46                 |
| SR-C-02                 | REQ-F-43, 44, 45, 46                 |

### Derived requirements
These do not come from a single stakeholder requirement.

| Requirement      | Derived from                                  |
| ---------------- | --------------------------------------------- |
| REQ-F-51, 52     | Design decision (data integrity and usability) |
| REQ-NF-01        | Design decision (no manual save)              |
| REQ-NF-02        | Constraint REQ-C-01                           |
| REQ-NF-03        | Vision success criteria (timed tasks)         |
| REQ-NF-04, 05    | SR-M-09 (private accounts)                    |

## Functional Requirements
### Course Management
- REQ-F-01: The user can add a course
- REQ-F-02: The user can edit a course title
- REQ-F-03: The user can delete a course with its lectures and assignments
- REQ-F-04: The system creates two empty tables, one for lectures and one for assignments, when a course is created. Each table has a default title column
### Lecture and Assignment Management
- REQ-F-05: The user can add a lecture in the lecture table
- REQ-F-06: The user can edit a lecture title in the lecture table
- REQ-F-07: The user can delete a lecture row with all its custom column values
- REQ-F-08: The lectures are always displayed in the order they were created
- REQ-F-09: The user can add an assignment in the assignment table
- REQ-F-10: The user can edit an assignment title in the assignment table
- REQ-F-11: The user can delete an assignment row with all its custom column values
- REQ-F-12: The assignments are always displayed in the order they were created
- REQ-F-13: The user can add a checkbox column to a selected table. The boxes of all existing and new rows are unchecked by default
- REQ-F-14: The user can check and uncheck each box
- REQ-F-15: The user can delete a custom checkbox column
- REQ-F-16: The user can add a custom range number column to a selected table, optionally with a min and a max value
- REQ-F-17: The user can edit row values in custom range number columns. Values that are not numbers or outside the min and max are rejected
- REQ-F-18: The user can edit the min and max of a custom range number column
- REQ-F-19: The user can delete a custom range number column
- REQ-F-20: The custom columns are always displayed in the order they were created, after the default title column
- REQ-F-21: The user cannot delete the default title column
- REQ-F-22: The user can define a label for each custom column
- REQ-F-23: The user can edit the label of each custom column
### Tagging
- REQ-F-24: The user can define tags. A tag value is unique per user
- REQ-F-25: The user can edit a tag
- REQ-F-26: The user can delete a tag. Courses with this tag are kept and lose the tag
- REQ-F-27: The user can add multiple tags to a course
- REQ-F-28: The user can edit the tags of a course
- REQ-F-29: The user can filter the courses on the main page by tags
- REQ-F-30: The tags are always listed in alphabetical order
### Dashboard
- REQ-F-31: The dashboard shows per course the checked and unchecked number of lectures for each checkbox column
- REQ-F-32: The dashboard shows per course the checked and unchecked number of assignments for each checkbox column
- REQ-F-33: The user can define the preferred statistic (sum or avg, default avg) for each custom range column
- REQ-F-34: The dashboard shows per course the preferred (or default) statistic for each custom range column of the lectures table
- REQ-F-35: The dashboard shows per course the preferred (or default) statistic for each custom range column of the assignments table
- REQ-F-36: Empty cells of custom range columns are ignored in the statistics. If all cells are empty, the dashboard shows that there is no data
- REQ-F-37: The dashboard shows per course the lectures that have at least one unchecked checkbox
- REQ-F-38: The dashboard shows per course the assignments that have at least one unchecked checkbox
- REQ-F-39: The dashboard can be restricted to selected tags
- REQ-F-40: The dashboard can be restricted to selected courses
### Calendar view (for future)
- REQ-F-41: The user can assign lectures to specific days in the calendar view
- REQ-F-42: The user can remove lectures from specific days in the calendar view
- REQ-F-43: The user can assign assignments to specific days in the calendar view
- REQ-F-44: The user can remove assignments from specific days in the calendar view
- REQ-F-45: The lectures and assignments of a day are shown together in one list in the calendar view
- REQ-F-46: The list of a day is ordered by the time of assignment
### Authentication
- REQ-F-47: The user can register with a valid email and a password of at least 8 characters. An email can be registered only once
- REQ-F-48: The user can log in to an existing account with email and password. A failed login shows a generic "invalid email or password" error
- REQ-F-49: The system logs the user out on an explicit logout action (clicking the logout button)
- REQ-F-50: A user can only see and change their own courses, tags and the data inside them
### General
- REQ-F-51: Titles, labels and tag values cannot be empty
- REQ-F-52: The system asks for confirmation before deleting a course, a column or a tag

## Non-Functional Requirements
- REQ-NF-01: Every change is saved on the server without a save action and is still there after a reload
- REQ-NF-02: The system runs on the newest stable version of Chrome, Edge and Firefox
- REQ-NF-03: Every user interaction gives visible feedback in under 500ms under normal network conditions
- REQ-NF-04: Passwords are stored hashed
- REQ-NF-05: In production, all traffic goes over HTTPS

## Constraints
- REQ-C-01: The software is accessed through a browser as a webpage
- REQ-C-02: The software is run on a remote server
- REQ-C-03: The software is built with Angular and Flask

## Assumptions
- It is assumed that the user has internet access
