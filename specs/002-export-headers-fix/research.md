# Research: Export Headers Fix

**Feature**: Export Headers Fix
**Branch**: 002-export-headers-fix
**Date**: 2026-02-11

## Overview

This document captures research findings for implementing complete header generation in Excel exports, ensuring all time period columns appear regardless of data presence.

## Research Questions

### Q1: How does the current export logic generate headers?

**Current Implementation Analysis**:

Location: `src/utils/export.ts:182-241`

```typescript
export async function exportPerformanceRecords(
  records: PerformanceRecord[] | BusinessQueryRecord[],
  format: 'xlsx' | 'xls' = 'xlsx',
  filename: string = '绩效数据',
): Promise<void>
```

**Current Behavior**:

1. Detects record type (BusinessQueryRecord vs PerformanceRecord)
2. For BusinessQueryRecord format:
   - Creates static columns: 员工工号, 员工姓名, department levels (1-4), 入职日期, 职务, rating counts (S/A/B/C/D)
   - **Dynamically scans actual data** for quarter columns matching pattern `/^(\d{4})Q([1-4])$/`
   - Only adds columns for quarters that exist in the data
3. Uses `exportToExcel(exportData, filename, format)` to generate file

**Problem Identified**: Lines 213-220 only add quarter columns that exist in the data:

```typescript
for (const key in record) {
  const quarterMatch = key.match(/^(\d{4})Q([1-4])$/);
  if (quarterMatch) {
    const year = quarterMatch[1];
    const quarter = `Q${quarterMatch[2]}`;
    row[`${year}${quarter}`] = record[key] || '';
  }
}
```

This means if a record has no data for a quarter, that column won't appear in the export.

### Q2: How are query parameters structured and passed?

**Query Parameter Flow**:

1. **Store State** (`src/stores/performance-report.ts:43-46`):

```typescript
const businessQueryParams = ref<PerformanceReportBusinessQueryParams>({
  pageNum: 1,
  pageSize: 20,
});
```

2. **Type Definition** (`src/types/performance-report.ts:47-68`):

```typescript
export interface PerformanceReportBusinessQueryParams {
  pageNum?: number;
  pageSize?: number;
  start_year?: number;      // 2000-2100
  end_year?: number;        // 2000-2100
  start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  employee_user_ids?: string;
  organization_id?: string;
  include_children?: boolean;
  batch_id?: string;
}
```

3. **Export Methods** (`src/stores/performance-report.ts:168-180, 196-220`):
   - `exportBatch`: Uses current page data, does NOT pass query params to export utility
   - `exportAll`: Builds ExportRequest with query params, sends to backend

**Key Finding**: `exportBatch` doesn't currently pass query parameters to the export utility, but query params are available in `businessQueryParams.value`.

### Q3: What's the difference between quarterly and annual view modes?

**Investigation Finding**: Based on the data model analysis:

1. **Quarterly View**:
   - Columns format: `2025Q3`, `2024Q2`, etc. (pattern: `YYYYQN`)
   - Query params include: `start_year`, `end_year`, `start_quarter`, `end_quarter`
   - BusinessQueryRecord type shows: `[key: \`${number}Q${1 | 2 | 3 | 4}\`]: string | undefined`

2. **Annual View**:
   - Columns format: Embedded in `year2025`, `year2024` objects
   - BusinessQueryRecord type shows: `[key: \`year${number}\`]: Record<string, any> | undefined`
   - Data structure is different (nested object vs flat properties)

**Decision**: Based on the current export logic (lines 213-220) which only handles quarterly format (`\d{4}Q[1-4]`), the annual view likely uses a different data transformation. For this feature, we'll focus on the quarterly view export pattern, which is the current implementation in `exportPerformanceRecords`.

### Q4: How should we generate the complete time range?

**Algorithm Design**:

```typescript
function generateTimeRangeColumns(
  startYear: number,
  endYear: number,
  startQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  endQuarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
): string[] {
  const columns: string[] = [];

  const quarterToNum = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  const startQ = quarterToNum[startQuarter];
  const endQ = quarterToNum[endQuarter];

  for (let year = startYear; year <= endYear; year++) {
    const firstQuarter = (year === startYear) ? startQ : 1;
    const lastQuarter = (year === endYear) ? endQ : 4;

    for (let quarter = firstQuarter; quarter <= lastQuarter; quarter++) {
      columns.push(`${year}Q${quarter}`);
    }
  }

  return columns;
}
```

**Example**:

- Input: `start_year=2024, end_year=2025, start_quarter='Q3', end_quarter='Q2'`
- Output: `['2024Q3', '2024Q4', '2025Q1', '2025Q2']`

### Q5: How to handle missing query parameters?

**Scenarios**:

1. **No query filters applied**: User hasn't selected time range
   - **Decision**: Fall back to current behavior (scan data for quarters)
   - **Rationale**: Don't generate hundreds of columns if user queries all data

2. **Partial query parameters**: e.g., only `start_year` and `end_year`, no quarters
   - **Decision**: Generate all quarters for the year range (Q1-Q4 for each year)
   - **Rationale**: Annual range implies full year coverage

3. **Only quarters specified, no years**:
   - **Decision**: Invalid state (backend requires years if quarters provided)
   - **Rationale**: Per API spec, quarters must be paired with years

**Implementation Strategy**:

```typescript
if (queryParams?.start_year && queryParams?.end_year) {
  // Generate complete range
  const startQ = queryParams.start_quarter || 'Q1';
  const endQ = queryParams.end_quarter || 'Q4';
  timeColumns = generateTimeRangeColumns(
    queryParams.start_year,
    queryParams.end_year,
    startQ,
    endQ
  );
} else {
  // Fall back to current behavior: scan data
  timeColumns = extractQuartersFromData(records);
}
```

## Decisions Summary

| Decision                                           | Rationale                                    | Alternative Considered                                                            |
| -------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| Pass query params to `exportPerformanceRecords`    | Query params define expected time range      | Could scan data for max/min years - rejected because wouldn't show empty columns  |
| Generate columns from query params when available  | Ensures all queried periods appear           | Could always generate full range - rejected due to potential for too many columns |
| Fall back to current behavior when no query params | Backward compatibility for edge cases        | Could require query params - rejected to avoid breaking exports                   |
| Focus on quarterly view pattern                    | Current export code only handles this format | Could add annual view support - deferred as out of scope                          |
| Use chronological ordering                         | User expectation for time series data        | Could use reverse chronological - rejected as less intuitive                      |

## Implementation Considerations

### Performance

- **Concern**: Generating many columns for large time ranges
- **Mitigation**: Query params typically span 1-3 years (4-12 columns), manageable
- **Threshold**: Spec assumes max 10 years (40 columns), still acceptable

### Backward Compatibility

- **Existing Exports**: Will now show more columns (previously missing ones)
- **Risk**: Low - adds information, doesn't remove it
- **Benefit**: Fixes current confusing behavior

### Type Safety

- **Query Param Type**: `PerformanceReportBusinessQueryParams` (already defined)
- **New Function Signature**:

```typescript
export async function exportPerformanceRecords(
  records: PerformanceRecord[] | BusinessQueryRecord[],
  format: 'xlsx' | 'xls' = 'xlsx',
  filename: string = '绩效数据',
  queryParams?: Pick<PerformanceReportBusinessQueryParams,
    'start_year' | 'end_year' | 'start_quarter' | 'end_quarter'>
): Promise<void>
```

## Next Steps

1. **Phase 1**: Design data model and contracts
   - Define `TimeRangeColumnGenerator` utility interface
   - Update `exportPerformanceRecords` function signature
   - Document data flow from store → export utility

2. **Phase 2**: Implementation (in `/speckit.tasks`)
   - Create `generateTimeRangeColumns` utility function
   - Update `exportPerformanceRecords` to use generated columns
   - Update `exportBatch` and `exportAll` to pass query params
   - Add unit tests for time range generation
   - Add E2E tests for export with sparse data
