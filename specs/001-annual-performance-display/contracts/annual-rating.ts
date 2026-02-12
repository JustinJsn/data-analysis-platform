/**
 * Type contracts for Annual Performance Display feature
 *
 * This file defines TypeScript interfaces and types for annual performance ratings.
 * These contracts ensure type safety when extracting, transforming, and displaying
 * annual performance data alongside quarterly performance data.
 */

/**
 * Annual rating extraction result
 *
 * Represents an annual performance rating for a specific year after extraction
 * from the BusinessQueryRecord's year2025/year2024 fields.
 *
 * @example
 * { year: 2025, rating: "A" }      // Has annual rating
 * { year: 2024, rating: null }     // No annual rating yet
 */
export interface AnnualRatingData {
  /** The year of the annual rating (e.g., 2025, 2024) */
  year: number;

  /**
   * The performance rating (S/A/B/C/D) or null if no rating exists
   *
   * Valid values: "S", "A", "B", "C", "D", null
   * null represents: no rating, empty object {}, undefined, or missing field
   */
  rating: string | null;
}

/**
 * Annual column definition for el-table-v2
 *
 * Defines the structure of an annual performance column in the performance report table.
 * This parallels the quarterly column structure but uses "年度" suffix instead of "Q1/Q2/Q3/Q4".
 *
 * @example
 * {
 *   year: 2025,
 *   key: "2025-年度",
 *   title: "2025年度",
 *   dataKey: "performance_data.2025-年度",
 *   width: 100,
 *   fixed: false,
 *   align: 'center'
 * }
 */
export interface AnnualColumn {
  /** The year this column represents (e.g., 2025) */
  year: number;

  /**
   * Unique column identifier for el-table-v2
   * Format: "${year}-年度" (e.g., "2025-年度")
   * Matches quarterly pattern: "${year}-Q${quarter}" (e.g., "2025-Q4")
   */
  key: string;

  /**
   * Column header text displayed to users
   * Format: "${year}年度" (e.g., "2025年度")
   */
  title: string;

  /**
   * Path to data in PerformanceTableRow object
   * Format: "performance_data.${year}-年度"
   * Used by el-table-v2 to access cell data
   */
  dataKey: string;

  /** Column width in pixels (typically 100px) */
  width: number;

  /** Whether column is fixed during horizontal scroll (typically false) */
  fixed: boolean;

  /** Text alignment within cells (always 'center' for ratings) */
  align: 'center';
}

/**
 * Extended BusinessQueryRecord type helper
 *
 * Helper type to represent the structure of year fields in BusinessQueryRecord.
 * The actual BusinessQueryRecord interface uses indexed signatures:
 * [key: `year${number}`]: Record<string, any> | undefined
 *
 * This helper clarifies the three possible forms:
 */
export type YearFieldValue =
  | string // Direct: "A"
  | { rating?: string; performance_rating?: string } // Nested: { rating: "A" }
  | {} // Empty: {}
  | null // Null
  | undefined; // Undefined

/**
 * Annual rating extraction function signature
 *
 * Function that extracts the annual rating from a year field value.
 * Handles multiple formats: direct string, nested object, empty variants.
 *
 * @param yearField - The value of a year field (e.g., record.year2025)
 * @returns The rating string (S/A/B/C/D) or null if no rating exists
 *
 * @example
 * extractAnnualRating("A")                          → "A"
 * extractAnnualRating({ rating: "B" })              → "B"
 * extractAnnualRating({})                           → null
 * extractAnnualRating(null)                         → null
 * extractAnnualRating(undefined)                    → null
 */
export type ExtractAnnualRatingFn = (
  yearField: YearFieldValue,
) => string | null;

/**
 * Annual column generation function signature
 *
 * Function that generates annual column definitions for a list of years.
 * Filters out future years and creates AnnualColumn objects.
 *
 * @param years - Array of years to generate columns for (e.g., [2025, 2024, 2023])
 * @returns Array of annual column definitions
 *
 * @example
 * extractAnnualColumns([2025, 2024]) → [
 *   { year: 2025, key: "2025-年度", title: "2025年度", ... },
 *   { year: 2024, key: "2024-年度", title: "2024年度", ... }
 * ]
 */
export type ExtractAnnualColumnsFn = (years: number[]) => AnnualColumn[];

/**
 * Performance data map extended with annual keys
 *
 * The performance_data field in PerformanceTableRow is a map of performance ratings.
 * This type documents the key formats:
 *
 * Quarterly keys: "${year}-Q${quarter}" (e.g., "2025-Q4")
 * Annual keys: "${year}-年度" (e.g., "2025-年度")
 *
 * Values:
 * - Non-empty string: Rating (S/A/B/C/D)
 * - Empty string: No rating (displays as "-")
 */
export type PerformanceDataMap = Record<string, string>;

/**
 * Validation: Check if a value is a valid performance rating
 *
 * @param rating - Value to validate
 * @returns True if rating is valid (S/A/B/C/D or empty)
 *
 * @example
 * isValidRating("A")        → true
 * isValidRating("S")        → true
 * isValidRating(null)       → true (empty is valid)
 * isValidRating("X")        → false
 * isValidRating(123)        → false
 */
export function isValidRating(rating: any): rating is string | null {
  if (!rating) return true; // null/undefined/empty is valid (no rating)
  if (typeof rating !== 'string') return false;
  return ['S', 'A', 'B', 'C', 'D'].includes(rating.toUpperCase());
}

/**
 * Validation: Filter years to valid display range
 *
 * Removes years beyond current year + 1 to prevent displaying future annual ratings.
 *
 * @param years - Array of years to filter
 * @returns Filtered array of valid years
 *
 * @example
 * // Assuming current year is 2026
 * filterValidYears([2028, 2027, 2026, 2025, 2024]) → [2027, 2026, 2025, 2024]
 */
export function filterValidYears(years: number[]): number[] {
  const currentYear = new Date().getFullYear();
  return years.filter((year) => year <= currentYear + 1);
}

/**
 * Constants for annual performance display
 */
export const ANNUAL_COLUMN_CONSTANTS = {
  /** Suffix for annual column keys (e.g., "2025-年度") */
  KEY_SUFFIX: '年度',

  /** Suffix for annual column titles (e.g., "2025年度") */
  TITLE_SUFFIX: '年度',

  /** Width of annual columns in pixels */
  COLUMN_WIDTH: 100,

  /** Empty state display character */
  EMPTY_INDICATOR: '-',

  /** Valid rating values */
  VALID_RATINGS: ['S', 'A', 'B', 'C', 'D'] as const,
} as const;

/**
 * Type for valid rating values
 */
export type ValidRating =
  (typeof ANNUAL_COLUMN_CONSTANTS.VALID_RATINGS)[number];
