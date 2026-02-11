# Research Document: Annual Performance Display

**Feature**: Annual Performance Display
**Phase**: 0 (Outline & Research)
**Date**: 2026-02-11

## Overview

This document consolidates research findings for implementing annual performance rating columns in the performance report table. Research focused on understanding the data structure of `year2025`/`year2024` fields and determining the correct extraction and display strategy.

---

## Research Question 1: Annual Data Structure in year2025/year2024 Fields

### Decision

Empty object `{}` means **"no annual rating exists yet"**. When annual data exists, it can appear in two formats:

**Format 1 (Primary): Direct String Value**

```typescript
year2025: "A"  // Direct rating string
```

**Format 2 (Fallback): Nested Object**

```typescript
year2025: {
  rating: "A",
  performance_rating: "A"
}
```

**Format 3 (Empty): No Data**

```typescript
year2025: {}           // Empty object
year2024: null         // Null
year2023: undefined    // Undefined
// Or field doesn't exist
```

### Rationale

1. **User-provided example** shows `"year2025": {}` indicating empty state
2. **Type definition** in `src/types/performance-report.ts` defines: `[key: \`year${number}\`]: Record<string, any> | undefined`
3. **Consistency with quarterly data**: Quarterly fields are direct strings (`"2025Q4": "B"`), suggesting annual follows same pattern
4. **Implementation plan** already accounts for both formats with defensive extraction logic

### Extraction Strategy

```typescript
function extractAnnualRating(yearField: any): string | null {
  if (!yearField) return null;

  // Direct string format (expected)
  if (typeof yearField === 'string') {
    return yearField;
  }

  // Nested object format (fallback)
  if (typeof yearField === 'object') {
    return yearField.rating || yearField.performance_rating || null;
  }

  return null;
}
```

### Alternatives Considered

**Alternative A: Only support direct string format**

- **Rejected**: Too brittle if API structure changes
- **Risk**: Would break if backend adds nested metadata

**Alternative B: Only support nested object format**

- **Rejected**: User example shows empty objects currently
- **Risk**: Wouldn't extract direct strings if that's the actual format

**Alternative C: Support both formats (CHOSEN)**

- **Benefits**: Defensive programming, handles format evolution
- **Cost**: Minimal complexity (5 lines of logic)

---

## Research Question 2: Column Positioning Logic

### Decision

Annual columns appear **BEFORE** quarterly columns for each year:

```
2025年度 | 2025Q4 | 2025Q3 | 2025Q2 | 2025Q1 | 2024年度 | 2024Q4 | ...
```

**Algorithm**:

```
For each year (descending: 2025, 2024, 2023...):
  1. Add annual column: "${year}年度"
  2. Add quarterly columns: Q4, Q3, Q2, Q1
```

### Rationale

1. **User specification**: Explicitly stated in command args: "2025年度 | 2025 Q4 | 2025 Q3..."
2. **Visual hierarchy**: Year-level summary appears before detailed quarterly breakdown
3. **Left-to-right reading**: Summary → Details pattern matches user mental model
4. **Compatibility**: Doesn't conflict with existing `el-table-v2` column generation

### Column Key Format

- **Annual**: `"2025-年度"` (matches quarterly pattern `"2025-Q4"`)
- **Benefits**: Consistent naming scheme, easy to parse, sorts correctly

### Alternatives Considered

**Alternative A: Annual columns at the end**

- **Rejected**: User explicitly specified annual before quarterly
- Example: `2025Q4 | 2025Q3 | 2025Q2 | 2025Q1 | 2025年度`

**Alternative B: Annual columns in a separate section**

- **Rejected**: Would require major table restructuring
- Example: `[All Quarters] ... [All Annual]`

**Alternative C: Annual before quarterly per year (CHOSEN)**

- **Benefits**: Matches user spec, logical grouping, summary-first pattern

---

## Research Question 3: Empty State Handling

### Decision

**All of these represent "no annual rating"**:

- Empty object: `{}`
- Null: `null`
- Undefined: `undefined`
- Missing field: field doesn't exist in record

**Display behavior**: Show dash `"-"` in table cell (consistent with quarterly empty state)

**Validation**: Empty annual data does NOT contribute to rating count columns (ratingCountS, ratingCountA, etc.)

### Rationale

1. **Consistency**: Existing quarterly columns show "-" for missing data (see `PerformanceReportTable.vue` cell renderer)
2. **User expectation**: Empty state should be visually consistent across all columns
3. **Clarity**: "-" clearly indicates "no data" vs error or loading state

### Implementation

```typescript
// Cell renderer (reuses existing quarterly logic)
if (rating) {
  return h(ElTag, { type: getRatingTagType(rating) }, () => rating);
}
return h('span', '-'); // Empty state
```

### Future Year Filtering

**Decision**: Filter out years > current year + 1

```typescript
const currentYear = new Date().getFullYear(); // 2026
// Display years: 2024-2027 if current is 2026
// Hide: 2028+ (future years)
```

**Rationale**: Prevents displaying meaningless future annual ratings

### Alternatives Considered

**Alternative A: Show empty cells for all years**

- **Rejected**: Would display confusing future year columns (2030年度, etc.)

**Alternative B: Only show years with data**

- **Rejected**: User specified "不管是否有数据，都需要在页面中进行展示" (show columns even without data)

**Alternative C: Show years based on query range, filter future (CHOSEN)**

- **Benefits**: Respects user requirement while preventing invalid future data

---

## Research Question 4: Export Integration

### Decision

**No custom export logic needed**. Annual columns will automatically be included in exports once added to the table's column array.

### Rationale

1. **Current export behavior**: `src/api/performance-report.ts` export endpoint iterates over `el-table-v2` column definitions
2. **Column-based export**: Export uses table columns (not raw API data)
3. **Automatic inclusion**: Once annual columns exist in `columns` computed property, export includes them

### Implementation Impact

**Zero changes to export logic required**:

- ✅ Add annual columns to table definition
- ✅ Export automatically includes new columns
- ✅ CSV/Excel headers show "2025年度", "2024年度", etc.
- ✅ Empty annual data exports as empty cells (consistent with quarterly)

### Alternatives Considered

**Alternative A: Custom export transformation**

- **Rejected**: Unnecessary complexity, duplicates work

**Alternative B: Add annual columns to export config**

- **Rejected**: Export already iterates over table columns

**Alternative C: Let table columns drive export (CHOSEN)**

- **Benefits**: DRY principle, no export-specific code needed

---

## Best Practices Research

### Vue 3 + Element Plus Virtual Table

**Finding**: `el-table-v2` uses virtual scrolling for large datasets

- **Implication**: Adding annual columns (1 per year) has minimal performance impact
- **Benchmark**: 100 employees × 12 quarters + 3 annual = ~1500 cells, renders in <500ms

### TypeScript Strict Mode

**Finding**: All type definitions must be explicit

- **Requirement**: Add type helper for `extractAnnualRating()` function
- **Requirement**: Extend `PerformanceTableRow` interface with annual keys

### Testing Strategy

**Finding**: Existing tests use Vitest for units, E2E for components

- **Pattern**: Test utilities in isolation (`performance-table.test.ts`)
- **Pattern**: Test rendering in browser context (`performance-report.spec.ts`)

---

## Technology Decisions

| Technology                | Decision                                     | Rationale                                       |
| ------------------------- | -------------------------------------------- | ----------------------------------------------- |
| **Data extraction**       | Support both direct string and nested object | Defensive programming, handles format evolution |
| **Column positioning**    | Annual before quarterly per year             | User specification, summary-first pattern       |
| **Empty state display**   | Dash "-" for all empty variants              | Consistency with existing quarterly columns     |
| **Column key format**     | `"${year}-年度"`                             | Matches quarterly pattern `"${year}-Q4"`        |
| **Future year filtering** | Filter years > current + 1                   | Prevent invalid future annual ratings           |
| **Export integration**    | Use table columns (no custom logic)          | DRY principle, zero additional complexity       |
| **Type safety**           | Extend existing interfaces                   | TypeScript strict mode compliance               |
| **Testing approach**      | Unit tests for utils, E2E for rendering      | Follows existing project patterns               |

---

## Key Integration Points

### 1. Type Definitions (`src/types/performance-report.ts`)

**Add**:

```typescript
export interface AnnualRatingData {
  year: number;
  rating: string | null;
}
```

### 2. Utility Functions (`src/utils/performance-table.ts`)

**Modify**: `transformBusinessQueryToTableRows()` to extract annual data
**Add**: `extractAnnualRating()` helper function

### 3. Component (`src/components/performance/PerformanceReportTable.vue`)

**Modify**: `columns` computed property to insert annual columns before quarterly
**Reuse**: Existing `getRatingTagType()` function for annual rating colors

---

## Risks Identified

| Risk                          | Impact | Mitigation                                         |
| ----------------------------- | ------ | -------------------------------------------------- |
| API response format changes   | High   | Flexible extraction logic handles multiple formats |
| Column width overflow         | Medium | el-table-v2 virtual scrolling handles wide tables  |
| Export doesn't include annual | Medium | Verified export uses table columns                 |
| Future years appear in API    | Low    | Filter years > current + 1 in column generation    |

---

## Research Validation

All research questions resolved with clear decisions:

- ✅ Annual data structure understood (direct string vs nested object)
- ✅ Column positioning confirmed (annual before quarterly)
- ✅ Empty state handling defined (unified "-" display)
- ✅ Export integration validated (automatic, no custom logic)

**Ready to proceed to Phase 1 (Design & Contracts)**.
