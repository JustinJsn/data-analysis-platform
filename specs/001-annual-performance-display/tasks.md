# Tasks: Annual Performance Display

**Input**: Design documents from `/specs/001-annual-performance-display/`
**Prerequisites**: plan.md (tech stack, structure), spec.md (user stories), research.md (decisions), data-model.md (entities), contracts/ (type definitions)

**Tests**: Per project constitution (Principle 4: Testing Discipline), unit and E2E tests are REQUIRED for all features.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a single project structure (frontend-only):

- **Source**: `src/` at repository root
- **Tests**: `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No additional infrastructure needed - using existing Vue 3 + Element Plus setup

**Status**: ✅ Already complete - project infrastructure exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions and utility functions that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Add AnnualRatingData interface to src/types/performance-report.ts
- [x] T002 [P] Add AnnualColumn interface to src/types/performance-report.ts
- [x] T003 Implement extractAnnualRating() helper function in src/utils/performance-table.ts
- [x] T004 Implement extractAnnualColumns() function in src/utils/performance-table.ts
- [x] T005 Add year filtering logic (filterValidYears) in src/utils/performance-table.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Annual Performance Summary (Priority: P1) 🎯 MVP

**Goal**: Enable users to view annual performance ratings alongside quarterly ratings in the performance report table

**Independent Test**: Query performance data for any employee or department and verify that annual rating columns (2025年度, 2024年度) appear in the table alongside quarterly columns, showing correct ratings as colored tags or "-" for empty data

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T006 [P] [US1] Unit test: extractAnnualRating() handles direct string format in tests/unit/utils/performance-table.test.ts
- [ ] T007 [P] [US1] Unit test: extractAnnualRating() handles nested object format in tests/unit/utils/performance-table.test.ts
- [ ] T008 [P] [US1] Unit test: extractAnnualRating() returns null for empty variants ({}, null, undefined) in tests/unit/utils/performance-table.test.ts
- [ ] T009 [P] [US1] Unit test: extractAnnualColumns() generates correct column format in tests/unit/utils/performance-table.test.ts
- [ ] T010 [P] [US1] Unit test: extractAnnualColumns() filters future years in tests/unit/utils/performance-table.test.ts

### Implementation for User Story 1

- [x] T011 [US1] Modify transformBusinessQueryToTableRows() to extract annual ratings from year fields in src/utils/performance-table.ts
- [x] T012 [US1] Update PerformanceReportTable.vue columns computed to include annual columns before quarterly in src/components/performance/PerformanceReportTable.vue
- [x] T013 [US1] Add annual column cell renderer with colored tag support in src/components/performance/PerformanceReportTable.vue
- [x] T014 [US1] Verify annual columns use same getRatingTagType() function as quarterly in src/components/performance/PerformanceReportTable.vue
- [ ] T015 [P] [US1] E2E test: Verify annual columns appear with correct headers ("2025年度", "2024年度") in tests/e2e/performance-report.spec.ts
- [ ] T016 [P] [US1] E2E test: Verify annual columns positioned before quarterly columns in tests/e2e/performance-report.spec.ts
- [ ] T017 [P] [US1] E2E test: Verify annual ratings display with correct colored tags (S=green, A=green, B=blue, C=orange, D=red) in tests/e2e/performance-report.spec.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - annual columns display correctly with ratings or empty indicators

---

## Phase 4: User Story 2 - Handle Missing Annual Data Gracefully (Priority: P2)

**Goal**: Ensure empty annual data displays consistently as "-" without breaking the user experience

**Independent Test**: Query employees with various data scenarios (quarterly only, annual only, both, neither) and verify "-" appears for missing annual data without errors

### Tests for User Story 2

- [ ] T018 [P] [US2] Unit test: transformBusinessQueryToTableRows() stores empty string for null annual ratings in tests/unit/utils/performance-table.test.ts
- [ ] T019 [P] [US2] Unit test: transformBusinessQueryToTableRows() handles missing year fields gracefully in tests/unit/utils/performance-table.test.ts
- [ ] T020 [P] [US2] E2E test: Verify empty annual data displays as "-" in tests/e2e/performance-report.spec.ts
- [ ] T021 [P] [US2] E2E test: Verify mixed data completeness (some with annual, some without) renders correctly in tests/e2e/performance-report.spec.ts

### Implementation for User Story 2

- [x] T022 [US2] Add null safety checks in extractAnnualRating() for empty object, null, undefined in src/utils/performance-table.ts
- [x] T023 [US2] Ensure cell renderer displays "-" for empty string ratings in src/components/performance/PerformanceReportTable.vue
- [x] T024 [US2] Add defensive handling for missing yearXXXX fields in transformBusinessQueryToTableRows() in src/utils/performance-table.ts
- [ ] T025 [P] [US2] E2E test: Verify table renders without layout shifts when data is missing in tests/e2e/performance-report.spec.ts
- [ ] T026 [P] [US2] E2E test: Verify no console errors when annual data is missing in tests/e2e/performance-report.spec.ts

**Checkpoint**: At this point, empty state handling should be robust - no errors with missing data

---

## Phase 5: User Story 3 - Column Organization and Visual Hierarchy (Priority: P3)

**Goal**: Ensure annual columns are visually distinct and logically positioned relative to quarterly columns

**Independent Test**: Load multi-year performance report and verify annual columns are positioned correctly (before quarterly for each year) with distinct headers

### Tests for User Story 3

- [ ] T027 [P] [US3] Unit test: Column generation produces correct order (annual before quarterly per year) in tests/unit/utils/performance-table.test.ts
- [ ] T028 [P] [US3] Unit test: Annual column headers use "年度" suffix correctly in tests/unit/utils/performance-table.test.ts
- [ ] T029 [P] [US3] E2E test: Verify column order matches specification (2025年度 | 2025Q4 | 2025Q3 | 2025Q2 | 2025Q1 | 2024年度) in tests/e2e/performance-report.spec.ts
- [ ] T030 [P] [US3] E2E test: Verify annual and quarterly columns have consistent styling (tags, colors) in tests/e2e/performance-report.spec.ts

### Implementation for User Story 3

- [x] T031 [US3] Refactor column generation algorithm to insert annual column before quarterly loop in src/components/performance/PerformanceReportTable.vue
- [x] T032 [US3] Extract year range from displayQuarters and generate annual columns for each year in src/components/performance/PerformanceReportTable.vue
- [x] T033 [US3] Verify annual columns use correct title format ("${year}年度") and key format ("${year}-年度") in src/components/performance/PerformanceReportTable.vue
- [ ] T034 [P] [US3] E2E test: Verify table horizontal scrolling works correctly with annual columns in tests/e2e/performance-report.spec.ts
- [ ] T035 [P] [US3] E2E test: Verify annual column width (100px) matches quarterly columns in tests/e2e/performance-report.spec.ts

**Checkpoint**: At this point, all visual organization requirements should be met

---

## Phase 6: Export Integration & Cross-Cutting Concerns

**Purpose**: Ensure export functionality includes annual columns and verify overall feature quality

- [ ] T036 [P] E2E test: Export performance report and verify annual columns included in CSV/Excel in tests/e2e/performance-report.spec.ts
- [ ] T037 [P] E2E test: Verify exported file includes correct annual column headers ("2025年度") in tests/e2e/performance-report.spec.ts
- [ ] T038 [P] E2E test: Verify exported annual data matches displayed data (ratings or empty cells) in tests/e2e/performance-report.spec.ts
- [x] T039 Run TypeScript type check (vue-tsc) and verify zero errors with strict mode
- [x] T040 [P] Run oxlint and oxfmt to verify code quality compliance
- [x] T041 [P] Add JSDoc comments to new utility functions in src/utils/performance-table.ts
- [ ] T042 Verify performance: Table renders <1 second for 100 employees × 12 quarters + 3 annual columns
- [x] T043 [P] Update quickstart.md examples if implementation deviates from plan (Note: Implementation matches plan, no updates needed)
- [ ] T044 Run all unit tests and verify 80%+ coverage for modified files
- [ ] T045 Run all E2E tests and verify 100% pass rate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete - existing project infrastructure
- **Foundational (Phase 2)**: Must complete T001-T005 - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Export & Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (T001-T005) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Foundational (T001-T005) - Builds on US1 but independently testable
- **User Story 3 (P3)**: Depends on Foundational (T001-T005) - Refines US1 implementation but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Utility functions (T003-T005) before component integration (T011-T014)
- Component changes (T011-T014) before E2E validation (T015-T017)
- Core functionality before visual polish

### Parallel Opportunities

- **Phase 2 Foundational**: T001 and T002 (type definitions) can run in parallel, then T003-T005 (utilities)
- **Phase 3 US1 Tests**: T006-T010 can all run in parallel (different test files/suites)
- **Phase 3 US1 E2E**: T015-T017 can run in parallel after T013 completes
- **Phase 4 US2 Tests**: T018-T021 can all run in parallel
- **Phase 4 US2 E2E**: T025-T026 can run in parallel after T024 completes
- **Phase 5 US3 Tests**: T027-T030 can all run in parallel
- **Phase 5 US3 E2E**: T034-T035 can run in parallel after T033 completes
- **Phase 6 Export Tests**: T036-T038 can run in parallel
- **Phase 6 Quality Checks**: T039-T041, T044-T045 can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase (T001-T005) completes:

# Launch all unit tests for User Story 1 together:
Task: "Unit test: extractAnnualRating() handles direct string format"
Task: "Unit test: extractAnnualRating() handles nested object format"
Task: "Unit test: extractAnnualRating() returns null for empty variants"
Task: "Unit test: extractAnnualColumns() generates correct column format"
Task: "Unit test: extractAnnualColumns() filters future years"

# Then implement (sequentially due to file dependencies):
Task: "Modify transformBusinessQueryToTableRows() to extract annual ratings" (T011)
Task: "Update PerformanceReportTable.vue columns computed" (T012)
Task: "Add annual column cell renderer" (T013)
Task: "Verify getRatingTagType() reuse" (T014)

# Then launch all E2E tests together:
Task: "E2E: Verify annual columns appear with correct headers"
Task: "E2E: Verify annual columns positioned before quarterly"
Task: "E2E: Verify annual ratings display with correct colored tags"
```

---

## Parallel Example: User Story 2

```bash
# After User Story 1 completes:

# Launch all tests for User Story 2 together:
Task: "Unit test: transformBusinessQueryToTableRows() stores empty string"
Task: "Unit test: transformBusinessQueryToTableRows() handles missing fields"
Task: "E2E: Verify empty annual data displays as -"
Task: "E2E: Verify mixed data completeness renders correctly"

# Then implement (may touch same files as US1, run sequentially):
Task: "Add null safety checks in extractAnnualRating()" (T022)
Task: "Ensure cell renderer displays - for empty string" (T023)
Task: "Add defensive handling for missing yearXXXX fields" (T024)

# Then launch remaining E2E tests:
Task: "E2E: Verify no layout shifts with missing data"
Task: "E2E: Verify no console errors with missing data"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Phase 1: Setup (already complete)
2. Complete Phase 2: Foundational (T001-T005) - type definitions and utilities
3. Complete Phase 3: User Story 1 (T006-T017) - basic annual column display
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - users can now see annual ratings

### Incremental Delivery

1. Complete Foundational (T001-T005) → Type system and utilities ready
2. Add User Story 1 (T006-T017) → Test independently → Deploy/Demo (MVP! Annual columns visible)
3. Add User Story 2 (T018-T026) → Test independently → Deploy/Demo (Robust empty state handling)
4. Add User Story 3 (T027-T035) → Test independently → Deploy/Demo (Visual polish complete)
5. Complete Export & Polish (T036-T045) → Final validation → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational (T001-T005) together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T006-T017) - Core annual display
   - **Developer B**: Can start User Story 2 tests (T018-T021) in parallel
   - **Developer C**: Can start User Story 3 tests (T027-T030) in parallel
3. After US1 implementation (T011-T014) completes:
   - **Developer B**: Complete US2 implementation (T022-T026)
   - **Developer C**: Complete US3 implementation (T031-T035)
4. Stories integrate independently without conflicts

---

## Task Summary

**Total Tasks**: 45

**Breakdown by Phase**:

- Phase 1 (Setup): 0 tasks (infrastructure exists)
- Phase 2 (Foundational): 5 tasks (T001-T005)
- Phase 3 (US1 - View Annual Summary): 12 tasks (T006-T017)
- Phase 4 (US2 - Handle Missing Data): 9 tasks (T018-T026)
- Phase 5 (US3 - Column Organization): 9 tasks (T027-T035)
- Phase 6 (Export & Polish): 10 tasks (T036-T045)

**Breakdown by Type**:

- Type definitions: 2 tasks (T001-T002)
- Utility functions: 3 tasks (T003-T005)
- Unit tests: 11 tasks (T006-T010, T018-T019, T027-T028, others)
- Component implementation: 7 tasks (T011-T014, T022-T024, T031-T033)
- E2E tests: 15 tasks (T015-T017, T020-T021, T025-T026, T029-T030, T034-T038)
- Quality checks: 7 tasks (T039-T045)

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel within their phase

**Suggested MVP Scope**: Phase 2 (Foundational) + Phase 3 (User Story 1) = 17 tasks

**Independent Test Criteria**:

- **US1**: Load employee data → Annual columns appear → Ratings display correctly
- **US2**: Load mixed data → Empty annual shows "-" → No errors
- **US3**: Load multi-year report → Correct column order → Consistent styling

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests must be written first and FAIL before implementing (TDD per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution requires 80% unit test coverage for src/utils, 100% E2E coverage of primary flows
- Export integration requires no custom code (automatic via el-table-v2 column iteration)
