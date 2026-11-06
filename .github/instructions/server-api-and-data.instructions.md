---
description: "Use when changing Express API routes, controllers, validation, authorization, persistence, or MongoDB-to-MySQL migrations."
applyTo: ["server/src/**/*.ts", "server/migrations/**/*.{mjs,js,sql}"]
---
# Server API and data guidelines

- Follow the existing route, controller, service, validator, and middleware boundaries. Validate request data at the API boundary and preserve established response and error formats.
- Keep authentication and role/permission checks consistent with neighboring routes. Do not weaken access control to make a workflow succeed.
- Consult [business rules](../../docs/business-rules.md) before changing sales, stock, purchasing, shifts, closures, audit, or reporting behavior.
- For MongoDB-to-MySQL migration work, read [production readiness notes](../../docs/PRODUCTION_READINESS.md). Preserve MongoDB as the source and never introduce implicit writes, destructive resets, or an automatic cutover; writes must remain an explicit, reviewed operation.
- Validate server changes with `npm run build` from `server/` and run the relevant tests.
