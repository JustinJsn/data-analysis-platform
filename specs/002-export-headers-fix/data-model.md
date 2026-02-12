# Data Model: Export Headers Fix

**Feature**: Export Headers Fix
**Branch**: 002-export-headers-fix
**Date**: 2026-02-11

## Overview

This document defines the data structures and transformations for generating complete Excel export headers based on query parameters.

## Core Entities

### TimeRangeParams

**Purpose**: Subset of query parameters needed to generate complete time period columns.

**Fields**:

- `start_year: number` - Starting year of the query range (2000-2100)
- `end_year: number` - Ending year of the query range (2000-2100)
- `start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'` - Optional starting quarter
- `end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4'` - Optional ending quarter

**Validation Rules**:

- `start_year` must be ≤ `end_year`
- If `start_quarter` is provided, `end_quarter` must also be provided
- If `start_year` equals `end_year`, `start_quarter` must be ≤ `end_quarter` (Q1=1, Q2=2, Q3=3, Q4=4)
- Year values must be in range [2000, 2100]

**Relationships**: Extracted from `PerformanceReportBusinessQueryParams` in the store

### ExportHeaderSchema (Enhanced)

**Purpose**: Defines the complete structure of Excel export columns.

**Structure**:

```typescript
{
  staticColumns: [
    '员工工号',
    '员工姓名',
    '一级部门',
    '二级部门',
    '三级部门',
    '四级部门',
    '入职日期',
    '职务',
    'S级次数',
    'A级次数',
    'B级次数',
    'C级次数',
    'D级次数'
  ],
  dynamicTimeColumns: [
    '2024Q1',
    '2024Q2',
    '2024Q3',
    // ... generated from TimeRangeParams
  ]
}
```

**Column Ordering**: Static columns first (in fixed order), then dynamic time columns (chronological order)

**Transformation**:

- Input: `TimeRangeParams` + `BusinessQueryRecord[]`
- Output: Excel file with complete header set

## Data Transformations

### 1. Query Params → Time Columns

**Function**: `generateTimeRangeColumns`

**Input**: `TimeRangeParams`

**Output**: `string[]` (array of column identifiers like "2024Q3")

**Algorithm**:

```
1. If start_quarter and end_quarter are missing:
   - Default start_quarter = 'Q1'
   - Default end_quarter = 'Q4'

2. Convert quarters to numbers (Q1=1, Q2=2, Q3=3, Q4=4)

3. For each year from start_year to end_year:
   a. Determine first quarter:
      - If year == start_year: use start_quarter number
      - Else: use 1 (Q1)
   b. Determine last quarter:
      - If year == end_year: use end_quarter number
      - Else: use 4 (Q4)
   c. For each quarter from first to last:
      - Add "${year}Q${quarter}" to result array

4. Return sorted array (chronological order)
```

**Example Transformations**:

| Input                                                                        | Output                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| `{start_year: 2024, end_year: 2024, start_quarter: 'Q2', end_quarter: 'Q4'}` | `['2024Q2', '2024Q3', '2024Q4']`           |
| `{start_year: 2024, end_year: 2025, start_quarter: 'Q3', end_quarter: 'Q2'}` | `['2024Q3', '2024Q4', '2025Q1', '2025Q2']` |
| `{start_year: 2024, end_year: 2024}` (no quarters)                           | `['2024Q1', '2024Q2', '2024Q3', '2024Q4']` |

### 2. Business Query Records → Export Rows

**Function**: `transformRecordToExportRow` (enhanced)

**Input**:

- `record: BusinessQueryRecord`
- `requiredTimeColumns: string[]` (from `generateTimeRangeColumns`)

**Output**: `Record<string, any>` (Excel row object)

**Algorithm**:

```
1. Create row with static columns from record:
   {
     '员工工号': record.employeeNo || '',
     '员工姓名': record.name || '',
     // ... other static fields
   }

2. For each column in requiredTimeColumns:
   a. Check if record has this property (e.g., record['2024Q3'])
   b. If exists: row[column] = record[column] || ''
   c. If missing: row[column] = ''  // CRITICAL: empty string for missing data

3. Return row
```

**Key Change**: Previously, step 2 only processed columns that existed in the data. Now it processes ALL required columns from the time range.

### 3. Complete Export Data Structure

**Before** (current behavior):

```typescript
[
  {
    '员工工号': '001',
    '员工姓名': '张三',
    // ... static columns
    '2024Q1': 'A',  // Only columns with data
    '2024Q3': 'B'
  }
]
```

**After** (new behavior with query params `{start_year: 2024, end_year: 2024}`):

```typescript
[
  {
    '员工工号': '001',
    '员工姓名': '张三',
    // ... static columns
    '2024Q1': 'A',
    '2024Q2': '',  // Empty column now included
    '2024Q3': 'B',
    '2024Q4': ''   // Empty column now included
  }
]
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User triggers export                                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ PerformanceReportQueryPage                                   │
│ - Calls handleExport(type, format)                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ performance-report store                                     │
│ - exportBatch() or exportAll()                               │
│ - Accesses businessQueryParams.value                         │
│ - Passes query params to export utility                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ exportPerformanceRecords(records, format, filename, params)  │
│ 1. Call generateTimeRangeColumns(params)                     │
│    → ['2024Q1', '2024Q2', '2024Q3', '2024Q4']               │
│ 2. Transform each record with complete column set            │
│ 3. Call exportToExcel(rows, filename, format)                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Excel file generated with complete headers                   │
│ - All queried time periods present as columns                │
│ - Empty strings for missing data                             │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Store Changes

**File**: `src/stores/performance-report.ts`

**Modified Methods**:

1. **`exportBatch`** (line 168):

```typescript
// Before
await exportPerformanceRecords(data as any, format, '绩效数据');

// After
await exportPerformanceRecords(
  data as any,
  format,
  '绩效数据',
  {
    start_year: businessQueryParams.value.start_year,
    end_year: businessQueryParams.value.end_year,
    start_quarter: businessQueryParams.value.start_quarter,
    end_quarter: businessQueryParams.value.end_quarter,
  }
);
```

2. **`exportAll`** (line 196):

```typescript
// Already sends params to backend via exportRequest
// Backend returns CSV/XLSX with complete headers
// Frontend doesn't need changes for this flow (backend responsibility)
```

**Note**: Only `exportBatch` needs modification, as `exportAll` delegates to backend.

## Type Definitions

### New/Modified Types

**File**: `src/utils/export.ts`

```typescript
/**
 * Time range parameters for generating complete column headers
 */
export interface ExportTimeRangeParams {
  start_year: number;
  end_year: number;
  start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

/**
 * Generate all time period columns for a given query range
 */
export function generateTimeRangeColumns(
  params: ExportTimeRangeParams
): string[];

/**
 * Export performance records with complete headers based on query params
 *
 * @param records - Performance records to export
 * @param format - Export format (xlsx or xls)
 * @param filename - Output filename without extension
 * @param timeRangeParams - Optional query params to generate complete column set
 */
export async function exportPerformanceRecords(
  records: PerformanceRecord[] | BusinessQueryRecord[],
  format: 'xlsx' | 'xls',
  filename: string,
  timeRangeParams?: ExportTimeRangeParams
): Promise<void>;
```

## Edge Cases

### Empty Query Results

**Scenario**: Query returns no records (empty array)

**Expected Behavior**:

- Generate header row with all columns based on query params
- No data rows
- Excel file still downloads with complete header structure

**Implementation**:

```typescript
if (records.length === 0 && timeRangeParams) {
  // Generate empty row with all headers
  const emptyRow = createEmptyRowWithHeaders(timeRangeParams);
  exportData = [emptyRow];
}
```

### Missing Query Parameters

**Scenario**: `timeRangeParams` is undefined or incomplete

**Expected Behavior**:

- Fall back to current behavior (scan data for quarters)
- Maintain backward compatibility

**Implementation**:

```typescript
if (!timeRangeParams?.start_year || !timeRangeParams?.end_year) {
  // Fall back to scanning data
  timeColumns = extractQuartersFromData(records);
}
```

### Large Time Ranges

**Scenario**: User queries 10 years (40 columns)

**Expected Behavior**:

- Generate all 40 columns
- Performance impact < 5% per success criteria

**Mitigation**:

- Pre-allocate array with known size
- Use efficient loop (no dynamic array resizing)

## Validation

### Input Validation

**In Store** (`performance-report.ts`):

```typescript
// Query params already validated by backend API contract
// Store only passes through validated params
```

**In Export Utility** (`export.ts`):

```typescript
function validateTimeRangeParams(params: ExportTimeRangeParams): void {
  if (params.start_year < 2000 || params.start_year > 2100) {
    throw new Error('start_year must be between 2000 and 2100');
  }
  if (params.end_year < 2000 || params.end_year > 2100) {
    throw new Error('end_year must be between 2000 and 2100');
  }
  if (params.start_year > params.end_year) {
    throw new Error('start_year must not exceed end_year');
  }
  // ... additional validation
}
```

### Output Validation

**Testing Criteria**:

1. All expected columns present (static + time range)
2. Columns in correct order (static first, time chronological)
3. Empty strings for missing data (not null, not undefined)
4. File format valid (can be opened in Excel)
