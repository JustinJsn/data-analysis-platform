# Implementation Plan: Export Headers Fix

**Branch**: `002-export-headers-fix` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-export-headers-fix/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix the export functionality to include all time period columns (years/quarters) in exported Excel files based on active query parameters, regardless of whether actual performance data exists for those periods. Empty periods will display as empty cells. This ensures consistent report structure and makes data gaps immediately visible to users.

**Technical Approach**: Modify the `exportPerformanceRecords` function in `src/utils/export.ts` to accept query parameters and pre-generate a complete list of expected time period columns based on the query range. Update both `exportBatch` and `exportAll` methods in the store to pass query parameters to the export utility.

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: Vue 3 (Composition API), Pinia 3.x, Element Plus, xlsx library
**Storage**: N/A (frontend-only feature)
**Testing**: Vitest 4.x (unit tests), Playwright (E2E tests)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (frontend + backend, this feature is frontend-only)
**Performance Goals**: Export processing time increase < 5% compared to current implementation
**Constraints**: Must handle time ranges up to 10 years without significant memory issues; maintain current export file format compatibility
**Scale/Scope**: Affects 2 files (src/utils/export.ts, src/stores/performance-report.ts); impacts both batch and full export flows

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle 1: TypeScript Strict Mode ✅

**Status**: PASS

- All code will use strict TypeScript with explicit types
- No `any` types; query parameters and export functions will have full type coverage
- Type safety maintained throughout export pipeline

### Principle 2: Code Quality Gate ✅

**Status**: PASS

- Changes will pass oxlint, oxfmt, and vue-tsc checks
- No pre-commit hook bypasses required
- Standard code formatting and linting compliance

### Principle 3: Centralized State Management ✅

**Status**: PASS

- Export logic uses existing Pinia store (`performance-report` store)
- Query parameters already managed in store state
- No new state management patterns introduced

### Principle 4: Testing Discipline ✅

**Status**: PASS (to be implemented)

- Will add unit tests for new utility functions (generateTimeRangeColumns, fillMissingColumns)
- Will add E2E tests covering export scenarios with sparse data
- Target: 80%+ coverage for modified utils/export.ts functions

### Principle 5: Production Observability ✅

**Status**: PASS

- Existing Sentry integration in export flow will be preserved
- Error context includes query parameters for debugging
- Breadcrumb tracking already in place for export operations

**Gate Result**: ✅ PASS - No constitutional violations. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-export-headers-fix/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── stores/
│   │   └── performance-report.ts         # MODIFY: Add query params to export methods
│   ├── utils/
│   │   └── export.ts                     # MODIFY: Update exportPerformanceRecords to generate complete headers
│   ├── types/
│   │   └── performance-report.ts         # READ: Understand query param types
│   └── views/
│       └── performance/
│           └── PerformanceReportQueryPage.vue  # READ: Understand export flow
└── tests/
    ├── stores/
    │   └── performance-report.test.ts    # MODIFY: Add tests for new export behavior
    └── e2e/
        └── performance-report-export.spec.ts  # CREATE: E2E tests for complete header export
```

**Structure Decision**: This is a web application with frontend and backend. This feature only modifies frontend code in the export utilities and store. The key files are:

- `src/utils/export.ts`: Core export logic that generates Excel file structure
- `src/stores/performance-report.ts`: State management for export operations
- Tests for both unit (utils) and E2E (full export flow) coverage

## Complexity Tracking

> **No violations - this section intentionally left empty**

This feature introduces no constitutional violations. All principles are satisfied:

- TypeScript strict mode maintained
- Code quality gates pass
- Uses existing Pinia store pattern
- Includes comprehensive testing
- Preserves Sentry error tracking

No justification needed.

---

## Phase 0: Research ✅

**Status**: COMPLETED

**Output**: [research.md](./research.md)

**Key Findings**:

1. Current export logic dynamically scans data for quarter columns, missing empty periods
2. Query parameters are available in store state but not passed to export utility
3. Need to generate complete time range columns from query parameters
4. Fall back to current behavior when query params unavailable (backward compatibility)

**Decisions**:

- Add `generateTimeRangeColumns` utility function
- Pass optional query params to `exportPerformanceRecords`
- Only modify `exportBatch` (frontend), leave `exportAll` unchanged (backend)

---

## Phase 1: Design & Contracts ✅

**Status**: COMPLETED

**Outputs**:

- [data-model.md](./data-model.md) - Data structures and transformations
- [contracts/functions.md](./contracts/functions.md) - Function signatures and contracts
- [quickstart.md](./quickstart.md) - Developer guide
- [CLAUDE.md](../../CLAUDE.md) - Updated with feature technology stack

**Key Designs**:

1. **Data Model**:
   - `TimeRangeParams` type for query parameter subset
   - `ExportHeaderSchema` enhanced with dynamic time columns
   - Data flow: Store → Export Utility → Excel

2. **Function Contracts**:
   - `generateTimeRangeColumns(params)` → `string[]`
   - `exportPerformanceRecords(..., timeRangeParams?)` with optional parameter
   - `exportBatch(format)` modified to pass query params

3. **Implementation Strategy**:
   - Maintain backward compatibility (optional parameter)
   - Pre-generate complete column set before transforming records
   - Fill missing columns with empty strings

**Constitution Re-check**: ✅ PASS (no changes to constitutional compliance)

---

## Phase 2: Tasks

**Status**: NOT STARTED (requires `/speckit.tasks` command)

**Next Command**: Run `/speckit.tasks` to generate actionable task breakdown in `tasks.md`

**Expected Task Categories**:

1. Core implementation (export utility function modifications)
2. Store integration (pass query params)
3. Unit tests (time range generation, export logic)
4. E2E tests (full export flow with sparse data)
5. Manual verification (download and inspect Excel file)

---

## Summary

**Branch**: `002-export-headers-fix`
**Planning Status**: ✅ Complete (Phases 0-1)
**Implementation Status**: ⏸️ Ready for tasks

**Artifacts Generated**:

- ✅ `plan.md` (this file)
- ✅ `research.md` (technical investigation)
- ✅ `data-model.md` (data structures)
- ✅ `contracts/functions.md` (function contracts)
- ✅ `quickstart.md` (developer guide)
- ⏸️ `tasks.md` (pending `/speckit.tasks` command)

**Key Implementation Points**:

1. Add `generateTimeRangeColumns` utility to `src/utils/export.ts`
2. Update `exportPerformanceRecords` signature with optional `timeRangeParams`
3. Modify export logic to use generated columns or fall back to data scanning
4. Update `exportBatch` in store to pass query params
5. Add comprehensive unit and E2E tests

**Risk Assessment**: 🟢 Low

- Small scope (2 files modified)
- Optional parameter preserves backward compatibility
- Falls back gracefully when query params unavailable
- No breaking changes

**Performance Impact**: 🟢 Minimal

- Pre-generating columns adds negligible overhead
- Typical ranges (1-3 years, 4-12 columns) are small
- Spec allows up to 10 years (40 columns), still manageable

**Next Step**: Run `/speckit.tasks` to generate implementation tasks.
