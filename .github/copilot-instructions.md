# Kiosk Tunisia project instructions

## Project structure

- This is a fuel-station ERP with a React, Vite, and TypeScript client in `client/` and an Express, TypeScript, and Node.js API in `server/`.
- The project is migrating from MongoDB to MySQL. Check the existing implementation and [production readiness notes](../docs/PRODUCTION_READINESS.md) before changing database behavior.
- Treat [business rules](../docs/business-rules.md) as the source of truth for station workflows and domain constraints.

## Implementation guidelines

- Follow the existing patterns in the relevant feature, service, controller, validator, and test files. Keep API contracts, routes, authentication, RBAC, and existing behavior intact unless the request explicitly requires a change.
- Validate inputs at API boundaries, report errors through the existing error-handling conventions, and avoid silent fallbacks.
- Keep changes focused. Do not leave placeholders, unfinished functionality, or TODO comments.
- Update directly related documentation when behavior or operational procedures change.

## Validation

- For client changes, run `npm run build` and `npm run lint` from `client/`.
- For server changes, run `npm run build` from `server/` and the relevant tests. Migration tests use `npm run test:migration`; end-to-end tests use `npm run test:e2e`.
- Run the narrowest relevant checks and report any checks that could not be run.

## UI design system

- Before UI changes, inspect `client/src/styles/tokens.css`, `client/src/styles/themes.css`, and `client/tailwind.config.js`.
- Use semantic design tokens and configured Tailwind utilities. Do not hardcode brand colors or add competing theme values, fonts, radii, shadows, or spacing where shared tokens already exist.
- Reuse shared components and established visual patterns. Keep theme values centralized and preserve business logic, API contracts, routes, authentication, and permissions in visual changes.
