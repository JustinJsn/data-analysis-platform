# Data Model: Annual Performance Display

**Feature**: Annual Performance Display
**Phase**: 1 (Design & Contracts)
**Date**: 2026-02-11

## Overview

This document defines the data structures, relationships, and validation rules for annual performance rating columns. Annual ratings are stored in `year2025`, `year2024` fields of the BusinessQueryRecord and displayed alongside quarterly performance data.

---

## Entities

### 1. AnnualRatingData

Represents an extracted annual performance rating for a specific year.

**Fields**:

- `year: number` - The year of the annual rating (e.g., 2025, 2024)
- `rating: string | null` - The performance rating (S/A/B/C/D) or null if no rating exists

**Example**:

```typescript
{ year: 2025, rating: "A" }
{ year: 2024, rating: null } // No annual rating for 2024
```

**Purpose**: Intermediate data structure used during extraction from BusinessQueryRecord

---

### 2. AnnualColumn

Defines an annual performance column for the el-table-v2 component.

**Fields**:

- `year: number` - The year this column represents (e.g., 2025)
- `key: string` - Unique column identifier (format: `"${year}-年度"`, e.g., `"2025-年度"`)
- `title: string` - Column header text (format: `"${year}年度"`, e.g., `"2025年度"`)
- `dataKey: string` - Path to data in row object (e.g., `"performance_data.2025-年度"`)
- `width: number` - Column width in pixels (100px)
- `fixed: boolean` - Whether column is fixed during horizontal scroll (false)
- `align: 'center'` - Text alignment within cells

**Example**:

```typescript
{
  year: 2025,
  key: "2025-年度",
  title: "2025年度",
  dataKey: "performance_data.2025-年度",
  width: 100,
  fixed: false,
  align: 'center'
}
```

**Purpose**: Column definition for el-table-v2, parallels quarterly column structure

---

### 3. BusinessQueryRecord (Extended)

Existing API response record extended to include annual rating data.

**Existing Fields** (relevant to annual ratings):

- `employeeNo: string` - Employee number
- `name: string` - Employee name
- `[key: \`year${number}\`]: Record<string, any> | undefined`- Annual data fields (e.g.,`year2025`, `year2024`)
- `[key: \`${number}Q${1|2|3|4}\`]: string | undefined`- Quarterly ratings (e.g.,`2025Q3: "B"`)

**Annual Field Structure**:

The `year2025`, `year2024` fields can have three forms:

**Form 1: Direct String (Primary)**

```typescript
year2025: "A"  // Direct rating value
```

**Form 2: Nested Object (Fallback)**

```typescript
year2025: {
  rating: "A",
  performance_rating: "A"
  // Other metadata may exist
}
```

**Form 3: Empty/Null (No Data)**

```typescript
year2025: {}           // Empty object
year2024: null         // Null
year2023: undefined    // Undefined
// Or field doesn't exist
```

**Extraction Logic**:

- Check if field is string → use directly
- Check if field is object → extract `rating` or `performance_rating` property
- Otherwise → treat as null (no rating)

---

### 4. PerformanceTableRow (Extended)

Existing table row structure extended to include annual rating data in the `performance_data` map.

**Existing Fields**:

- `employee_id: string`
- `employee_number: string`
- `employee_name: string`
- `department_level1: string`
- `department_level2: string`
- `department_level3: string`
- `department_level4: string`
- `employment_date: string`
- `position: string`
- `performance_data: Record<string, string>` - **Extended with annual keys**
- `rating_counts: { S, A, B, C, D }`

**Annual Data Keys in `performance_data`**:

**Quarterly keys** (existing):

```typescript
"2025-Q4": "B"
"2025-Q3": "A"
"2024-Q4": "C"
```

**Annual keys** (NEW):

```typescript
"2025-年度": "A"  // Annual rating for 2025
"2024-年度": "B"  // Annual rating for 2024
"2023-年度": ""   // Empty annual rating
```

**Key format**: `"${year}-年度"`

**Value format**:

- Valid ratings: "S", "A", "B", "C", "D"
- Empty state: `""` (empty string, displayed as "-")

---

## Relationships

### Employee → Annual Ratings

**Cardinality**: One-to-Many

- Each employee (BusinessQueryRecord) can have 0 to N annual ratings
- Each annual rating belongs to exactly one employee

**Mapping**:

```typescript
BusinessQueryRecord
├─ year2025: "A"     → AnnualRatingData { year: 2025, rating: "A" }
├─ year2024: "B"     → AnnualRatingData { year: 2024, rating: "B" }
└─ year2023: {}      → AnnualRatingData { year: 2023, rating: null }
```

### Annual Ratings → Table Columns

**Cardinality**: Many-to-Many

- Multiple employees share the same annual columns (by year)
- Each annual column displays ratings for all employees

**Column Generation**:

```typescript
Years [2025, 2024, 2023]
  ↓
AnnualColumns [
  { year: 2025, key: "2025-年度", title: "2025年度" },
  { year: 2024, key: "2024-年度", title: "2024年度" },
  { year: 2023, key: "2023-年度", title: "2023年度" }
]
```

### Annual Ratings → Quarterly Ratings

**Relationship**: Independent

- Annual ratings exist independently from quarterly ratings
- An employee can have:
  - Only quarterly ratings (no annual)
  - Only annual ratings (no quarterly)
  - Both annual and quarterly ratings
  - Neither (new employee, no evaluations)

**Important**: Annual ratings do **NOT** affect rating count columns

- `ratingCountS`, `ratingCountA`, etc. count only quarterly ratings
- Annual ratings are displayed but not aggregated into counts

---

## Validation Rules

### Rule 1: Annual Rating Values

**Constraint**: Annual rating must be one of:

- Valid ratings: `"S"`, `"A"`, `"B"`, `"C"`, `"D"`
- Empty state: `null`, `undefined`, `""` (empty string), `{}` (empty object)

**Validation**:

```typescript
function isValidAnnualRating(rating: any): boolean {
  if (!rating) return true; // null/undefined/empty is valid (no rating)
  if (typeof rating !== 'string') return false;
  return ['S', 'A', 'B', 'C', 'D'].includes(rating.toUpperCase());
}
```

**Action on invalid**: Treat as null (display as "-")

---

### Rule 2: Year Range Filtering

**Constraint**: Only display annual columns for years within the valid range

**Valid range**:

- Minimum: Earliest year in quarterly data
- Maximum: `currentYear + 1` (filter out far-future years)

**Rationale**: Prevent displaying meaningless future annual ratings (e.g., 2030年度 when current year is 2026)

**Implementation**:

```typescript
function filterValidYears(years: number[]): number[] {
  const currentYear = new Date().getFullYear();
  return years.filter(year => year <= currentYear + 1);
}
```

---

### Rule 3: Annual Column Positioning

**Constraint**: Annual columns must appear BEFORE quarterly columns for the same year

**Order**:

```
2025年度 → 2025Q4 → 2025Q3 → 2025Q2 → 2025Q1 → 2024年度 → 2024Q4 → ...
```

**Validation**: Column generation algorithm must insert annual column before quarterly loop

---

### Rule 4: Empty State Consistency

**Constraint**: All empty variants must render identically

**Empty variants**:

- `year2025: {}`
- `year2025: null`
- `year2025: undefined`
- `year2025` field missing
- `year2025: { rating: null }`

**Required rendering**: `<span>-</span>` (plain dash, no tag)

---

### Rule 5: Rating Count Exclusion

**Constraint**: Annual ratings must NOT be added to rating count columns

**Affected fields** (unchanged):

- `ratingCountS`
- `ratingCountA`
- `ratingCountB`
- `ratingCountC`
- `ratingCountD`

**Rationale**: These counts represent quarterly evaluations only. Annual ratings are summary metrics, not additional evaluations.

---

## State Transitions

Annual ratings have simple state transitions based on evaluation cycles:

```
[No Rating] (year2025: {})
    ↓
[Pending Evaluation] (year in progress, no annual rating finalized)
    ↓
[Rated] (year2025: "A")
```

**Notes**:

- No edits or updates within the frontend (read-only display)
- State transitions happen in backend evaluation system
- Frontend only reflects current state from API

---

## Data Flow

### 1. API Response → Table Data

```typescript
// API returns
{
  employeeNo: "1004674",
  year2025: {},        // Empty: no annual rating yet
  year2024: "A",       // Direct: annual rating exists
  year2023: { rating: "B" }, // Nested: annual rating exists
  2025Q4: "B",
  2025Q3: "B"
}

// Transform to table row
{
  employee_number: "1004674",
  performance_data: {
    "2025-年度": "",      // Empty object → empty string
    "2024-年度": "A",     // Direct string → direct
    "2023-年度": "B",     // Nested object → extracted
    "2025-Q4": "B",
    "2025-Q3": "B"
  }
}
```

### 2. Table Data → Column Rendering

```typescript
// Column definition
{
  key: "2025-年度",
  title: "2025年度",
  dataKey: "performance_data.2025-年度"
}

// Cell rendering
rowData.performance_data["2025-年度"]
  → "" (empty) → <span>-</span>
  → "A" (rated) → <ElTag type="success">A</ElTag>
```

### 3. Table Columns → Export

```typescript
// Export iterates over columns
columns.forEach(col => {
  if (col.key.endsWith('-年度')) {
    // Annual column
    exportRow[col.title] = rowData.performance_data[col.key] || '';
  }
})

// CSV output
"工号","姓名","2025年度","2025Q4","2025Q3",...
"1004674","黄美霞","","B","B",...
```

---

## Implementation Checklist

### Type Definitions

- [ ] Add `AnnualRatingData` interface to `src/types/performance-report.ts`
- [ ] Add `AnnualColumn` interface to `src/types/performance-report.ts`
- [ ] Document `year${number}` field structure in comments

### Utility Functions

- [ ] Implement `extractAnnualRating(yearField: any): string | null` in `src/utils/performance-table.ts`
- [ ] Implement `extractAnnualColumns(years: number[]): AnnualColumn[]` in `src/utils/performance-table.ts`
- [ ] Modify `transformBusinessQueryToTableRows()` to extract annual data
- [ ] Add year filtering logic to column generation

### Component Integration

- [ ] Extend `columns` computed property in `PerformanceReportTable.vue`
- [ ] Insert annual columns before quarterly columns
- [ ] Reuse `getRatingTagType()` for annual rating colors
- [ ] Verify empty state renders as "-"

### Testing

- [ ] Unit test: Extract annual rating from direct string
- [ ] Unit test: Extract annual rating from nested object
- [ ] Unit test: Handle empty object as null
- [ ] Unit test: Column generation order (annual before quarterly)
- [ ] Unit test: Year range filtering
- [ ] E2E test: Annual columns appear with correct headers
- [ ] E2E test: Empty annual data shows "-"
- [ ] E2E test: Annual ratings display with colored tags
- [ ] E2E test: Export includes annual columns

---

## Summary

**Key Entities**:

1. AnnualRatingData (extraction result)
2. AnnualColumn (table column definition)
3. BusinessQueryRecord (API response, extended)
4. PerformanceTableRow (table data, extended)

**Key Relationships**:

- Employee → Annual Ratings (1:N)
- Annual Ratings → Table Columns (N:N)
- Annual Ratings ⊥ Rating Counts (independent)

**Key Validations**:

- Valid rating values (S/A/B/C/D or null)
- Year range filtering (≤ current + 1)
- Column positioning (annual before quarterly)
- Empty state consistency (all variants → "-")
- Rating count exclusion (don't count annual)

**Data Flow**: API Response → Transform → Table Row → Column Render → Export
