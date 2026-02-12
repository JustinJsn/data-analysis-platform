# Quickstart: Export Headers Fix

**Feature**: Export Headers Fix
**Branch**: 002-export-headers-fix
**Date**: 2026-02-11

## Overview

This quickstart guide helps developers understand and implement the complete header export functionality. The goal is to ensure Excel exports always include all time period columns from the query range, even when data is missing for some periods.

## What's Changing?

### Before

```
User queries 2024Q1-2024Q4 data → Only Q1 and Q3 have data → Export shows:
┌────────┬──────┬───────┬───────┐
│ 工号   │ 姓名 │ 2024Q1│ 2024Q3│
├────────┼──────┼───────┼───────┤
│ 001    │ 张三 │   A   │   B   │
└────────┴──────┴───────┴───────┘
Missing columns: 2024Q2, 2024Q4
```

### After

```
User queries 2024Q1-2024Q4 data → Export shows all queried columns:
┌────────┬──────┬───────┬───────┬───────┬───────┐
│ 工号   │ 姓名 │ 2024Q1│ 2024Q2│ 2024Q3│ 2024Q4│
├────────┼──────┼───────┼───────┼───────┼───────┤
│ 001    │ 张三 │   A   │       │   B   │       │
└────────┴──────┴───────┴───────┴───────┴───────┘
Complete columns with empty values for missing data
```

## Key Files

| File                                          | What Changes                                                                                      | Why                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `src/utils/export.ts`                         | Add `generateTimeRangeColumns` function; modify `exportPerformanceRecords` to accept query params | Core logic for complete header generation        |
| `src/stores/performance-report.ts`            | Update `exportBatch` to pass query params                                                         | Provide time range context to export utility     |
| `tests/stores/performance-report.test.ts`     | Add test cases for new behavior                                                                   | Verify complete headers in exports               |
| `tests/e2e/performance-report-export.spec.ts` | Create E2E tests                                                                                  | Validate end-to-end export flow with sparse data |

## Implementation Steps

### Step 1: Add Time Range Column Generator

**File**: `src/utils/export.ts`

**Add new function** (before `exportPerformanceRecords`):

```typescript
/**
 * Time range parameters for export
 */
export interface ExportTimeRangeParams {
  start_year: number;
  end_year: number;
  start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

/**
 * Generate complete list of time period columns for a query range
 *
 * @example
 * generateTimeRangeColumns({
 *   start_year: 2024,
 *   end_year: 2025,
 *   start_quarter: 'Q3',
 *   end_quarter: 'Q2'
 * })
 * // Returns: ['2024Q3', '2024Q4', '2025Q1', '2025Q2']
 */
export function generateTimeRangeColumns(
  params: ExportTimeRangeParams
): string[] {
  const columns: string[] = [];
  const { start_year, end_year } = params;

  // Default to full year if quarters not specified
  const start_quarter = params.start_quarter || 'Q1';
  const end_quarter = params.end_quarter || 'Q4';

  // Convert quarter strings to numbers
  const quarterToNum: Record<string, number> = {
    Q1: 1, Q2: 2, Q3: 3, Q4: 4
  };
  const startQ = quarterToNum[start_quarter];
  const endQ = quarterToNum[end_quarter];

  for (let year = start_year; year <= end_year; year++) {
    const firstQuarter = (year === start_year) ? startQ : 1;
    const lastQuarter = (year === end_year) ? endQ : 4;

    for (let quarter = firstQuarter; quarter <= lastQuarter; quarter++) {
      columns.push(`${year}Q${quarter}`);
    }
  }

  return columns;
}
```

### Step 2: Update Export Function Signature

**File**: `src/utils/export.ts`

**Modify `exportPerformanceRecords` signature** (line 182):

```typescript
export async function exportPerformanceRecords(
  records: PerformanceRecord[] | BusinessQueryRecord[],
  format: 'xlsx' | 'xls' = 'xlsx',
  filename: string = '绩效数据',
  timeRangeParams?: ExportTimeRangeParams  // NEW PARAMETER
): Promise<void>
```

### Step 3: Update Export Logic for BusinessQueryRecord

**File**: `src/utils/export.ts`

**Replace lines 193-223** (BusinessQueryRecord branch):

```typescript
if (isBusinessQueryRecord) {
  // Determine which time columns to include
  let timeColumns: string[];

  if (timeRangeParams?.start_year && timeRangeParams?.end_year) {
    // Generate complete column set from query params
    timeColumns = generateTimeRangeColumns(timeRangeParams);
  } else {
    // Fall back to current behavior: scan data for quarters
    const quarterSet = new Set<string>();
    records.forEach((record: any) => {
      Object.keys(record).forEach((key) => {
        if (/^\d{4}Q[1-4]$/.test(key)) {
          quarterSet.add(key);
        }
      });
    });
    timeColumns = Array.from(quarterSet).sort();
  }

  // Transform records to export format
  exportData = records.map((record: any) => {
    const row: Record<string, any> = {
      员工工号: record.employeeNo || '',
      员工姓名: record.name || '',
      一级部门: record.level1Department || '',
      二级部门: record.level2Department || '',
      三级部门: record.level3Department || '',
      四级部门: record.level4Department || '',
      入职日期: record.employmentDate || '',
      职务: record.position || '',
      S级次数: record.ratingCountS ?? 0,
      A级次数: record.ratingCountA ?? 0,
      B级次数: record.ratingCountB ?? 0,
      C级次数: record.ratingCountC ?? 0,
      D级次数: record.ratingCountD ?? 0,
    };

    // Add time period columns (complete set)
    timeColumns.forEach((column) => {
      row[column] = record[column] || '';  // Empty string if missing
    });

    return row;
  });
}
```

### Step 4: Update Store to Pass Query Params

**File**: `src/stores/performance-report.ts`

**Modify `exportBatch` function** (around line 168):

```typescript
const exportBatch = async (format: 'xlsx' | 'xls' = 'xlsx') => {
  try {
    exporting.value = true;

    // Use current page data
    const data =
      businessQueryRecords.value.length > 0
        ? businessQueryRecords.value
        : records.value;

    // Extract time range params from current query
    const timeRangeParams =
      businessQueryParams.value.start_year &&
      businessQueryParams.value.end_year
        ? {
            start_year: businessQueryParams.value.start_year,
            end_year: businessQueryParams.value.end_year,
            start_quarter: businessQueryParams.value.start_quarter,
            end_quarter: businessQueryParams.value.end_quarter,
          }
        : undefined;

    // Call export with time range params
    const { exportPerformanceRecords } = await import('@/utils/export');
    await exportPerformanceRecords(data as any, format, '绩效数据', timeRangeParams);

    addBreadcrumb({
      message: '批量导出成功',
      category: 'performance-report.exportBatch',
      level: 'info',
      data: { count: data.length, format, timeRangeParams },
    });
  } catch (error) {
    // ... existing error handling
  } finally {
    exporting.value = false;
  }
};
```

## Testing Guide

### Unit Tests

**File**: `tests/stores/performance-report.test.ts` or `tests/utils/export.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { generateTimeRangeColumns } from '@/utils/export';

describe('generateTimeRangeColumns', () => {
  it('generates all quarters for a single year', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2024,
      start_quarter: 'Q1',
      end_quarter: 'Q4',
    });

    expect(columns).toEqual(['2024Q1', '2024Q2', '2024Q3', '2024Q4']);
  });

  it('generates quarters across multiple years', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2025,
      start_quarter: 'Q3',
      end_quarter: 'Q2',
    });

    expect(columns).toEqual(['2024Q3', '2024Q4', '2025Q1', '2025Q2']);
  });

  it('defaults to full year when quarters not specified', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2024,
    });

    expect(columns).toEqual(['2024Q1', '2024Q2', '2024Q3', '2024Q4']);
  });

  it('handles single quarter', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2024,
      start_quarter: 'Q3',
      end_quarter: 'Q3',
    });

    expect(columns).toEqual(['2024Q3']);
  });
});
```

### E2E Tests

**File**: `tests/e2e/performance-report-export.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance Report Export with Complete Headers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/performance/report');
  });

  test('exports with all quarter columns even when data is sparse', async ({ page }) => {
    // Select time range: 2024 Q1-Q4
    await page.getByLabel('开始年份').fill('2024');
    await page.getByLabel('结束年份').fill('2024');
    await page.getByLabel('开始季度').selectOption('Q1');
    await page.getByLabel('结束季度').selectOption('Q4');

    // Query data (assume only Q1 and Q3 have data)
    await page.getByRole('button', { name: '查询' }).click();
    await expect(page.getByText('查询成功')).toBeVisible();

    // Start export
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '导出数据' }).click();
    await page.getByText('批量导出（当前页）').click();
    await page.getByRole('button', { name: '开始导出' }).click();

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/绩效数据.*\.xlsx$/);

    // Verify Excel content (would require xlsx parsing library)
    // const buffer = await download.createReadStream();
    // const workbook = XLSX.read(buffer);
    // const headers = workbook.Sheets[0].A1..E1 values
    // expect(headers).toContain('2024Q1', '2024Q2', '2024Q3', '2024Q4');
  });

  test('falls back to data scanning when no query params', async ({ page }) => {
    // Don't set any query params, just load default data
    await page.getByRole('button', { name: '查询' }).click();

    // Export should still work (backward compatibility)
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '导出数据' }).click();
    await page.getByText('批量导出（当前页）').click();
    await page.getByRole('button', { name: '开始导出' }).click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/绩效数据.*\.xlsx$/);
  });
});
```

## Development Workflow

1. **Start development server**:

   ```bash
   cd frontend
   pnpm dev
   ```

2. **Run unit tests in watch mode**:

   ```bash
   pnpm test:unit --watch
   ```

3. **Make changes** following the steps above

4. **Verify with E2E tests**:

   ```bash
   pnpm test:e2e
   ```

5. **Check TypeScript compilation**:

   ```bash
   pnpm run type-check
   ```

6. **Lint and format**:
   ```bash
   pnpm run lint
   pnpm run format
   ```

## Verification Checklist

Before committing:

- [ ] `generateTimeRangeColumns` function added to `src/utils/export.ts`
- [ ] `exportPerformanceRecords` signature updated with optional `timeRangeParams`
- [ ] Export logic updated to use generated columns
- [ ] `exportBatch` in store passes query params
- [ ] Unit tests added for `generateTimeRangeColumns`
- [ ] E2E test covers sparse data export scenario
- [ ] TypeScript compilation passes (`pnpm run type-check`)
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Manual verification: Export with query 2024Q1-Q4, verify all 4 columns appear

## Common Issues

### Issue: Columns still missing in export

**Diagnosis**: Check if query params are being passed to export function

```typescript
// Add debug logging in exportBatch
console.log('Query params:', businessQueryParams.value);
console.log('Time range params:', timeRangeParams);
```

**Solution**: Ensure `businessQueryParams.value` has `start_year` and `end_year` set

### Issue: Columns in wrong order

**Diagnosis**: Check chronological sorting in `generateTimeRangeColumns`

**Solution**: Ensure outer loop (years) and inner loop (quarters) iterate in ascending order

### Issue: TypeScript errors on new parameter

**Diagnosis**: Import type not found

**Solution**: Ensure `ExportTimeRangeParams` is exported from `src/utils/export.ts`

## Next Steps

After implementing this feature:

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Follow tasks in order (typically: implementation → unit tests → E2E tests → manual verification)
3. Create PR when all tests pass and checklist complete
