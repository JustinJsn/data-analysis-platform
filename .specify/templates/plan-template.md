# Plan Template

## Feature Overview

**Feature Name:** [Feature Name]  
**Specification Version:** [Version]  
**Target Release:** [Release milestone]

**Summary:**  
[One paragraph describing what this feature does and why it exists]

---

## Constitution Alignment Check

This feature MUST comply with all principles in `.specify/memory/constitution.md`:

- [ ] **TypeScript Strict Mode:** All code uses strict typing with no implicit any
- [ ] **Code Quality Gate:** Passes oxlint, oxfmt, and vue-tsc checks
- [ ] **State Management:** Uses Pinia for shared state, Vue Router for navigation
- [ ] **Testing Discipline:** Includes unit tests (80%+ coverage) and E2E tests for workflows
- [ ] **Production Observability:** Integrates Sentry error tracking with context

---

## Scope

### In Scope

- [Feature component 1]
- [Feature component 2]

### Out of Scope

- [Explicitly excluded items]

---

## Architecture

### Components

- [Component name]: [Responsibility]

### State (Pinia Stores)

- [Store name]: [State managed]

### Routes

- [Route path]: [Page purpose]

---

## Testing Strategy

### Unit Tests

- [Test suite 1]: Coverage target X%
- [Test suite 2]: Coverage target Y%

### E2E Tests

- [User workflow 1]: [Test scenario]
- [User workflow 2]: [Test scenario]

---

## Observability

### Sentry Integration

- Error boundaries: [List critical points]
- Context metadata: [User/operation fields logged]

---

## Dependencies

- [External API / library]: [Purpose]

---

## Success Criteria

- [ ] All constitution checks passed
- [ ] All tests pass with coverage targets met
- [ ] No linter/type errors
- [ ] Sentry configured and tested
