---
name: implement-feature
description: Implement a backlog ticket with code, tests, doc updates and a change log line.
disable-model-invocation: true
argument-hint: <ticket id, e.g. T-005>
---
Implement ticket $ARGUMENTS.

1. Read the ticket in `docs/BACKLOG.md`, the REQ ids it names, and the docs and test cases they point to. If the ticket is `stale` or depends on an unfinished ticket, stop and say so.
2. Set the ticket status to `in progress`.
3. Implement it as the docs describe: `ARCHITECTURE.md` (layers, API), `MARSHMALLOW_SCHEMAS.md`, `RELATIONAL_SCHEMA.md`. Include the frontend if the ticket has UI. Nothing beyond the ticket.
4. Write the tests the plans list for these requirements (system and unit tests, acceptance tests for UI), but don't run them.
5. If the implementation had to differ from a doc, fix that doc and everything derived from it in the same change.
6. Do not commit.
7. Set the ticket status to `done` and add a line to `docs/CHANGE_LOG.md`, when the user approves the implementation
