# Function Contracts: Export Headers Fix

**Feature**: Export Headers Fix
**Branch**: 002-export-headers-fix
**Date**: 2026-02-11

## Overview

This document defines the function signatures and contracts for the export headers fix implementation. These are internal frontend functions, not HTTP APIs.

## Core Functions

### `generateTimeRangeColumns`

**Purpose**: Generate a complete list of time period column identifiers for a given query range.

**Location**: `src/utils/export.ts`

**Signature**:

```typescript
function generateTimeRangeColumns(
  params: ExportTimeRangeParams
): string[]
```

**Parameters**:

- `params: ExportTimeRangeParams`
  - `start_year: number` - Starting year (2000-2100)
  - `end_year: number` - Ending year (2000-2100)
  - `start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'` - Optional starting quarter (default: 'Q1')
  - `end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'` - Optional ending quarter (default: 'Q4')

**Returns**: `string[]`

- Array of column identifiers in format "YYYYQN" (e.g., "2024Q3")
- Ordered chronologically (earliest to latest)
- No duplicates

**Preconditions**:

- `start_year <= end_year`
- `start_year >= 2000 && start_year <= 2100`
- `end_year >= 2000 && end_year <= 2100`
- If `start_year === end_year`, then `start_quarter` number <= `end_quarter` number

**Postconditions**:

- Result length >= 1
- All elements match pattern `/^\d{4}Q[1-4]$/`
- Elements are sorted chronologically

**Examples**:

```typescript
// Single year, partial quarters
generateTimeRangeColumns({
  start_year: 2024,
  end_year: 2024,
  start_quarter: 'Q2',
  end_quarter: 'Q4'
})
// Returns: ['2024Q2', '2024Q3', '2024Q4']

// Multiple years, partial quarters
generateTimeRangeColumns({
  start_year: 2024,
  end_year: 2025,
  start_quarter: 'Q3',
  end_quarter: 'Q2'
})
// Returns: ['2024Q3', '2024Q4', '2025Q1', '2025Q2']

// Full year (quarters not specified)
generateTimeRangeColumns({
  start_year: 2024,
  end_year: 2024
})
// Returns: ['2024Q1', '2024Q2', '2024Q3', '2024Q4']
```

**Error Cases**:

- Invalid year range: Should not throw (validated by backend before reaching here)
- Missing required params: TypeScript prevents this at compile time

---

### `exportPerformanceRecords` (modified)

**Purpose**: Export performance records to Excel with complete headers based on query parameters.

**Location**: `src/utils/export.ts`

**Signature**:

```typescript
async function exportPerformanceRecords(
  records: PerformanceRecord[] | BusinessQueryRecord[],
  format: 'xlsx' | 'xls' = 'xlsx',
  filename: string = '绩效数据',
  timeRangeParams?: ExportTimeRangeParams
): Promise<void>
```

**Parameters**:

- `records: PerformanceRecord[] | BusinessQueryRecord[]` - Array of records to export
- `format: 'xlsx' | 'xls'` - Export file format (default: 'xlsx')
- `filename: string` - Base filename without extension (default: '绩效数据')
- `timeRangeParams?: ExportTimeRangeParams` - Optional query params for complete header generation

**Returns**: `Promise<void>`

- Triggers browser download on success
- Throws error on failure

**Behavior**:

1. **With `timeRangeParams` provided**:
   - Generate complete column set using `generateTimeRangeColumns(timeRangeParams)`
   - For each record, fill in values for all generated columns
   - Missing data appears as empty string ("")

2. **Without `timeRangeParams`** (backward compatibility):
   - Scan records to find existing time period columns
   - Only include columns that exist in data (current behavior)

**Preconditions**:

- `records` can be empty array (generates header-only file)
- `format` must be 'xlsx' or 'xls'
- `filename` must be non-empty string
- If `timeRangeParams` provided, must satisfy `generateTimeRangeColumns` preconditions

**Postconditions**:

- Excel file downloaded to user's browser
- File contains all static columns in fixed order
- File contains all time period columns (generated from params or scanned from data)
- Empty cells contain empty strings, not null/undefined

**Error Handling**:

- Throws error if XLSX library fails to generate file
- Throws error if browser download fails
- Errors are caught by caller and reported to Sentry

---

## Store Methods

### `exportBatch` (modified)

**Purpose**: Export current page of data with complete headers.

**Location**: `src/stores/performance-report.ts`

**Signature**:

```typescript
async function exportBatch(format: 'xlsx' | 'xls' = 'xlsx'): Promise<void>
```

**Parameters**:

- `format: 'xlsx' | 'xls'` - Export file format (default: 'xlsx')

**Returns**: `Promise<void>`

**Behavior**:

1. Extract current page data from `businessQueryRecords` or `records`
2. Extract time range params from `businessQueryParams.value`
3. Call `exportPerformanceRecords` with data and time range params
4. Log breadcrumb on success
5. Capture error to Sentry on failure

**Changes from Current**:

- **Before**: `await exportPerformanceRecords(data, format, '绩效数据')`
- **After**: `await exportPerformanceRecords(data, format, '绩效数据', timeRangeParams)`

**Preconditions**:

- Store state is initialized
- `businessQueryRecords` or `records` contains data (or empty array)

**Postconditions**:

- Excel file downloaded on success
- `exporting` state set to false
- Error logged to Sentry on failure

---

## Type Definitions

### `ExportTimeRangeParams`

**Purpose**: Subset of query parameters needed for complete header generation.

**Location**: `src/utils/export.ts`

**Definition**:

```typescript
export interface ExportTimeRangeParams {
  /** Starting year (2000-2100) */
  start_year: number;

  /** Ending year (2000-2100) */
  end_year: number;

  /** Optional starting quarter (default: Q1) */
  start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  /** Optional ending quarter (default: Q4) */
  end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}
```

**Relationship**:

- Subset of `PerformanceReportBusinessQueryParams` (defined in `src/types/performance-report.ts`)
- Only includes fields needed for time range generation
- Can be constructed from store's `businessQueryParams.value`

---

## Integration Points

### Store → Export Utility

**Flow**:

```typescript
// In performance-report store
const timeRangeParams = {
  start_year: businessQueryParams.value.start_year,
  end_year: businessQueryParams.value.end_year,
  start_quarter: businessQueryParams.value.start_quarter,
  end_quarter: businessQueryParams.value.end_quarter,
};

await exportPerformanceRecords(data, format, '绩效数据', timeRangeParams);
```

**Contract**:

- Store must provide valid query params (already validated by backend)
- Export utility handles undefined params gracefully (falls back to current behavior)
- No null checks needed (TypeScript strict mode enforces this)

### Export Utility → Excel Generation

**Flow**:

```typescript
// In exportPerformanceRecords
const exportData = transformRecordsToExportFormat(records, timeColumns);
await exportToExcel(exportData, filename, format);
```

**Contract**:

- `exportData` must be array of flat objects (no nested structures)
- All column values must be primitives (string, number, or empty string)
- No undefined values in column data

---

## Testing Contracts

### Unit Test Coverage

**Function**: `generateTimeRangeColumns`

- ✅ Single year, partial quarters
- ✅ Multiple years, partial quarters
- ✅ Full year without quarter params
- ✅ Single quarter
- ✅ Edge case: 10-year range

**Function**: `exportPerformanceRecords`

- ✅ With time range params (complete headers)
- ✅ Without time range params (current behavior)
- ✅ Empty records array with time range params
- ✅ Large time range (10 years / 40 columns)

### E2E Test Coverage

**Scenario**: Export with sparse data

- ✅ Query 2024Q1-Q4, data exists for Q1 and Q3 only
- ✅ Verify all 4 quarter columns appear in downloaded Excel
- ✅ Verify empty columns contain empty strings

**Scenario**: Export without query params

- ✅ Load default data (no filters)
- ✅ Export still works (backward compatibility)
- ✅ Downloaded file contains data from visible records

---

## Backward Compatibility

### Current Behavior Preservation

**When `timeRangeParams` is undefined or incomplete**:

- Fall back to scanning records for existing time columns
- Maintains exact current export behavior
- No breaking changes for existing code paths

**When `timeRangeParams` is provided**:

- New behavior: generate complete header set
- Only affects exports when user has applied time filters
- Improves user experience without breaking existing flows

### Migration Path

**No migration needed**:

- Existing code continues to work
- New parameter is optional
- Gradual rollout: only `exportBatch` uses new parameter initially
- `exportAll` delegates to backend (unchanged)
