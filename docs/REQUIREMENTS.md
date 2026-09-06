# Requirements
- This document lists the extracted and formalized requirements from the stakeholder requirements defined in STAKEHOLDER_REQ.md

## Traceability table

| Stakeholder requirement | Covered by                           |
| ----------------------- | ------------------------------------ |
| SR-M-01                 | REQ-F-01, 02, 03, 04                 |
| SR-M-02                 | REQ-F-05, 06, 07, 08, 09, 10, 11, 12 |
| SR-M-03                 | REQ-F-13, 15, 19                     |
| SR-M-04                 | REQ-F-21, 22                         |
| SR-M-05                 | REQ-F-14                             |
| SR-M-06                 | REQ-F-23, 24, 25, 26, 27, 28, 29     |
| SR-M-07                 | REQ-F-30, 31,                        |
| SR-M-08                 | REQ-F-35, 36                         |
| SR-S-01                 | REQ-F-16, 17, 18                     |
| SR-S-02                 | REQ-F-37                             |
| SR-S-03                 | REQ-F-32, 33, 34                     |
| SR-C-01                 | REQ-F-38, 39, 42, 43                 |
| SR-C-02                 | REQ-F-40, 41, 42, 43                 |

## Functional Requirements
### Course Management
- REQ-F-01: The user can add a course
- REQ-F-02: The user can edit a course title
- REQ-F-03: The user can delete the course with the lectures and assignment
- REQ-F-04: The system creates two empty tables with one default columns for lectures and assignment when the course is created
### Lecture and Assignment Management
- REQ-F-05: The user can add a lecture in the lecture table
- REQ-F-06: The user can edit lecture title in the lecture table
- REQ-F-07: The user can delete the lecture row with all the custom column values
- REQ-F-08: The user cannot reorder the lectures with drag and drop (only deleting and adding again)
- REQ-F-09: The user can add an assignment in the assignment table
- REQ-F-10: The user can edit an assignment title in the assignment table
- REQ-F-11: The user can delete the assignment row with all the custom column values
- REQ-F-12: The user cannot reorder the assignments with drag and drop (only deleting and adding again)
- REQ-F-13: The user can add a checkbox column to a selected table with default unchecked boxes for all rows
- REQ-F-14: The user can check and uncheck each row
- REQ-F-15: The user can delete the custom added checkbox column
- REQ-F-16: The user can add a custom range number input column in both tables
- REQ-F-17: The user can edit row values in custom range number columns
- REQ-F-18: The user can delete the custom range number columns
- REQ-F-19: The user cannot reorder the columns
- REQ-F-20: The user cannot delete the default column
- REQ-F-21: The user can define labels for each column
- REQ-F-22: The user can edit labels for each column
### Tagging
- REQ-F-23: The user can define tags
- REQ-F-24: The user can edit the tags
- REQ-F-25: The user can delete the tags
- REQ-F-26: The user can add multiple tags to a course
- REQ-F-27: The user can edit the tags of a course
- REQ-F-28: The user can filter main page courses with tags
- REQ-F-29: The tags are only Alphabetically ordered (no time enforcement)
### Dashboard
- REQ-F-30: The dashboard shows per course the checked and unchecked number of lectures for each checkbox column
- REQ-F-31: The dashboard shows per course the checked and unchecked number of assignments for each checkbox column
- REQ-F-32: The user can define preferred statistics for columns with custom range (sum or avg, default avg)
- REQ-F-33: The dashboard shows per course the preferred (or default) statistics for each custom range column for lectures table
- REQ-F-34: The dashboard shows per course the preffered (or default) statistics for each custom range column for assignments table
- REQ-F-35: The dashboard shows per course what lectures have empty row values
- REQ-F-36: The dashboard shows per course what assignments have empty row values 
- REQ-F-37: The dashboard has filter view to show specific tags
### Calendar view (for future)
- REQ-F-38: The user can assign lectures to specific days in calendar view
- REQ-F-39: The user can remove lectures from specific days in calendar view
- REQ-F-40: The suer can assign assignments to specific days in calendar view
- REQ-F-41: The user can remove assignments to specific days in calendar view
- REQ-F-42: The lectures and assignments are together in one list in days in calendar view
- REQ-F-43: The list in days in calendar view cannot be reordered through drag and drop (only removing and reassigning)
### Authentication
- REQ-F-44: The user can register with email and password
- REQ-F-45: The user login to an existing account with email and password
- REQ-F-46: The system logs the user out on explicit logout action (clicking logout button) 

## Non-Functional Requirements
- REQ-NF-01: Auto-save
- REQ-NF-02: The system can run on newest stable version of Chrome, Edge and Firefox
- REQ-NF-03: All the user interactions have a UI response in under 500ms

## Constraints
- REQ-C-01: The software is accessed through browser as a webpage
- REQ-C-02: The system shall require authentication before granting access. Each user's data shall be isolated and inaccessible to other users
- REQ-C-03: The software is run on a remote server
- REQ-C-04: The software is built on Angular and Flask

## Assumptions
- It is assumed that user has an internet access
- It is assumed that 