/**
 * 季度时间工具函数
 */

import type { QuarterTime } from '@/types/performance-report';

/**
 * 季度智能推算算法
 *
 * 根据开始时间和查询长度（年数），计算结束时间
 * 公式：结束年份 = 开始年份 - 查询长度 + 1
 *
 * @param startQuarter 开始季度时间
 * @param queryLength 查询长度（年数，1-10）
 * @returns 结束季度时间
 *
 * @example
 * ```typescript
 * const startQuarter = { year: 2025, quarter: 3 };
 * const queryLength = 3;
 * const endQuarter = calculateEndQuarter(startQuarter, queryLength);
 * // 结果: { year: 2023, quarter: 3 }
 * ```
 */
export function calculateEndQuarter(
  startQuarter: QuarterTime,
  queryLength: number,
): QuarterTime {
  // 验证参数
  if (queryLength < 1 || queryLength > 10) {
    throw new Error('查询长度必须在 1-10 年之间');
  }

  if (startQuarter.quarter < 1 || startQuarter.quarter > 4) {
    throw new Error('季度必须在 1-4 之间');
  }

  // 计算结束年份
  const endYear = startQuarter.year - queryLength + 1;

  // 边界检查：确保结束年份不早于开始年份
  // 但实际上根据公式，如果 queryLength >= 1，endYear 应该总是 <= startQuarter.year
  if (endYear > startQuarter.year) {
    // 如果计算结果异常，返回开始时间
    return { year: startQuarter.year, quarter: startQuarter.quarter };
  }

  // 确保年份在合理范围内（可选验证）
  if (endYear < 2000 || endYear > 2100) {
    throw new Error('计算出的结束年份超出合理范围（2000-2100）');
  }

  return {
    year: endYear,
    quarter: startQuarter.quarter,
  };
}

/**
 * 季度时间转换为字符串
 *
 * @param quarter 季度时间
 * @returns 字符串格式，如 "2025-Q1"
 */
export function quarterToString(quarter: QuarterTime): string {
  return `${quarter.year}-Q${quarter.quarter}`;
}

/**
 * 字符串转换为季度时间
 *
 * @param str 字符串格式，如 "2025-Q1"
 * @returns 季度时间，如果格式不正确则返回 null
 */
export function stringToQuarter(str: string): QuarterTime | null {
  const match = str.match(/^(\d{4})-Q([1-4])$/);
  if (!match) {
    return null;
  }

  const year = parseInt(match[1], 10);
  const quarter = parseInt(match[2], 10) as 1 | 2 | 3 | 4;

  // 验证年份范围
  if (year < 2000 || year > 2100) {
    return null;
  }

  return { year, quarter };
}

/**
 * 验证季度时间是否有效
 *
 * @param quarter 季度时间
 * @returns 是否有效
 */
export function isValidQuarter(quarter: QuarterTime): boolean {
  return (
    Number.isInteger(quarter.year) &&
    quarter.year >= 2000 &&
    quarter.year <= 2100 &&
    Number.isInteger(quarter.quarter) &&
    quarter.quarter >= 1 &&
    quarter.quarter <= 4
  );
}
