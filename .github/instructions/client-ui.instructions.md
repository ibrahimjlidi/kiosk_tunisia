---
description: "Use when building or changing React UI, styles, themes, or Tailwind classes in the client."
applyTo: "client/src/**/*.{ts,tsx,css}"
---
# Client UI guidelines

- Before changing UI, inspect `client/src/styles/tokens.css`, `client/src/styles/themes.css`, and `client/tailwind.config.js`.
- Use semantic design tokens and existing Tailwind utilities; do not hardcode brand colors or add arbitrary design values when shared tokens exist.
- Reuse shared components and feature-local patterns. Keep theme values centralized in the token and theme files.
- Preserve existing routes, API contracts, authentication, permissions, and business behavior when making visual changes.
- Validate client changes with `npm run build` and `npm run lint` from `client/`.
