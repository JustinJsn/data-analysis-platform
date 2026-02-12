# Feature Specification: Export Headers Fix

**Feature Branch**: `002-export-headers-fix`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "优化导出当前页逻辑，无论年度/季度是否有绩效数据，表头都需要将默认逻辑中的表头信息展示出来，如果是空数据，则做空值处理，一定要展示默认逻辑的表头信息"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Complete Header Display in Export (Priority: P1)

When users export performance report data for a specific time range, they expect to see all column headers for the selected period (year/quarters), regardless of whether actual performance data exists for those periods. Currently, if a quarter has no data, its header column is omitted from the export, making it difficult to identify missing data and maintain consistent report structure.

**Why this priority**: This is critical for data analysis and reporting consistency. Users need to see the complete structure of the requested time range to identify gaps in performance data and maintain uniform report formats across different exports.

**Independent Test**: Can be fully tested by selecting a time range with some empty quarters, exporting the current page, and verifying that all expected quarter columns appear in the Excel file with empty values for missing data.

**Acceptance Scenarios**:

1. **Given** a query for 2024Q1-2024Q4 where only Q1 and Q3 have data, **When** user exports the current page, **Then** the Excel file contains columns for all four quarters (2024Q1, 2024Q2, 2024Q3, 2024Q4) with empty cells for Q2 and Q4
2. **Given** a query spanning multiple years with sparse data, **When** user exports the current page, **Then** all quarter columns for the selected time range appear in the export with consistent header ordering
3. **Given** an annual view query for years 2023-2025, **When** user exports the current page, **Then** all annual columns appear in the export regardless of whether each year has performance data
4. **Given** a query with no performance data for any period, **When** user exports the current page, **Then** the export contains all expected time period columns (based on query parameters) with empty data rows

---

### Edge Cases

- What happens when the query time range spans many years (e.g., 10+ years)? System should generate all year/quarter columns efficiently without performance degradation
- How does the system handle quarter columns when switching between quarterly and annual view modes? Headers should reflect the current view mode (quarters for quarterly, years for annual)
- What happens when exporting with no data at all (empty result set)? Export should contain header row with all expected time period columns
- How are column headers ordered when multiple years/quarters are selected? Chronological ordering (oldest to newest) should be maintained

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST include all time period columns (years or quarters) in the export based on the current query parameters, regardless of whether performance data exists for those periods
- **FR-002**: System MUST determine the expected header columns from the active query filter (startYear, endYear, startQuarter, endQuarter, queryLength, and view mode)
- **FR-003**: System MUST render empty string values ("") for time period cells where no performance data exists
- **FR-004**: System MUST maintain consistent column ordering (chronological order: earliest year/quarter to latest) across all exports
- **FR-005**: System MUST preserve all existing static columns (员工工号, 员工姓名, department levels, 入职日期, 职务, rating counts) in their current positions
- **FR-006**: System MUST apply this header logic to both batch export (current page) and full export operations
- **FR-007**: System MUST generate quarter columns in the format "YYYYQN" (e.g., "2024Q1", "2024Q2") for quarterly view
- **FR-008**: System MUST generate year columns in the format "YYYY" (e.g., "2024", "2025") for annual view

### Key Entities _(include if feature involves data)_

- **Query Parameters**: Defines the time range for the export - includes startYear, endYear, startQuarter, endQuarter, queryLength (number of periods to query), and current view mode (quarterly/annual)
- **Export Header Schema**: The complete set of column headers for the export, consisting of fixed columns (employee info, department hierarchy, rating counts) plus dynamic time period columns (generated from query parameters)
- **Business Query Record**: The data structure being exported, containing employee information, department hierarchy, rating statistics, and a dynamic set of time period properties with performance ratings

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of exports include all time period columns matching the current query filter range, regardless of data presence
- **SC-002**: Users can identify data gaps immediately by seeing empty columns in the expected time periods within the exported Excel file
- **SC-003**: Export processing time increases by less than 5% when generating complete header sets (maintaining current performance standards)
- **SC-004**: All exported files maintain consistent column structure when exporting the same time range multiple times, improving report reliability for data analysis workflows

## Assumptions

1. The query parameters (startYear, endYear, startQuarter, endQuarter, queryLength) accurately reflect the user's intended time range for the report
2. The current view mode (quarterly vs annual) is available in the export context to determine whether to generate quarter or year columns
3. The maximum time range users will query is reasonable (typically 1-10 years) and won't cause memory/performance issues when generating many columns
4. Quarter columns should only be generated when in quarterly view mode; annual columns when in annual view mode
5. The existing column ordering logic (static columns followed by time period columns) is the desired structure
6. Empty values in Excel should be represented as empty strings ("") rather than null or other placeholders
