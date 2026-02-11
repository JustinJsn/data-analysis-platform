# Quickstart Guide: Annual Performance Display

**Feature**: Annual Performance Display
**Target Audience**: Developers implementing or maintaining this feature
**Last Updated**: 2026-02-11

## Overview

This guide provides a quick introduction to the annual performance display feature, which adds annual rating columns to the performance report table alongside existing quarterly columns.

---

## What This Feature Does

**Before**: Table shows only quarterly performance ratings (2025Q4, 2025Q3, 2025Q2, 2025Q1)

**After**: Table shows both annual AND quarterly ratings (2025年度, 2025Q4, 2025Q3, 2025Q2, 2025Q1)

**Key behaviors**:

- Annual columns appear BEFORE quarterly columns for each year
- Empty annual data displays as "-" (consistent with quarterly empty state)
- Annual ratings use same colored tags as quarterly (S=green, A=green, B=blue, C=orange, D=red)
- Export automatically includes annual columns

---

## Data Structure

### API Response (BusinessQueryRecord)

```typescript
{
  "employeeNo": "1004674",
  "name": "黄美霞",
  "year2025": {},           // ← Empty object = no annual rating yet
  "year2024": "A",          // ← Direct string = annual rating
  "year2023": {             // ← Nested object = annual rating
    "rating": "B"
  },
  "2025Q4": "B",            // ← Quarterly ratings (unchanged)
  "2025Q3": "B"
}
```

### Table Row (PerformanceTableRow)

```typescript
{
  employee_number: "1004674",
  employee_name: "黄美霞",
  performance_data: {
    "2025-年度": "",        // ← Empty (displays as "-")
    "2024-年度": "A",       // ← Annual rating (displays as tag)
    "2023-年度": "B",       // ← Annual rating (displays as tag)
    "2025-Q4": "B",         // ← Quarterly (unchanged)
    "2025-Q3": "B"
  }
}
```

---

## Key Files

| File                                                    | Purpose             | Changes                                                                   |
| ------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------- |
| `src/types/performance-report.ts`                       | Type definitions    | Add `AnnualRatingData`, `AnnualColumn` interfaces                         |
| `src/utils/performance-table.ts`                        | Data transformation | Add `extractAnnualRating()`, modify `transformBusinessQueryToTableRows()` |
| `src/components/performance/PerformanceReportTable.vue` | Table component     | Extend `columns` computed to insert annual columns                        |
| `tests/unit/utils/performance-table.test.ts`            | Unit tests          | Test annual extraction and column generation                              |
| `tests/e2e/performance-report.spec.ts`                  | E2E tests           | Test annual column rendering in browser                                   |

---

## Quick Implementation Guide

### Step 1: Add Type Definitions

**File**: `src/types/performance-report.ts`

```typescript
/**
 * Annual rating extraction result
 */
export interface AnnualRatingData {
  year: number;
  rating: string | null; // S/A/B/C/D or null
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

---

### Step 2: Add Extraction Logic

**File**: `src/utils/performance-table.ts`

```typescript
/**
 * Extract annual rating from year field
 */
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

/**
 * Generate annual columns for given years
 */
export function extractAnnualColumns(years: number[]): AnnualColumn[] {
  const currentYear = new Date().getFullYear();

  // Filter out future years
  const validYears = years.filter(year => year <= currentYear + 1);

  return validYears.map(year => ({
    year,
    key: `${year}-年度`,
    title: `${year}年度`,
    dataKey: `performance_data.${year}-年度`,
    width: 100,
    fixed: false,
    align: 'center' as const,
  }));
}
```

---

### Step 3: Modify Table Transformation

**File**: `src/utils/performance-table.ts`

**Modify**: `transformBusinessQueryToTableRows()` function

```typescript
export function transformBusinessQueryToTableRows(
  records: BusinessQueryRecord[],
): PerformanceTableRow[] {
  return records.map((record) => {
    const performanceData: Record<string, string> = {};

    // Extract quarterly data (EXISTING CODE - unchanged)
    for (const key in record) {
      const quarterMatch = key.match(/^(\d{4})Q([1-4])$/);
      if (quarterMatch && quarterMatch[1] && quarterMatch[2]) {
        const year = quarterMatch[1];
        const quarter = `Q${quarterMatch[2]}`;
        const rating = record[key as `${number}Q${1 | 2 | 3 | 4}`];
        if (rating && typeof rating === 'string') {
          performanceData[`${year}-${quarter}`] = rating;
        }
      }
    }

    // Extract annual data (NEW CODE)
    for (const key in record) {
      const yearMatch = key.match(/^year(\d{4})$/);
      if (yearMatch && yearMatch[1]) {
        const year = yearMatch[1];
        const yearField = record[key as `year${number}`];
        const annualRating = extractAnnualRating(yearField);
        // Store empty string for null (displays as "-")
        performanceData[`${year}-年度`] = annualRating || '';
      }
    }

    // Return row (EXISTING CODE - unchanged)
    return {
      employee_id: record.employeeNo || '',
      employee_number: record.employeeNo || '',
      employee_name: record.name || '',
      department_level1: record.level1Department ?? '',
      department_level2: record.level2Department ?? '',
      department_level3: record.level3Department ?? '',
      department_level4: record.level4Department ?? '',
      employment_date: record.employmentDate ?? '',
      position: record.position ?? '',
      performance_data: performanceData,
      rating_counts: {
        S: record.ratingCountS ?? 0,
        A: record.ratingCountA ?? 0,
        B: record.ratingCountB ?? 0,
        C: record.ratingCountC ?? 0,
        D: record.ratingCountD ?? 0,
      },
    };
  });
}
```

---

### Step 4: Update Table Component

**File**: `src/components/performance/PerformanceReportTable.vue`

**Modify**: `columns` computed property

```typescript
const columns = computed<TableColumn[]>(() => {
  const cols: TableColumn[] = [];

  // Fixed columns (EXISTING CODE - unchanged)
  cols.push(
    { key: 'employee_number', title: '工号', dataKey: 'employee_number', width: 120, fixed: 'left' },
    { key: 'employee_name', title: '姓名', dataKey: 'employee_name', width: 120, fixed: 'left' },
    // ... other fixed columns
  );

  // Extract years from displayQuarters
  const years = Array.from(
    new Set(displayQuarters.value.map(q => q.year))
  ).sort((a, b) => b - a); // Descending order

  // Performance columns with annual inserted before quarterly
  for (const year of years) {
    // Add annual column FIRST
    const annualKey = `${year}-年度`;
    cols.push({
      key: annualKey,
      title: `${year}年度`,
      dataKey: annualKey,
      width: 100,
      align: 'center' as const,
      cellRenderer: ({ rowData }: { rowData: PerformanceTableRow }) => {
        const rating = rowData.performance_data?.[annualKey];
        if (rating) {
          return h(ElTag, { type: getRatingTagType(rating) }, () => rating);
        }
        return h('span', '-'); // Empty state
      },
    });

    // Add quarterly columns (EXISTING CODE - modified to filter by year)
    const quartersForYear = displayQuarters.value.filter(q => q.year === year);
    for (const { quarter } of quartersForYear) {
      const key = `${year}-${quarter}`;
      cols.push({
        key,
        title: `${year} ${quarter}`,
        dataKey: key,
        width: 100,
        align: 'center' as const,
        cellRenderer: ({ rowData }: { rowData: PerformanceTableRow }) => {
          const rating = rowData.performance_data?.[key];
          if (rating) {
            return h(ElTag, { type: getRatingTagType(rating) }, () => rating);
          }
          return h('span', '-');
        },
      });
    }
  }

  // Rating count columns (EXISTING CODE - unchanged)
  cols.push(
    { key: 'rating_count_s', title: '获得S次数', dataKey: 'rating_counts.S', width: 100 },
    // ... other count columns
  );

  return cols;
});
```

---

## Testing

### Unit Tests

**File**: `tests/unit/utils/performance-table.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { extractAnnualRating, extractAnnualColumns } from '@/utils/performance-table';

describe('extractAnnualRating', () => {
  it('extracts direct string rating', () => {
    expect(extractAnnualRating("A")).toBe("A");
  });

  it('extracts nested object rating', () => {
    expect(extractAnnualRating({ rating: "B" })).toBe("B");
    expect(extractAnnualRating({ performance_rating: "C" })).toBe("C");
  });

  it('returns null for empty variants', () => {
    expect(extractAnnualRating({})).toBeNull();
    expect(extractAnnualRating(null)).toBeNull();
    expect(extractAnnualRating(undefined)).toBeNull();
  });
});

describe('extractAnnualColumns', () => {
  it('generates annual columns with correct format', () => {
    const columns = extractAnnualColumns([2025, 2024]);
    expect(columns).toHaveLength(2);
    expect(columns[0].key).toBe('2025-年度');
    expect(columns[0].title).toBe('2025年度');
  });

  it('filters out future years', () => {
    const currentYear = new Date().getFullYear();
    const columns = extractAnnualColumns([currentYear + 5, currentYear, currentYear - 1]);
    expect(columns.every(col => col.year <= currentYear + 1)).toBe(true);
  });
});
```

### E2E Tests

**File**: `tests/e2e/performance-report.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('displays annual columns in correct order', async ({ page }) => {
  await page.goto('/performance/report');

  // Wait for table to load
  await page.waitForSelector('.performance-report-table');

  // Check column headers appear in correct order
  const headers = await page.locator('.el-table-v2__header-cell').allTextContents();

  // Verify annual column appears before quarterly for same year
  const index2025Annual = headers.indexOf('2025年度');
  const index2025Q4 = headers.indexOf('2025 Q4');

  expect(index2025Annual).toBeGreaterThan(-1);
  expect(index2025Q4).toBeGreaterThan(-1);
  expect(index2025Annual).toBeLessThan(index2025Q4);
});

test('displays empty state for missing annual data', async ({ page }) => {
  await page.goto('/performance/report');
  await page.waitForSelector('.performance-report-table');

  // Find a cell with no annual rating
  const emptyCell = page.locator('.el-table-v2__row-cell:has-text("-")').first();
  await expect(emptyCell).toBeVisible();
  await expect(emptyCell).toHaveText('-');
});

test('displays colored tags for annual ratings', async ({ page }) => {
  await page.goto('/performance/report');
  await page.waitForSelector('.performance-report-table');

  // Check that annual rating displays with colored tag
  const ratingTag = page.locator('.el-tag:has-text("A")').first();
  await expect(ratingTag).toBeVisible();
  await expect(ratingTag).toHaveClass(/el-tag--success/);
});
```

---

## Common Issues & Solutions

### Issue 1: Annual columns not appearing

**Symptom**: Table shows quarterly columns but no annual columns

**Solution**:

1. Check if `year2025`/`year2024` fields exist in API response (inspect network tab)
2. Verify `extractAnnualRating()` is called in `transformBusinessQueryToTableRows()`
3. Ensure column generation loop includes annual column insertion

### Issue 2: Empty annual data shows blank instead of "-"

**Symptom**: Empty annual cells are blank instead of showing dash

**Solution**:

1. Check cell renderer handles empty string: `if (rating) { ... } else { return h('span', '-'); }`
2. Verify `extractAnnualRating()` returns `null` for empty objects
3. Ensure performance_data map stores `''` (empty string) for null ratings

### Issue 3: Column order is wrong

**Symptom**: Annual columns appear after quarterly columns

**Solution**:

1. Verify column generation algorithm: annual BEFORE quarterly
2. Check loop structure: `for year { add annual; for quarter { add quarterly } }`
3. Inspect `columns` array order in Vue devtools

### Issue 4: Export doesn't include annual columns

**Symptom**: Exported CSV/Excel missing annual columns

**Solution**:

1. No custom fix needed - export uses table columns automatically
2. Verify annual columns exist in `columns` computed property
3. Check export logic doesn't filter out columns with "年度" in key

---

## Quick Reference

### Column Key Formats

- **Quarterly**: `"${year}-Q${quarter}"` → `"2025-Q4"`
- **Annual**: `"${year}-年度"` → `"2025-年度"`

### Column Title Formats

- **Quarterly**: `"${year} Q${quarter}"` → `"2025 Q4"`
- **Annual**: `"${year}年度"` → `"2025年度"`

### Rating Values

- **Valid**: `"S"`, `"A"`, `"B"`, `"C"`, `"D"`
- **Empty**: `null`, `undefined`, `""`, `{}`

### Tag Colors (getRatingTagType)

- S → `success` (green)
- A → `success` (green)
- B → `primary` (blue)
- C → `warning` (orange)
- D → `danger` (red)

---

## Further Reading

- [Feature Specification](./spec.md) - User requirements and acceptance criteria
- [Implementation Plan](./plan.md) - Technical approach and architecture
- [Research Document](./research.md) - Data structure analysis and decisions
- [Data Model](./data-model.md) - Entity definitions and relationships
- [Type Contracts](./contracts/annual-rating.ts) - TypeScript interfaces

---

## Support

For questions or issues:

1. Check existing code comments in modified files
2. Review research document for data structure clarifications
3. Run unit tests to verify extraction logic: `npm run test:unit`
4. Run E2E tests to verify rendering: `npm run test:e2e`
