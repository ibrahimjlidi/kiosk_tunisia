---
description: "Use when adding, changing, or running unit, integration, end-to-end, performance, or security tests in this repository."
---
# Testing Guidelines

- Keep tests deterministic and isolated. Prefer the narrowest relevant test command, then run server/client builds for changed application code.
- Use `npm run test:unit`, `npm run test:integration`, and `npm run test:e2e` from the repository root for the standard suites. Integration tests require the local API and MySQL stack to be healthy; E2E tests require Playwright Chromium and seeded role accounts.
- Run `npm audit --prefix server --audit-level=high` and `npm audit --prefix client --audit-level=high` as separate commands so a failure in one audit does not skip the other.
- Performance smoke tests use only the local API health endpoint with a bounded request count/concurrency. They are a regression signal, not a capacity benchmark; never point them at production.
- Security smoke tests are limited to localhost and non-destructive authentication checks. Use dependency audits and targeted tests for auth, RBAC, validation, and data isolation. Do not perform exploit payloads or load testing against systems without explicit authorization.
- Report the exact commands, pass/fail/blocked outcomes, test totals, environment limitations, and actionable failures. Do not describe a partial run as a full pass.
- Do not reset or delete database volumes to make tests pass. Use a dedicated test database for any test that writes persistent business data.
