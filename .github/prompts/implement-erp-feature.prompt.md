---
name: Implement ERP feature
description: "Implement a fuel-station ERP feature while preserving documented business rules, API conventions, and existing behavior."
argument-hint: "Describe the feature and expected behavior"
agent: agent
---
Implement the following feature in this repository:

${input:feature}

Before editing, inspect the relevant client and server patterns and read `docs/business-rules.md` for affected workflows. Preserve existing API contracts, authentication, permissions, and behavior unless the request explicitly requires a change. Make the smallest complete implementation, update directly related documentation, and run the narrowest relevant build, lint, and tests. Summarize changed files and verification results.
