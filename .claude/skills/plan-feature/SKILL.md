---
name: plan-feature
description: Turn a stakeholder request into requirements, doc and test plan updates, and backlog tickets. Writes no code.
disable-model-invocation: true
argument-hint: <request in plain words>
---
Plan the request in $ARGUMENTS. Do not write code.

1. Read `docs/VISION.md`, `STAKEHOLDER_REQ.md`, `REQUIREMENTS.md` and `BACKLOG.md`.
2. Check the request against the Vision scope. If it is out of scope or contradicts a requirement, stop and ask.
3. Add it to `STAKEHOLDER_REQ.md` as a new SR with the next id and a priority (M, S or C). If it changes an existing SR, edit that one instead.
4. Break it into REQ-F / REQ-NF entries in `REQUIREMENTS.md` (next ids, one testable sentence each) and update the traceability table.
5. Update the design docs the requirements touch, only as far as needed: `DOMAIN_MODEL.md` and `RELATIONAL_SCHEMA.md` (keep them consistent), the API in `ARCHITECTURE.md`, `MARSHMALLOW_SCHEMAS.md`.
6. Add test cases to `tests/plans/acceptance-test-plan.md` and `system-test-plan.md` (next ids) and update their traceability tables.
7. Add tickets to `BACKLOG.md`: one per slice that can be built and tested alone, status `todo`, one sentence naming the REQ ids. Mark tickets that no longer fit as `stale`.
8. Report what you added. List open questions, each with a default.

Never renumber ids. A replaced requirement is marked removed.
