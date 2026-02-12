/**
 * 绩效表格数据转换工具
 */

import type {
  PerformanceRecord,
  BusinessQueryRecord,
  AnnualColumn,
} from '@/types/performance-report';
import { parseDepartmentPath } from './transform';
import {
  getCurrentQuarter,
  getConsecutiveQuarters,
} from './quarter-calculator';

/**
 * 表格行数据（按员工分组）
 */
export interface PerformanceTableRow {
  /** 员工ID */
  employee_id: string;
  /** 员工工号 */
  employee_number: string;
  /** 员工姓名 */
  employee_name: string;
  /** 一级部门 */
  department_level1: string;
  /** 二级部门 */
  department_level2: string;
  /** 三级部门 */
  department_level3: string;
  /** 四级部门 */
  department_level4: string;
  /** 入职日期 */
  employment_date: string;
  /** 职务 */
  position: string;
  /** 绩效数据映射：年份-季度 -> 绩效评级 */
  performance_data: Record<string, string>;
  /** 绩效评级计数 */
  rating_counts: {
    S: number;
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

/**
 * 将绩效记录列表转换为表格行数据（按员工分组）
 *
 * @param records 绩效记录列表
 * @param employeeInfoMap 员工信息映射（employee_id -> { employment_date, position }）
 * @returns 表格行数据列表
 */
export function transformToTableRows(
  records: PerformanceRecord[],
  employeeInfoMap?: Map<
    string,
    { employment_date?: string; position?: string }
  >,
): PerformanceTableRow[] {
  // 按员工ID分组
  const employeeMap = new Map<string, PerformanceTableRow>();

  for (const record of records) {
    // 优先使用 employee_id，如果没有则使用 employee_user_id
    const employeeId = record.employee_id || record.employee_user_id;

    if (!employeeId) {
      continue;
    }

    // 获取或创建员工行数据
    let row = employeeMap.get(employeeId);
    if (!row) {
      // 使用 organization_full_name 作为部门路径，如果没有则使用 department_path
      const departmentPath =
        record.organization_full_name || record.department_path || '';
      const deptPath = parseDepartmentPath(departmentPath);
      const employeeInfo = employeeInfoMap?.get(employeeId) || {};

      row = {
        employee_id: employeeId,
        // 如果没有 employee_number，使用 employee_user_id 作为工号
        employee_number:
          record.employee_number || record.employee_user_id || '',
        employee_name: record.employee_name || '',
        department_level1: deptPath.level1,
        department_level2: deptPath.level2,
        department_level3: deptPath.level3,
        department_level4: deptPath.level4,
        employment_date: employeeInfo.employment_date || '',
        position: employeeInfo.position || '',
        performance_data: {},
        rating_counts: {
          S: 0,
          A: 0,
          B: 0,
          C: 0,
          D: 0,
        },
      };
      employeeMap.set(employeeId, row);
    }

    // 添加绩效数据
    const key = `${record.year}-${record.quarter}`;
    row.performance_data[key] = record.performance_rating;

    // 更新评级计数
    const rating = record.performance_rating?.toUpperCase();
    if (rating && ['S', 'A', 'B', 'C', 'D'].includes(rating)) {
      row.rating_counts[rating as 'S' | 'A' | 'B' | 'C' | 'D']++;
    }
  }

  return Array.from(employeeMap.values());
}

/**
 * 从查询参数中提取年份范围
 *
 * @param queryParams 查询参数
 * @param records 可选：绩效记录列表（用于从实际数据中提取年份范围）
 * @returns 年份数组（降序，如：[2025, 2024, 2023]）
 */
export function extractYearRange(
  queryParams: {
    start_year?: number;
    end_year?: number;
    start_year_quarter?: string;
    end_year_quarter?: string;
  },
  records?: PerformanceRecord[],
): number[] {
  let startYear: number | undefined;
  let endYear: number | undefined;

  // 从年份段查询参数获取
  if (queryParams.start_year && queryParams.end_year) {
    startYear = queryParams.start_year;
    endYear = queryParams.end_year;
  }
  // 从季度查询参数获取
  else if (queryParams.start_year_quarter && queryParams.end_year_quarter) {
    const startMatch = queryParams.start_year_quarter.match(/^(\d{4})-Q\d$/);
    const endMatch = queryParams.end_year_quarter.match(/^(\d{4})-Q\d$/);
    if (startMatch && endMatch && startMatch[1] && endMatch[1]) {
      startYear = parseInt(startMatch[1], 10);
      endYear = parseInt(endMatch[1], 10);
    }
  }

  // 如果查询参数中没有年份范围，尝试从实际数据中提取
  if ((!startYear || !endYear) && records && records.length > 0) {
    const years = records.map((r) => r.year).filter((y) => y != null);
    if (years.length > 0) {
      startYear = Math.min(...years);
      endYear = Math.max(...years);
    }
  }

  // 如果还是没有指定范围，使用默认范围（当前年份往前3年）
  if (!startYear || !endYear) {
    const currentYear = new Date().getFullYear();
    startYear = currentYear - 2;
    endYear = currentYear;
  }

  // 生成年份数组（降序）
  const years: number[] = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
}

/**
 * 获取指定年份的所有季度键
 *
 * @param year 年份
 * @returns 季度键数组，如：['2025-Q4', '2025-Q3', '2025-Q2', '2025-Q1']
 */
export function getQuarterKeys(year: number): string[] {
  return [`${year}-Q4`, `${year}-Q3`, `${year}-Q2`, `${year}-Q1`];
}

/**
 * 将 Business Query 响应数据转换为表格行数据
 *
 * @param records Business Query 响应记录列表
 * @returns 表格行数据列表
 */
export function transformBusinessQueryToTableRows(
  records: BusinessQueryRecord[],
): PerformanceTableRow[] {
  return records.map((record) => {
    // 提取季度数据（格式：2025Q3 -> 2025-Q3）
    const performanceData: Record<string, string> = {};

    // 遍历所有键，查找季度评级（格式：2025Q3, 2025Q2 等）
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

    // 提取年度数据（格式：year2025 -> 2025-年度）
    for (const key in record) {
      const yearMatch = key.match(/^year(\d{4})$/);
      if (yearMatch && yearMatch[1]) {
        const year = yearMatch[1];
        const yearField = record[key as `year${number}`];
        const annualRating = extractAnnualRating(yearField);
        // 存储空字符串用于 null（显示为 "-"）
        performanceData[`${year}-年度`] = annualRating || '';
      }
    }

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

/**
 * 从 Business Query 记录中提取年份范围
 * 优先从查询参数中提取，如果没有查询参数则从数据中提取
 *
 * @param queryParams 查询参数
 * @param records Business Query 记录列表（可选）
 * @returns 年份数组（降序，如：[2025, 2024, 2023]）
 */
export function extractYearRangeFromBusinessQuery(
  queryParams?: { start_year?: number; end_year?: number },
  records?: BusinessQueryRecord[],
): number[] {
  let startYear: number | undefined;
  let endYear: number | undefined;

  // 优先从查询参数中提取年份范围
  if (queryParams?.start_year && queryParams?.end_year) {
    startYear = queryParams.start_year;
    endYear = queryParams.end_year;
  }

  // 如果查询参数中没有年份范围，尝试从数据中提取
  if ((!startYear || !endYear) && records && records.length > 0) {
    const yearSet = new Set<number>();

    // 从季度键中提取年份（格式：2025Q3）
    for (const record of records) {
      for (const key in record) {
        const quarterMatch = key.match(/^(\d{4})Q([1-4])$/);
        if (quarterMatch && quarterMatch[1]) {
          const year = parseInt(quarterMatch[1], 10);
          yearSet.add(year);
        }
      }
    }

    // 从年度对象键中提取年份（格式：year2025）
    for (const record of records) {
      for (const key in record) {
        const yearMatch = key.match(/^year(\d{4})$/);
        if (yearMatch && yearMatch[1]) {
          const year = parseInt(yearMatch[1], 10);
          yearSet.add(year);
        }
      }
    }

    const years = Array.from(yearSet).sort((a, b) => a - b);
    if (years.length > 0) {
      startYear = years[0];
      endYear = years[years.length - 1];
    }
  }

  // 如果还是没有指定范围，使用默认范围（当前年份往前3年）
  if (!startYear || !endYear) {
    const currentYear = new Date().getFullYear();
    startYear = currentYear - 2;
    endYear = currentYear;
  }

  // 生成年份数组（降序）
  const years: number[] = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
}

/**
 * 提取季度显示范围
 *
 * @param queryParams 查询参数
 * @returns 季度数组（降序），每个元素为 { year: number, quarter: string }
 */
export function extractQuarterRange(queryParams?: {
  start_year?: number;
  end_year?: number;
  start_quarter?: string;
  end_quarter?: string;
}): { year: number; quarter: string }[] {
  // 如果有明确的季度范围（从季度选择器）
  if (
    queryParams?.start_quarter &&
    queryParams?.end_quarter &&
    queryParams?.start_year &&
    queryParams?.end_year
  ) {
    let startYear = queryParams.start_year;
    let endYear = queryParams.end_year;
    let startQ = parseInt(queryParams.start_quarter.replace('Q', ''), 10);
    let endQ = parseInt(queryParams.end_quarter.replace('Q', ''), 10);

    // 确定真正的开始和结束（确保 loop 逻辑正确）
    const startTimeValue = startYear * 10 + startQ;
    const endTimeValue = endYear * 10 + endQ;

    if (startTimeValue > endTimeValue) {
      // 交换，使 start 始终是较早的时间
      [startYear, endYear] = [endYear, startYear];
      [startQ, endQ] = [endQ, startQ];
    }

    const quarters: { year: number; quarter: string }[] = [];

    // 从结束时间往回推到开始时间（降序显示）
    let currYear = endYear;
    let currQ = endQ;

    while (
      currYear > startYear ||
      (currYear === startYear && currQ >= startQ)
    ) {
      quarters.push({ year: currYear, quarter: `Q${currQ}` });
      currQ--;
      if (currQ < 1) {
        currQ = 4;
        currYear--;
      }
      // 防止死循环
      if (quarters.length > 100) break;
    }

    return quarters;
  }

  // 如果只有年份范围
  if (queryParams?.start_year && queryParams?.end_year) {
    let startYear = queryParams.start_year;
    let endYear = queryParams.end_year;

    if (startYear > endYear) {
      [startYear, endYear] = [endYear, startYear];
    }

    const quarters: { year: number; quarter: string }[] = [];
    for (let year = endYear; year >= startYear; year--) {
      ['Q4', 'Q3', 'Q2', 'Q1'].forEach((q) => {
        quarters.push({ year, quarter: q });
      });
    }
    return quarters;
  }

  // 默认逻辑：从当前季度往前推 12 个连续季度
  const current = getCurrentQuarter();
  const consecutive = getConsecutiveQuarters(current, 12);

  return consecutive.map((q) => ({
    year: q.year,
    quarter: `Q${q.quarter}`,
  }));
}

/* ==================== 年度绩效相关工具函数 ==================== */

/**
 * 从 year 字段中提取年度绩效评级
 *
 * 支持三种格式:
 * - 直接字符串: "A"
 * - 嵌套对象: { rating: "A" } 或 { performance_rating: "A" }
 * - 空值: {}, null, undefined
 *
 * @param yearField - year2025/year2024 字段的值
 * @returns 绩效评级（S/A/B/C/D）或 null（无评级）
 *
 * @example
 * extractAnnualRating("A")                          → "A"
 * extractAnnualRating({ rating: "B" })              → "B"
 * extractAnnualRating({ performance_rating: "C" })  → "C"
 * extractAnnualRating({})                           → null
 * extractAnnualRating(null)                         → null
 * extractAnnualRating(undefined)                    → null
 */
export function extractAnnualRating(yearField: any): string | null {
  if (!yearField) return null;

  // 格式1: 直接字符串（预期格式）
  if (typeof yearField === 'string') {
    return yearField;
  }

  // 格式2: 嵌套对象（备用格式）
  if (typeof yearField === 'object') {
    return yearField.rating || yearField.performance_rating || null;
  }

  return null;
}

/**
 * 生成年度绩效列定义数组
 *
 * 过滤掉未来年份（> 当前年份 + 1），防止显示无意义的未来年度评级
 *
 * @param years - 年份数组（如 [2025, 2024, 2023]）
 * @returns 年度列定义数组
 *
 * @example
 * // 假设当前年份为 2026
 * extractAnnualColumns([2028, 2027, 2026, 2025, 2024])
 * → [
 *     { year: 2027, key: "2027-年度", title: "2027年度", ... },
 *     { year: 2026, key: "2026-年度", title: "2026年度", ... },
 *     { year: 2025, key: "2025-年度", title: "2025年度", ... },
 *     { year: 2024, key: "2024-年度", title: "2024年度", ... }
 *   ]
 */
export function extractAnnualColumns(years: number[]): AnnualColumn[] {
  // 过滤未来年份（最多显示到当前年份+1）
  const validYears = filterValidYears(years);

  return validYears.map((year) => ({
    year,
    key: `${year}-年度`,
    title: `${year}年度`,
    dataKey: `performance_data.${year}-年度`,
    width: 100,
    fixed: false,
    align: 'center' as const,
  }));
}

/**
 * 过滤年份到有效显示范围
 *
 * 移除超过 current year + 1 的年份，防止显示未来年度评级
 *
 * @param years - 年份数组
 * @returns 过滤后的年份数组
 *
 * @example
 * // 假设当前年份为 2026
 * filterValidYears([2028, 2027, 2026, 2025, 2024])
 * → [2027, 2026, 2025, 2024]
 */
export function filterValidYears(years: number[]): number[] {
  const currentYear = new Date().getFullYear();
  return years.filter((year) => year <= currentYear + 1);
}
