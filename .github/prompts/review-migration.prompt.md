---
name: Review database migration
description: "Review MongoDB-to-MySQL migration changes for data integrity, explicit write safety, rollback readiness, and production procedure consistency."
argument-hint: "Provide the migration files or describe the proposed migration"
agent: agent
---
Review the MongoDB-to-MySQL migration changes in scope:

${input:migration}

Read `docs/PRODUCTION_READINESS.md` and inspect the migration implementation and tests. Do not edit files or run commands that write to a database. Check for data loss, implicit writes or cutover, unsafe retries, incomplete verification, and inconsistency with the documented dry-run/apply procedure. Report only actionable findings with file and line, severity, impact, and evidence. If no findings are identified, state that and note any limits to the review.
