/**
 * 导出工具函数
 */

import * as XLSX from 'xlsx';
import type {
  PerformanceRecord,
  BusinessQueryRecord,
} from '@/types/performance-report';

/**
 * Time range parameters for export
 */
export interface ExportTimeRangeParams {
  /** Starting year (2000-2100) */
  start_year: number;
  /** Ending year (2000-2100) */
  end_year: number;
  /** Optional starting quarter (default: Q1) */
  start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** Optional ending quarter (default: Q4) */
  end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

/**
 * Generate complete list of time period columns for a query range
 * Includes both annual columns and quarterly columns in the correct order:
 * For each year: annual column, then Q4, Q3, Q2, Q1 (quarters in descending order)
 *
 * @example
 * generateTimeRangeColumns({
 *   start_year: 2023,
 *   end_year: 2025,
 *   start_quarter: 'Q2',
 *   end_quarter: 'Q3'
 * })
 * // Returns: ['2023年度', '2023Q4', '2023Q3', '2023Q2', '2024年度', '2024Q4', ..., '2025年度', '2025Q3', '2025Q2']
 */
export function generateTimeRangeColumns(
  params: ExportTimeRangeParams,
): string[] {
  const columns: string[] = [];
  const { start_year, end_year } = params;

  // Default to full year if quarters not specified
  const start_quarter = params.start_quarter || 'Q1';
  const end_quarter = params.end_quarter || 'Q4';

  // Convert quarter strings to numbers
  const quarterToNum: Record<string, number> = {
    Q1: 1,
    Q2: 2,
    Q3: 3,
    Q4: 4,
  };
  const startQ = quarterToNum[start_quarter];
  const endQ = quarterToNum[end_quarter];

  // Generate columns for each year (ascending order)
  for (let year = start_year; year <= end_year; year++) {
    // Add annual column first
    columns.push(`${year}年度`);

    // Determine which quarters to include for this year
    const firstQuarter = year === start_year ? startQ : 1;
    const lastQuarter = year === end_year ? endQ : 4;

    // Add quarterly columns in descending order (Q4, Q3, Q2, Q1)
    for (let quarter = 4; quarter >= 1; quarter--) {
      // Only include quarters within the specified range for this year
      if (quarter >= firstQuarter && quarter <= lastQuarter) {
        columns.push(`${year}Q${quarter}`);
      }
    }
  }

  return columns;
}

/**
 * 导出数据到 Excel 文件
 *
 * @param data 要导出的数据数组
 * @param filename 文件名（不含扩展名）
 * @param format 导出格式 ('xlsx' | 'xls')，默认为 'xlsx'
 * @returns Promise<void>
 */
export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string = '导出数据',
  format: 'xlsx' | 'xls' = 'xlsx',
): Promise<void> {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 将数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 生成 Excel 文件并下载
    const excelBuffer = XLSX.write(workbook, {
      bookType: format,
      type: 'array',
    });

    // 根据格式设置 MIME 类型
    const mimeType =
      format === 'xls'
        ? 'application/vnd.ms-excel'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // 创建 Blob 并下载
    const blob = new Blob([excelBuffer], {
      type: mimeType,
    });

    downloadBlob(blob, `${filename}.${format}`);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`导出 Excel 失败: ${err.message}`);
  }
}

/**
 * 导出数据到 CSV 文件
 *
 * @param data 要导出的数据数组
 * @param filename 文件名（不含扩展名）
 * @returns Promise<void>
 */
export async function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string = '导出数据',
): Promise<void> {
  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 将数据转换为工作表
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 生成 CSV 字符串
    const csvString = XLSX.utils.sheet_to_csv(worksheet);

    // 添加 BOM 以支持中文（UTF-8 with BOM）
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvString], {
      type: 'text/csv;charset=utf-8;',
    });

    downloadBlob(blob, `${filename}.csv`);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`导出 CSV 失败: ${err.message}`);
  }
}

/**
 * 将 CSV Blob 转换为 Excel Blob
 *
 * @param csvBlob CSV 文件的 Blob 对象
 * @param format 目标格式 ('xlsx' | 'xls')，默认为 'xlsx'
 * @returns Excel 文件的 Blob 对象
 */
export async function convertCsvToExcel(
  csvBlob: Blob,
  format: 'xlsx' | 'xls' = 'xlsx',
): Promise<Blob> {
  try {
    // 读取 CSV 文本
    const csvText = await csvBlob.text();

    // 使用 XLSX 库直接读取 CSV（自动处理 BOM、引号、转义等）
    let workbook = XLSX.read(csvText, {
      type: 'string',
      codepage: 65001, // UTF-8
    });

    // 如果工作簿为空，尝试手动解析
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      // 使用 sheet_to_json 和 json_to_sheet 的方式
      const lines = csvText.split('\n').filter((line) => line.trim());
      if (lines.length === 0) {
        throw new Error('CSV 文件为空');
      }

      // 解析 CSV 行
      const rows = lines.map((line) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        return result;
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet1');
      workbook = newWorkbook;
    }

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: format,
      type: 'array',
    });

    // 根据格式设置 MIME 类型
    const mimeType =
      format === 'xls'
        ? 'application/vnd.ms-excel'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    return new Blob([excelBuffer], { type: mimeType });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`CSV 转 Excel 失败: ${err.message}`);
  }
}

/**
 * 导出绩效数据
 *
 * @param records 绩效数据记录数组（可以是 PerformanceRecord 或 BusinessQueryRecord）
 * @param format 导出格式 ('xlsx' | 'xls')
 * @param filename 文件名（不含扩展名）
 * @param timeRangeParams 可选的查询参数，用于生成完整的列集合
 */
export async function exportPerformanceRecords(
  records: PerformanceRecord[] | BusinessQueryRecord[],
  format: 'xlsx' | 'xls' = 'xlsx',
  filename: string = '绩效数据',
  timeRangeParams?: ExportTimeRangeParams,
): Promise<void> {
  // 判断是否为 BusinessQueryRecord 格式（检查是否有 employeeNo 字段）
  const isBusinessQueryRecord =
    records.length > 0 && records[0] && 'employeeNo' in records[0];

  let exportData: Record<string, any>[];

  if (isBusinessQueryRecord) {
    // BusinessQueryRecord 格式
    // 确定要包含的时间列
    let timeColumns: string[];

    if (timeRangeParams?.start_year && timeRangeParams?.end_year) {
      // 从查询参数生成完整的列集合（包含年度+季度）
      timeColumns = generateTimeRangeColumns(timeRangeParams);
    } else {
      // 回退到当前行为：扫描数据以查找季度和年度
      const quarterSet = new Set<string>();
      const yearSet = new Set<number>();
      records.forEach((record: any) => {
        Object.keys(record).forEach((key) => {
          // 匹配季度列（如 2023Q4）
          if (/^\d{4}Q[1-4]$/.test(key)) {
            quarterSet.add(key);
          }
          // 匹配年度键（如 year2023）
          const yearMatch = key.match(/^year(\d{4})$/);
          if (yearMatch && yearMatch[1]) {
            yearSet.add(parseInt(yearMatch[1], 10));
          }
        });
      });

      // 按年份升序，每年内部：年度 -> Q4 -> Q3 -> Q2 -> Q1
      const years = Array.from(yearSet).sort((a, b) => a - b);
      timeColumns = [];
      years.forEach((year) => {
        // 添加年度列
        timeColumns.push(`${year}年度`);
        // 添加该年的所有季度列（倒序），无论数据是否存在
        [4, 3, 2, 1].forEach((q) => {
          timeColumns.push(`${year}Q${q}`);
        });
      });
    }

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

      // 添加时间期间列（完整集合）
      timeColumns.forEach((column) => {
        // 检查是否为年度列
        const yearMatch = column.match(/^(\d{4})年度$/);
        if (yearMatch && yearMatch[1]) {
          // 年度列：从 yearXXXX 对象中提取评级
          const year = yearMatch[1];
          const yearData = record[`year${year}`];
          // 假设年度数据中有 rating 字段，如果没有则使用空字符串
          row[column] = yearData?.rating || yearData?.grade || '';
        } else {
          // 季度列：直接从记录中获取
          row[column] = record[column] || '';
        }
      });

      return row;
    });
  } else {
    // PerformanceRecord 格式
    exportData = (records as PerformanceRecord[]).map((record) => ({
      年份: record.year,
      季度: record.quarter,
      员工姓名: record.employee_name,
      员工工号: record.employee_number,
      部门名称: record.department_name,
      部门路径: record.department_path,
      绩效评级: record.performance_rating,
      最后同步时间: record.last_synced_at,
      创建时间: record.created_at,
      更新时间: record.updated_at,
    }));
  }

  await exportToExcel(exportData, filename, format);
}

/**
 * 从 URL 下载文件
 *
 * @param url 文件 URL
 * @param filename 文件名
 */
export async function downloadFile(
  url: string,
  filename: string,
): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载文件失败: ${response.statusText}`);
    }

    const blob = await response.blob();
    downloadBlob(blob, filename);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`下载文件失败: ${err.message}`);
  }
}

/**
 * 下载 Blob 对象
 *
 * @param blob Blob 对象
 * @param filename 文件名
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
