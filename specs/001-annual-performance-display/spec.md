# Feature Specification: Annual Performance Display

**Feature Branch**: `001-annual-performance-display`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "增加年度绩效的展示，现在只展示了季度的绩效，返回数据会包含年度绩效的数据，存放于 year2025/year2024，不管是否有数据，都需要在页面中进行展示做空数据展示处理"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Annual Performance Summary (Priority: P1)

A manager needs to review employee performance at an annual level to understand year-over-year trends and make decisions about promotions, bonuses, and development plans. Currently, they can only view quarterly performance breakdowns, but need to see the overall annual ratings to get a complete picture.

**Why this priority**: This is the core value of the feature - enabling users to see annual performance data that already exists in the system but is not yet displayed. Without this, users cannot access critical year-level performance information.

**Independent Test**: Can be fully tested by querying performance data for a specific employee or department and verifying that annual rating columns (2025年度, 2024年度) appear in the table alongside quarterly columns, showing the correct annual ratings or empty state indicators when no data exists.

**Acceptance Scenarios**:

1. **Given** a user is viewing the performance report query page, **When** they load performance data for employees with both quarterly and annual ratings, **Then** the table displays both quarterly columns (2025Q3, 2025Q2, etc.) and annual columns (2025年度, 2024年度) with the correct ratings shown as colored tags
2. **Given** a user is viewing performance data, **When** an employee has annual ratings for 2025 and 2024 stored in year2025 and year2024 fields, **Then** these annual ratings are displayed in dedicated annual columns positioned appropriately within the table
3. **Given** a user exports performance data, **When** they click the export button, **Then** the exported file includes both quarterly and annual performance columns with all data properly formatted

---

### User Story 2 - Handle Missing Annual Data Gracefully (Priority: P2)

Users need to view performance reports even when some employees lack annual performance data (new employees, incomplete evaluations, etc.). The system should clearly indicate when annual data is missing without breaking the user experience.

**Why this priority**: Essential for usability and data integrity. Users need confidence that missing data is intentional (not evaluated yet) rather than a system error. This prevents confusion and support requests.

**Independent Test**: Can be tested independently by querying employees with various data completeness scenarios (some with only quarterly data, some with only annual data, some with both, some with neither) and verifying appropriate empty state indicators appear for missing data.

**Acceptance Scenarios**:

1. **Given** an employee has quarterly ratings but no annual rating for a specific year, **When** viewing their performance record, **Then** the annual column for that year displays a dash "-" or appropriate empty indicator
2. **Given** an employee has no performance data at all for a year, **When** viewing their performance record, **Then** both quarterly and annual columns for that year display empty indicators consistently
3. **Given** a department with mixed data completeness, **When** viewing the department's performance report, **Then** the table renders all columns (quarterly and annual) for the time range, with empty indicators where data is missing, without layout shifts or errors

---

### User Story 3 - Column Organization and Visual Hierarchy (Priority: P3)

Users need to easily distinguish between quarterly and annual performance data when viewing reports with many columns. Annual columns should be visually organized to make year-level summaries easy to identify at a glance.

**Why this priority**: Improves usability and reduces cognitive load when scanning large performance tables. While not blocking core functionality, it significantly enhances the user experience for complex reports.

**Independent Test**: Can be tested by loading a multi-year performance report and verifying that annual columns are positioned logically (e.g., at the end of each year's quarterly columns or in a dedicated section), with clear visual differentiation through headers or styling.

**Acceptance Scenarios**:

1. **Given** a performance table with multiple years of data, **When** the table renders, **Then** annual columns are positioned logically relative to quarterly columns (either grouped by year or in a summary section)
2. **Given** a user is scrolling through a wide performance table, **When** they view the column headers, **Then** annual columns have distinct headers (e.g., "2025年度" vs "2025Q1") that clearly indicate annual vs quarterly data
3. **Given** a user is viewing both quarterly and annual ratings, **When** comparing an employee's performance, **Then** the visual styling (tags, colors) is consistent between quarterly and annual ratings for the same rating level

---

### Edge Cases

- What happens when the year2025 or year2024 field exists in the API response but contains null, undefined, or an empty object?
- How does the system handle scenarios where year fields exist for future years (e.g., year2026) that shouldn't be displayed yet?
- What happens when an employee has annual ratings but no quarterly ratings for the same year?
- How does the table handle very wide layouts when displaying many years of both quarterly and annual data (horizontal scrolling, fixed columns)?
- What happens when exporting large datasets with both quarterly and annual columns - does the export handle the additional columns without performance degradation?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display annual performance rating columns in the performance report table for years that have quarterly data displayed
- **FR-002**: System MUST extract annual performance ratings from the year2025 and year2024 fields in the BusinessQueryRecord API response
- **FR-003**: System MUST display annual rating columns with headers that clearly distinguish them from quarterly columns (e.g., "2025年度" for annual vs "2025Q3" for quarterly)
- **FR-004**: System MUST render annual ratings using the same colored tag system as quarterly ratings (S, A, B, C, D ratings with appropriate colors)
- **FR-005**: System MUST display a dash "-" or consistent empty indicator in annual columns when no annual rating data exists for an employee-year combination
- **FR-006**: System MUST handle cases where year2025/year2024 fields are null, undefined, or empty objects by displaying the empty state indicator
- **FR-007**: System MUST include annual performance columns in the data export functionality alongside quarterly columns
- **FR-008**: System MUST position annual columns in a logical order within the table (grouped with corresponding year's quarterly data or in a summary section)
- **FR-009**: System MUST dynamically determine which annual columns to display based on the year range of quarterly data being shown
- **FR-010**: System MUST maintain table layout stability and prevent horizontal overflow issues when adding annual columns to existing quarterly columns

### Key Entities

- **Annual Performance Rating**: A year-level performance assessment stored in yearXXXX fields (e.g., year2025, year2024) in the BusinessQueryRecord. Contains the overall rating (S/A/B/C/D) for an employee's performance across the entire year. Relates to the employee and year, exists independently from quarterly ratings.

- **BusinessQueryRecord (Extended)**: The existing employee performance data structure that includes both quarterly ratings (via dynamic `${year}Q${quarter}` fields) and annual ratings (via `year${year}` fields). The annual fields may contain nested objects with rating information or directly contain rating values.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view annual performance ratings for all years that have quarterly data displayed in the performance report table
- **SC-002**: Annual performance columns display correctly for 100% of employee records, showing either valid ratings or empty state indicators without rendering errors
- **SC-003**: Users can export performance reports that include both quarterly and annual columns with all data properly formatted
- **SC-004**: Table layout remains stable and usable when annual columns are added, with no unexpected horizontal scrolling beyond standard behavior for wide tables
- **SC-005**: Annual ratings use consistent visual styling (colored tags matching quarterly rating colors) so users can instantly recognize performance levels

## Dependencies

- The API endpoint `/api/v1/performance-reports/business-query` must continue to return year2025 and year2024 fields in the BusinessQueryRecord response structure
- The existing quarterly performance display logic in `PerformanceReportTable.vue` must remain functional
- The table transformation utilities in `src/utils/performance-table.ts` need to be extended to handle annual data extraction

## Assumptions

- Annual performance ratings use the same rating scale as quarterly ratings (S, A, B, C, D)
- The year2025/year2024 fields in the API response contain either a rating value directly or a nested object with a rating property (transformation logic will need to handle both cases)
- Annual columns should use the year suffix "年度" to distinguish from quarterly columns (e.g., "2025年度" for annual)
- Annual performance data does not affect the existing rating count columns (获得S次数, etc.), which continue to count only quarterly ratings
- The empty state indicator for missing annual data should match the existing pattern used for missing quarterly data (dash "-")
- Annual columns should be displayed for the same year range as quarterly columns (e.g., if showing 2024Q1-2025Q4, also show 2024年度 and 2025年度)

## Out of Scope

- Modifying how annual performance ratings are calculated or stored in the backend
- Adding filtering or sorting capabilities specifically for annual ratings (will inherit from existing table functionality)
- Creating separate views or pages for annual-only performance reports
- Adding new rating count columns for annual ratings (only quarterly counts are displayed)
- Implementing drill-down functionality to see quarterly breakdown from annual summary
- Modifying the API response structure or adding new API endpoints
- Adding annual performance data entry or editing capabilities
