/**
 * 绩效表格数据转换工具
 */

import type {
  PerformanceRecord,
  BusinessQueryRecord,
} from '@/types/performance-report';
import { parseDepartmentPath } from './transform';

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
      if (quarterMatch) {
        const year = quarterMatch[1];
        const quarter = `Q${quarterMatch[2]}`;
        const rating = record[key as `${number}Q${1 | 2 | 3 | 4}`];
        if (rating && typeof rating === 'string') {
          performanceData[`${year}-${quarter}`] = rating;
        }
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
        if (quarterMatch) {
          const year = parseInt(quarterMatch[1], 10);
          yearSet.add(year);
        }
      }
    }

    // 从年度对象键中提取年份（格式：year2025）
    for (const record of records) {
      for (const key in record) {
        const yearMatch = key.match(/^year(\d{4})$/);
        if (yearMatch) {
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
