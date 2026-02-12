/**
 * 时间范围转换工具函数
 */

import type { QuarterTime, TimeRange } from '@/types/performance-report';

/**
 * 季度时间转换为日期范围
 *
 * @param quarter 季度时间
 * @returns 时间范围（开始和结束日期）
 *
 * @example
 * ```typescript
 * const quarter = { year: 2025, quarter: 1 };
 * const dateRange = quarterToDateRange(quarter);
 * // 结果: {
 * //   start: new Date(2025, 0, 1, 0, 0, 0, 0),
 * //   end: new Date(2025, 2, 31, 23, 59, 59, 999)
 * // }
 * ```
 */
export function quarterToDateRange(quarter: QuarterTime): TimeRange {
  const quarterMonths = {
    1: { start: 0, end: 2 }, // Q1: 1-3月 (0-2 是月份索引)
    2: { start: 3, end: 5 }, // Q2: 4-6月
    3: { start: 6, end: 8 }, // Q3: 7-9月
    4: { start: 9, end: 11 }, // Q4: 10-12月
  };

  const { start: startMonth, end: endMonth } = quarterMonths[quarter.quarter];

  return {
    start: new Date(quarter.year, startMonth, 1, 0, 0, 0, 0),
    // end: 季度最后一天的最后时刻
    // new Date(year, month + 1, 0) 会得到上个月的最后一天
    end: new Date(quarter.year, endMonth + 1, 0, 23, 59, 59, 999),
  };
}

/**
 * 年份段转换为日期范围
 *
 * @param startYear 开始年份
 * @param endYear 结束年份
 * @returns 时间范围（开始和结束日期）
 *
 * @example
 * ```typescript
 * const dateRange = yearRangeToDateRange(2025, 2025);
 * // 结果: {
 * //   start: new Date(2025, 0, 1, 0, 0, 0, 0),
 * //   end: new Date(2025, 11, 31, 23, 59, 59, 999)
 * // }
 * ```
 */
export function yearRangeToDateRange(
  startYear: number,
  endYear: number,
): TimeRange {
  // 先验证单个参数的范围
  if (startYear < 2000 || startYear > 2100) {
    throw new Error('开始年份必须在 2000-2100 之间');
  }

  if (endYear < 2000 || endYear > 2100) {
    throw new Error('结束年份必须在 2000-2100 之间');
  }

  // 再验证参数之间的关系
  if (startYear > endYear) {
    throw new Error('开始年份不能大于结束年份');
  }

  return {
    start: new Date(startYear, 0, 1, 0, 0, 0, 0), // 1月1日 00:00:00
    end: new Date(endYear, 11, 31, 23, 59, 59, 999), // 12月31日 23:59:59
  };
}

/**
 * 格式化日期范围字符串
 *
 * @param dateRange 时间范围
 * @returns 格式化的字符串，如 "2025-01-01 ~ 2025-12-31"
 */
export function formatDateRange(dateRange: TimeRange): string {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return `${formatDate(dateRange.start)} ~ ${formatDate(dateRange.end)}`;
}
