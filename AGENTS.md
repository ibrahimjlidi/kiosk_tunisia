# Project UI and Design System Rules

- Inspect `client/src/styles/tokens.css`, `client/src/styles/themes.css`, and the Tailwind configuration before changing UI.
- Use semantic design tokens and configured Tailwind utilities; do not hardcode brand colors in components.
- Do not add arbitrary fonts, colors, radii, shadows, or spacing values when a design token already exists.
- Never introduce a competing theme or styling system. Add necessary design values centrally and expose them through Tailwind.
- Reuse shared components and established visual patterns; new pages and components must follow the same design system.
- Keep theme values in the shared token/theme files so global palette changes propagate consistently.
- Preserve business logic, API contracts, routes, authentication, and permissions when making visual changes.
- Do not leave placeholder implementations, unfinished functionality, or TODO comments.
- Validate the relevant build, lint, and tests, and inspect the rendered UI when browser or screenshot tools are available.
