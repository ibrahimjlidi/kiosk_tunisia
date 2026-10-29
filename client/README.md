# Playwright QA Suite for FuelStation ERP

## Overview
This Playwright suite covers authentication, core navigation, CRUD smoke flows, and role-based access for the local FuelStation ERP UI.

## Design system

The client uses Tailwind CSS v3. Global styles are imported from `src/styles/global.css`; design tokens live in `src/styles/tokens.css`, and theme-specific overrides belong in `src/styles/themes.css`. `tailwind.config.js` exposes the tokens as semantic utilities such as `bg-background`, `bg-primary`, `text-foreground`, `text-muted`, `border-border`, and `rounded-card`.

To update the current palette, edit the `--color-*-rgb` values in `src/styles/tokens.css`. Typography, spacing, layout, radii, and elevation tokens are defined alongside them. Existing legacy color utility names are mapped to these tokens for compatibility.

The application currently uses the light theme and has no theme switch. To add another theme, define its token overrides under a selector such as `[data-theme="dark"]` in `src/styles/themes.css`, then implement and persist an explicit user-facing theme choice; do not add a competing set of component styles.

## Structure
- tests/auth/: authentication tests
- tests/e2e/: end-to-end flow and CRUD smoke tests
- tests/fixtures/: reusable Playwright fixtures
- tests/helpers/: test data and auth helpers
- tests/pages/: page object classes
- playwright.config.ts: Playwright configuration

## Run locally
```bash
cd client
npx playwright test --reporter=list
```

## Notes
- The suite targets the local Vite frontend at http://localhost:5173.
- The backend is expected to be running at http://localhost:5000.
- Seeded demo accounts:
  - Admin: admin@fuelstation.tn / Admin@123
  - Manager: manager@fuelstation.tn / Manager@123
  - Supervisor: supervisor@fuelstation.tn / Supervisor@123
  - Operator: operator@fuelstation.tn / Operator@123
