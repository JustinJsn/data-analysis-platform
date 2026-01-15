/**
 * 导出工具函数
 */

import * as XLSX from 'xlsx';
import type {
  PerformanceRecord,
  BusinessQueryRecord,
} from '@/types/performance-report';

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
 */
export async function exportPerformanceRecords(
  records: PerformanceRecord[] | BusinessQueryRecord[],
  format: 'xlsx' | 'xls' = 'xlsx',
  filename: string = '绩效数据',
): Promise<void> {
  // 判断是否为 BusinessQueryRecord 格式（检查是否有 employeeNo 字段）
  const isBusinessQueryRecord =
    records.length > 0 && records[0] && 'employeeNo' in records[0];

  let exportData: Record<string, any>[];

  if (isBusinessQueryRecord) {
    // BusinessQueryRecord 格式
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

      // 添加季度评级列（格式：2025Q3）
      for (const key in record) {
        const quarterMatch = key.match(/^(\d{4})Q([1-4])$/);
        if (quarterMatch) {
          const year = quarterMatch[1];
          const quarter = `Q${quarterMatch[2]}`;
          row[`${year}${quarter}`] = record[key] || '';
        }
      }

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
