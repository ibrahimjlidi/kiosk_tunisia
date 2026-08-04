# Playwright QA Suite for FuelStation ERP

## Overview
This Playwright suite covers authentication, core navigation, CRUD smoke flows, and role-based access for the local FuelStation ERP UI.

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
