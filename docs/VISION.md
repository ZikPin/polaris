# Vision

## Problem statement
Sometimes it is hard to keep track of lectures and relevant assignments. Other apps tend to have overengineered interfaces where the lectures and assignments of different courses are blended and not structured enough. Spreadsheets solve this problem, but maintaining them is generally hard and tedious: adding a new column forces you to rewrite and edit every lecture, it is hard to keep the style consistent, and dashboards require an advanced understanding of spreadsheet functions to implement.

## Vision statement
Polaris is a web-based study planner that lets students track course progress at the level of individual lectures and assignments, replacing manual spreadsheets.

## Goals
- Students can organize lectures and assignments into courses
- Students can manage and group courses, for example by semester
- Students can add their own tracking columns to a course without touching existing entries
- Students can overview the current study status with relevant statistics

## Scope
- In scope
    - Adding courses and tagging them to group them (for example by semester)
    - Managing lectures and assignments, including custom columns
    - Having a dashboard with overview of the materials
    - User accounts with private, isolated data (multi-tenant)
    - Calendar view for planning study days (planned for a later release)
- Out of scope
    - Mobile-app
    - Sharing courses or data between users (accounts are separate, each user's courses are private)
    - University event tracker management
    - Learning material uploads
    - Learning features like Anki Cards and etc.

## Stakeholders
- Primary stakeholders:
    - Students
    - Regular people wanting to learn new stuff
- Secondary stakeholders:
    - Instructors and course organizers. They may use Polaris as a personal planner to lay out the lecture and assignment sequence of a course they teach. They are potential users, not the target audience, so there are no instructor-specific features

## Success criteria
Timed criteria are measured as the median of 5 runs by a user who knows the app.

- Adding a course takes under 20 seconds (from the main page until the course appears in the list)
- Adding a lecture or an assignment to a course takes under 20 seconds
- Adding a custom column with a label (and, for number columns, its statistic) takes under 1 minute
- A course view only shows the lectures and assignments of that course, never those of other courses
- The dashboard shows per course how many assignments are done, the grade overview, how far each lecture is worked on, and how many lectures are left
