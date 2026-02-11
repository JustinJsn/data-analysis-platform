# Implementation Plan: Annual Performance Display

**Branch**: `001-annual-performance-display` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-annual-performance-display/spec.md`

## Summary

Add annual performance rating columns to the performance report table by extracting data from `year2025`, `year2024` fields in the BusinessQueryRecord API response. Annual columns will be displayed alongside quarterly columns in a specific order (e.g., "2025年度 | 2025 Q4 | 2025 Q3 | 2025 Q2 | 2025 Q1 | 2024年度 | 2024 Q4") with consistent colored tag rendering. Empty annual data will be represented with a dash "-" indicator, matching the existing quarterly empty state pattern.

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: Vue 3 (Composition API), Element Plus (el-table-v2), Pinia 3.x
**Storage**: API-driven (business-query endpoint returns performance data)
**Testing**: Vitest 4.x (unit tests), E2E tests for table rendering
**Target Platform**: Web (Chrome/Edge/Firefox)
**Project Type**: Web frontend (Vue 3 SPA)
**Performance Goals**: Render tables with 100+ employees × 12+ quarters without lag using el-table-v2 virtual scrolling
**Constraints**: Must maintain existing quarterly display logic, no breaking changes to API response structure
**Scale/Scope**: Affects 3 files (PerformanceReportTable.vue, performance-table.ts, performance-report.ts) plus tests

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Design Check

| Principle                        | Requirement                     | Status     | Notes                                                            |
| -------------------------------- | ------------------------------- | ---------- | ---------------------------------------------------------------- |
| **P1: TypeScript Strict Mode**   | All code must use strict typing | ✅ PASS    | Will extend existing types with annual rating fields             |
| **P2: Code Quality Gate**        | Pass oxlint, oxfmt, vue-tsc     | ✅ PASS    | Standard linting/formatting applies                              |
| **P3: Pinia State Management**   | Use Pinia for state             | ✅ PASS    | No new state needed, uses existing performanceReportStore        |
| **P4: Testing Discipline**       | Unit + E2E tests required       | ⚠️ PENDING | Will add unit tests for utilities, E2E tests for table rendering |
| **P5: Production Observability** | Sentry error tracking           | ✅ PASS    | Existing Sentry integration covers table rendering errors        |

**Gate Decision**: ✅ **PROCEED TO PHASE 0** - No constitutional violations. Testing discipline will be satisfied during implementation.

### Post-Design Check

| Principle                        | Requirement                     | Status  | Notes                                                           |
| -------------------------------- | ------------------------------- | ------- | --------------------------------------------------------------- |
| **P1: TypeScript Strict Mode**   | All code must use strict typing | ✅ PASS | Type contracts defined in contracts/annual-rating.ts            |
| **P2: Code Quality Gate**        | Pass oxlint, oxfmt, vue-tsc     | ✅ PASS | No new linting exceptions required                              |
| **P3: Pinia State Management**   | Use Pinia for state             | ✅ PASS | No state changes, uses existing performanceReportStore          |
| **P4: Testing Discipline**       | Unit + E2E tests required       | ✅ PASS | Test strategy defined (unit tests for utils, E2E for rendering) |
| **P5: Production Observability** | Sentry error tracking           | ✅ PASS | Existing Sentry integration covers new code paths               |

**Gate Decision**: ✅ **APPROVED FOR IMPLEMENTATION** - All constitutional principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-annual-performance-display/
├── plan.md              # This file
├── research.md          # Phase 0 output - Technical research findings
├── data-model.md        # Phase 1 output - Annual rating data structure
├── quickstart.md        # Phase 1 output - Developer guide for annual columns
├── contracts/           # Phase 1 output - Type definitions for annual data
└── tasks.md             # Phase 2 output (created by /speckit.tasks, not this command)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── performance-report.ts          # Extend BusinessQueryRecord with annual typing
├── utils/
│   └── performance-table.ts           # Add annual column generation logic
├── components/
│   └── performance/
│       └── PerformanceReportTable.vue # Integrate annual columns into el-table-v2
└── stores/
    └── performance-report.ts          # (No changes - uses existing API)

tests/
├── unit/
│   └── utils/
│       └── performance-table.test.ts  # Test annual column generation
└── e2e/
    └── performance-report.spec.ts     # Test annual column rendering
```

**Structure Decision**: Single project structure (Option 1). This is a frontend-only feature extending existing table component logic. No backend changes required since API already returns `year2025`/`year2024` fields. Changes are localized to 3 files: type definitions, table transformation utilities, and Vue table component.

## Complexity Tracking

> **No constitutional violations to justify**

This feature adheres to all constitutional principles:

- TypeScript strict mode enforced
- No new state management patterns (reuses existing Pinia store)
- Standard testing discipline applies
- No additional dependencies or architectural changes

---

## Phase 0: Outline & Research

### Research Tasks

Based on the technical context and user requirements, the following areas need clarification:

1. **Annual Data Structure in year2025/year2024 fields**
   - User provided example showing `"year2025": {}` (empty object)
   - Need to understand: Does empty object mean "no annual rating yet" or is there a nested structure like `{ rating: "A", ... }`?
   - Research existing API responses and backend documentation

2. **Column Positioning Logic**
   - User specified order: "2025年度 | 2025 Q4 | 2025 Q3 | 2025 Q2 | 2025 Q1 | 2024年度 | 2024 Q4"
   - Annual column appears BEFORE quarterly columns for same year (left-to-right: annual first, then Q4-Q1)
   - Confirm this ordering matches user mental model and doesn't conflict with existing el-table-v2 column generation

3. **Empty State Handling for Annual Columns**
   - Quarterly columns show "-" for missing data
   - Confirm: empty object `{}` vs `null` vs `undefined` vs missing key all display as "-"
   - Validate that `year2026` (future year) should be filtered out if it appears in API response

4. **Export Integration**
   - Existing export uses `export.ts` utility
   - Research: Does export iterate over el-table-v2 columns or directly transform API data?
   - Ensure annual columns are included in CSV/Excel export without additional configuration

### Research Consolidation

Output will be documented in `research.md` with format:

- **Decision**: [Chosen approach for annual column implementation]
- **Rationale**: [Why this approach over alternatives]
- **Alternatives Considered**: [Other options evaluated]

---

## Phase 1: Design & Contracts

### Data Model

To be generated in `data-model.md`:

**Entities**:

1. **AnnualPerformanceColumn**
   - `year`: number (e.g., 2025)
   - `key`: string (e.g., "2025-年度")
   - `title`: string (e.g., "2025年度")
   - `rating`: string | null (S/A/B/C/D or null for empty)

2. **BusinessQueryRecord (Extended)**
   - Existing: `year2025: Record<string, any> | undefined`
   - Interpretation: Extract rating value from nested structure or treat empty object as null

**Relationships**:

- Each employee (BusinessQueryRecord) can have 0-N annual ratings
- Annual ratings map to years present in quarterly data range
- Rating counts (ratingCountS, etc.) exclude annual ratings (only count quarterly)

**Validation Rules**:

- Annual rating must be one of: S, A, B, C, D, or null/undefined/empty
- Annual year must match year of at least one quarterly column
- Future years (> current year + 1) should be filtered out

### API Contracts

No new API contracts needed (read-only feature using existing `GET /api/v1/performance-reports/business-query` endpoint).

**Type Contract** (to be added to `contracts/annual-rating.ts`):

```typescript
/**
 * Annual rating extraction result
 */
export interface AnnualRatingData {
  year: number;
  rating: string | null; // S/A/B/C/D or null if no data
}

/**
 * Annual column definition for el-table-v2
 */
export interface AnnualColumn {
  year: number;
  key: string;          // "2025-年度"
  title: string;        // "2025年度"
  dataKey: string;      // "performance_data.2025-年度"
  width: number;        // 100
  fixed: boolean;       // false
  align: 'center';
}
```

### Agent Context Update

After generating documentation, run:

```bash
.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude
```

This will:

- Detect the agent type (Claude in this case)
- Update `.claude/context/annual-performance-display.md` with technology decisions
- Preserve any manual additions between markers

---

## Phase 2: Task Generation

_This phase is handled by `/speckit.tasks` command, not `/speckit.plan`_

Task breakdown will include:

1. Research annual data structure (Phase 0)
2. Extend type definitions (Phase 1)
3. Add annual column generation utility (Phase 1)
4. Integrate annual columns into PerformanceReportTable.vue (Phase 1)
5. Write unit tests for utilities (Phase 1)
6. Write E2E tests for table rendering (Phase 1)
7. Update export functionality to include annual columns (Phase 1)

---

## Implementation Notes

### Key Files to Modify

1. **src/types/performance-report.ts** (lines 310-311)
   - Add type helper to extract annual rating from `year${number}` fields
   - Document that empty object `{}` means no annual rating

2. **src/utils/performance-table.ts** (lines 196-236)
   - Extend `transformBusinessQueryToTableRows` to extract annual ratings
   - Add new function `extractAnnualColumns(years: number[]): AnnualColumn[]`
   - Modify `performance_data` map to include annual keys like `"2025-年度"`

3. **src/components/performance/PerformanceReportTable.vue** (lines 83-85)
   - Extend `displayQuarters` computed to also include annual columns
   - Insert annual columns in correct position (before quarterly columns for each year)
   - Reuse existing `getRatingTagType` function for annual rating colors

### Column Generation Algorithm

```
For each year in displayYears (descending order: 2025, 2024, ...):
  1. Add annual column: { key: "${year}-年度", title: "${year}年度" }
  2. Add quarterly columns: Q4, Q3, Q2, Q1 for that year
```

This produces the user-specified order: `2025年度 | 2025Q4 | 2025Q3 | 2025Q2 | 2025Q1 | 2024年度 | 2024Q4 | ...`

### Empty State Logic

```typescript
// Extract annual rating from year field
const yearField = record[`year${year}`];
let annualRating: string | null = null;

if (yearField && typeof yearField === 'object') {
  // Check for nested rating property
  annualRating = yearField.rating || yearField.performance_rating || null;
} else if (typeof yearField === 'string') {
  // Direct string value
  annualRating = yearField;
}

// Store in performance_data map
performanceData[`${year}-年度`] = annualRating || '';
```

Cell renderer:

```typescript
if (rating) {
  return h(ElTag, { type: getRatingTagType(rating) }, () => rating);
}
return h('span', '-'); // Empty state indicator
```

### Testing Strategy

**Unit Tests** (`tests/unit/utils/performance-table.test.ts`):

- Test annual rating extraction from various formats (nested object, direct string, empty object, null, undefined)
- Test column generation order (annual before quarterly for each year)
- Test filtering of future years
- Test empty state mapping

**E2E Tests** (`tests/e2e/performance-report.spec.ts`):

- Load performance report page
- Verify annual columns appear with correct headers ("2025年度", "2024年度")
- Verify annual columns positioned before quarterly columns
- Verify empty annual data shows "-"
- Verify annual ratings display with correct colored tags
- Export data and verify annual columns included in exported file

---

## Risks & Mitigations

| Risk                                               | Impact                                  | Mitigation                                                                   |
| -------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| Annual data structure varies between API responses | High - May not extract rating correctly | Phase 0 research will clarify structure; implement flexible extraction logic |
| Column width causes horizontal overflow            | Medium - Poor UX on narrow screens      | Use el-table-v2 virtual scrolling; test on various screen sizes              |
| Export logic doesn't handle new columns            | Medium - Incomplete exports             | Verify export iterates over all columns; add explicit test                   |
| Future years (2026) appear in API response         | Low - Confusing to users                | Filter out years > current year + 1 in column generation                     |

---

## Success Metrics

- ✅ All 10 functional requirements met (FR-001 to FR-010)
- ✅ All 5 success criteria validated (SC-001 to SC-005)
- ✅ Zero TypeScript errors with strict mode
- ✅ 80%+ unit test coverage for modified utilities
- ✅ All E2E tests passing for annual column rendering
- ✅ No performance regression (table renders in < 1 second for 100 rows)
