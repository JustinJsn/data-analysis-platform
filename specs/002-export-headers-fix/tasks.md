# Tasks: Export Headers Fix

**Input**: Design documents from `/specs/002-export-headers-fix/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**Tests**: Tests are included per project constitution requirement (Principle 4: Testing Discipline)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

This is a web application project. File paths use the `frontend/` prefix for source code and tests.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure development environment and tooling are ready

- [ ] T001 Verify TypeScript 5.9+ strict mode configuration in frontend/tsconfig.json
- [ ] T002 [P] Verify xlsx library is available in frontend/package.json dependencies
- [ ] T003 [P] Run existing test suite to establish baseline (pnpm test)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and utilities that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Define ExportTimeRangeParams interface in frontend/src/utils/export.ts
- [ ] T005 [P] Implement generateTimeRangeColumns utility function in frontend/src/utils/export.ts
- [ ] T006 Write unit tests for generateTimeRangeColumns in frontend/tests/utils/export.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Complete Header Display in Export (Priority: P1) 🎯 MVP

**Goal**: Export Excel files with all time period columns from query range, regardless of whether data exists for those periods. Empty periods display as empty cells.

**Independent Test**: Query time range 2024Q1-Q4 with data only in Q1 and Q3, export current page, verify Excel contains all 4 quarter columns with empty cells for Q2 and Q4.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Unit test: exportPerformanceRecords with timeRangeParams generates complete columns in frontend/tests/utils/export.test.ts
- [ ] T008 [P] [US1] Unit test: exportPerformanceRecords falls back to data scanning when timeRangeParams undefined in frontend/tests/utils/export.test.ts
- [ ] T009 [P] [US1] Unit test: empty records array with timeRangeParams generates header-only export in frontend/tests/utils/export.test.ts
- [ ] T010 [P] [US1] E2E test: Export with sparse data shows complete header set in frontend/tests/e2e/performance-report-export.spec.ts

### Implementation for User Story 1

- [ ] T011 [US1] Update exportPerformanceRecords function signature to accept optional timeRangeParams in frontend/src/utils/export.ts
- [ ] T012 [US1] Modify BusinessQueryRecord export logic to call generateTimeRangeColumns when timeRangeParams provided in frontend/src/utils/export.ts
- [ ] T013 [US1] Update record transformation to fill all generated time columns with empty strings for missing data in frontend/src/utils/export.ts
- [ ] T014 [US1] Add fallback logic to scan data for quarters when timeRangeParams undefined (maintain backward compatibility) in frontend/src/utils/export.ts
- [ ] T015 [US1] Update exportBatch method to extract and pass timeRangeParams from businessQueryParams in frontend/src/stores/performance-report.ts
- [ ] T016 [US1] Add Sentry breadcrumb logging for timeRangeParams in exportBatch in frontend/src/stores/performance-report.ts
- [ ] T017 [US1] Verify all unit tests pass (pnpm test:unit)
- [ ] T018 [US1] Verify all E2E tests pass (pnpm test:e2e)
- [ ] T019 [US1] Verify TypeScript compilation with strict mode (pnpm run type-check)
- [ ] T020 [US1] Verify linting and formatting (pnpm run lint && pnpm run format)

**Checkpoint**: At this point, User Story 1 should be fully functional - exports show complete headers for queried time ranges

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [ ] T021 [P] Manual verification: Export with query 2024Q1-Q4, verify all 4 columns appear in Excel file
- [ ] T022 [P] Manual verification: Export with no query params, verify backward compatibility (current behavior maintained)
- [ ] T023 [P] Manual verification: Export with large time range (10 years), verify performance impact < 5%
- [ ] T024 [P] Performance test: Measure export time with and without timeRangeParams for baseline comparison
- [ ] T025 Code review: Verify no `any` types, all functions have explicit return types
- [ ] T026 Update MEMORY.md with lessons learned about time range generation algorithms (if applicable)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS user story
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **Polish (Phase 4)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - This is the ONLY user story for this feature (single P1 story)
  - Delivers complete functionality independently

### Within User Story 1

1. Tests (T007-T010) MUST be written first and FAIL before implementation
2. Tests can run in parallel (all marked [P])
3. Implementation tasks (T011-T016) must run sequentially:
   - T011: Update function signature (prerequisite for all others)
   - T012-T014: Modify export logic (can be done together, same file)
   - T015-T016: Update store (depends on T011-T014 completing)
4. Verification tasks (T017-T020) run after all implementation complete

### Parallel Opportunities

**Phase 1 (Setup)**:

- All 3 tasks can run in parallel (T001-T003 marked [P])

**Phase 2 (Foundational)**:

- T004 and T005 can run in parallel (different parts of same file)
- T006 must wait for T005 (needs function to test)

**Phase 3 (User Story 1 Tests)**:

- All test writing tasks (T007-T010) can run in parallel (all marked [P])

**Phase 3 (User Story 1 Implementation)**:

- T012-T014 can be done together (same file, related changes)
- T015-T016 can be done together (same file, related changes)

**Phase 4 (Polish)**:

- All manual verification tasks (T021-T024) can run in parallel (all marked [P])

---

## Parallel Example: User Story 1

### Writing Tests (All Parallel)

```bash
# Launch all test writing tasks together:
Task T007: "Unit test: exportPerformanceRecords with timeRangeParams"
Task T008: "Unit test: exportPerformanceRecords fallback behavior"
Task T009: "Unit test: empty records with timeRangeParams"
Task T010: "E2E test: Export with sparse data"
```

### Implementation (Sequential Blocks)

```bash
# Block 1: Update function signature
Task T011: "Update exportPerformanceRecords signature"

# Block 2: Modify export logic (can group together)
Task T012: "Call generateTimeRangeColumns when params provided"
Task T013: "Fill all generated columns with empty strings"
Task T014: "Add fallback to scan data"

# Block 3: Update store (can group together)
Task T015: "Extract and pass timeRangeParams in exportBatch"
Task T016: "Add Sentry breadcrumb logging"

# Block 4: Verification (sequential)
Task T017-T020: Run test suites and checks
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (create utility function)
3. Write all tests for Phase 3 (T007-T010) - verify they FAIL
4. Complete Phase 3: User Story 1 implementation (T011-T020)
5. **STOP and VALIDATE**:
   - All tests pass
   - Manual export verification
   - Type checking passes
6. Deploy/demo when ready

### Incremental Delivery

This feature has a single user story (P1), delivering:

1. **Foundation** (Phase 1-2): Time range column generator utility
2. **MVP** (Phase 3): Complete header display in all exports
3. **Polish** (Phase 4): Performance validation and documentation

Each phase adds value:

- After Phase 2: Utility function is reusable for other features
- After Phase 3: Export functionality is complete and tested
- After Phase 4: Performance validated, ready for production

### Development Workflow

```bash
# 1. Setup environment
cd frontend
pnpm install
pnpm dev  # Start dev server

# 2. Run tests in watch mode
pnpm test:unit --watch

# 3. Implement changes following task order

# 4. Before committing, verify all checks pass:
pnpm run type-check  # TypeScript strict mode
pnpm run lint        # oxlint
pnpm run format      # oxfmt
pnpm test           # All tests

# 5. Run E2E tests
pnpm test:e2e

# 6. Manual verification with actual exports
```

---

## Task Summary

### Total Tasks: 26

**By Phase**:

- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 3 tasks
- Phase 3 (User Story 1): 14 tasks (4 tests + 10 implementation/verification)
- Phase 4 (Polish): 6 tasks

**By Type**:

- Tests: 4 tasks (T007-T010)
- Implementation: 8 tasks (T011-T016, T017-T018)
- Verification: 5 tasks (T019-T020, T021-T023)
- Documentation/Performance: 3 tasks (T024-T026)

**Parallel Opportunities**: 11 tasks marked [P] across all phases

### MVP Scope

**Minimum Viable Product = User Story 1 (Phase 1 + 2 + 3)**

Delivers:

- Complete header display in Excel exports
- All time period columns from query range included
- Empty cells for missing data
- Backward compatible (falls back when no query params)
- Fully tested (unit + E2E)
- Type-safe (TypeScript strict mode)

**Time Estimate**:

- Phase 1-2: 1-2 hours (setup + foundation)
- Phase 3: 4-6 hours (tests + implementation)
- Phase 4: 1-2 hours (validation + polish)
- **Total: 6-10 hours for complete feature**

---

## Notes

- [P] tasks = Can run in parallel (different files or independent)
- [US1] label = Belongs to User Story 1 (only story in this feature)
- All tasks follow TypeScript strict mode requirements
- Pre-commit hooks will enforce oxlint, oxfmt, vue-tsc checks
- Sentry integration maintained throughout
- Commit after completing each logical task group
- Stop at any checkpoint to validate independently
- Feature is small scope (2 files modified, 2 files for tests)
- Low risk: Optional parameter maintains backward compatibility
