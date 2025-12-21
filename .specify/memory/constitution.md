<!--
Sync Impact Report:
- Version: 0.0.0 → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: All core principles (TypeScript Strictness, Code Quality, State Management, Testing Discipline, Production Observability)
- Removed sections: N/A
- Templates: ⚠ Will create templates/plan-template.md, spec-template.md, tasks-template.md as needed
- Follow-up: None
-->

# Project Constitution

**Project Name:** Data Analysis Platform  
**Constitution Version:** 1.0.0  
**Ratification Date:** 2025-12-21  
**Last Amended:** 2025-12-21

---

## Purpose

This constitution establishes the non-negotiable technical and governance principles for the Data Analysis Platform. All contributors, features, and specifications MUST comply with these principles. Any deviation requires explicit amendment to this constitution.

---

## Core Principles

### Principle 1: TypeScript Strict Mode

**Name:** TypeScript Strict Mode Enforcement

**Rule:**  
All TypeScript code MUST be written with strict mode enabled (`strict: true` in tsconfig.json). No implicit `any`, no type assertions without justification, no unchecked index access. Type safety is non-negotiable.

**Rationale:**  
Strict typing catches runtime errors at compile time, improves code maintainability, enables safe refactoring, and serves as living documentation. In a data analysis platform where data transformations are critical, type safety prevents data corruption and processing errors.

### Principle 2: Code Quality Gate

**Name:** Pre-commit Quality Enforcement

**Rule:**  
Every commit MUST pass:

- `oxlint` linting with zero errors
- `oxfmt` formatting check
- `vue-tsc` type check with zero errors

Git hooks (husky + lint-staged) enforce this automatically. No bypass allowed (no `--no-verify`).

**Rationale:**  
Automated quality gates prevent technical debt accumulation. oxlint's performance enables fast feedback loops. Consistent formatting reduces code review friction. Type checking at commit time ensures the codebase remains compilable.

### Principle 3: Centralized State Management

**Name:** Pinia as Single Source of Truth

**Rule:**  
All application state MUST be managed through Pinia stores. Component local state is only permitted for UI-specific ephemeral state (form inputs, animations). Cross-component shared state, data fetching results, and business logic state MUST reside in Pinia.

Vue Router manages page routing exclusively; no custom routing logic allowed.

**Rationale:**  
Centralized state makes data flow predictable and debuggable. Pinia's TypeScript integration ensures type-safe state access. Separating routing (vue-router) from state (Pinia) enforces clear separation of concerns. In data analysis workflows, maintaining state consistency across views is critical.

### Principle 4: Testing Discipline

**Name:** Test-Driven Quality Assurance

**Rule:**  
All features MUST include:

- Unit tests (vitest) covering business logic, store actions, and utility functions
- E2E tests covering user workflows and critical paths

Minimum coverage thresholds:

- Unit tests: 80% line coverage for src/stores, src/utils
- E2E tests: 100% coverage of primary user journeys

Tests MUST pass before merge. No feature is "done" without tests.

**Rationale:**  
Data analysis platforms handle sensitive data and complex transformations. Bugs in calculations or data processing can have severe consequences. Automated tests serve as executable specifications and regression safety nets. E2E tests validate the entire stack including UI interactions.

### Principle 5: Production Observability

**Name:** Sentry Error Tracking

**Rule:**  
Sentry MUST be integrated for all environments (development logs locally, staging/production report to Sentry). All async operations, API calls, and data processing pipelines MUST implement error boundaries and explicit error reporting to Sentry with contextual metadata (user ID, operation type, data snapshot).

**Rationale:**  
Production errors in data analysis workflows often go unnoticed until users report incorrect results. Proactive error monitoring enables rapid incident response. Contextual error data accelerates debugging. Sentry integration is non-negotiable for maintaining platform reliability.

---

## Governance

### Amendment Process

1. Propose amendment via Pull Request to this file
2. Include rationale and impact analysis
3. Version bump following semantic versioning:
   - MAJOR: Breaking principle changes
   - MINOR: New principles or material expansions
   - PATCH: Clarifications or non-semantic edits
4. Requires approval from project maintainer(s)
5. Update `LAST_AMENDED` date to merge date

### Compliance Review

- Constitution compliance is checked during PR reviews
- Automated checks enforce Principles 1, 2, 4 (via CI/CD)
- Principle 3 and 5 compliance verified through code review
- Monthly audit of principle adherence recommended

### Versioning Policy

- This constitution follows semantic versioning
- Version history tracked via git history
- Breaking changes to principles require migration guide

---

## Dependencies

This constitution assumes the following technical stack:

- **Framework:** Vue 3 (Composition API + `<script setup>`)
- **Language:** TypeScript 5.9+
- **Styling:** Tailwind CSS 4.x
- **State:** Pinia 3.x
- **Routing:** Vue Router 4.x
- **Testing:** Vitest 4.x (unit + e2e)
- **Quality:** oxlint 1.x + oxfmt 0.x
- **Observability:** Sentry
- **Build:** Vite (Rolldown variant)
- **Package Manager:** pnpm 10.x

Stack changes require constitutional amendment if principles are affected.

---

_This constitution is the source of truth for project governance. When in doubt, refer here._
