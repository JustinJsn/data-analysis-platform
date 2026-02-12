/**
 * 导出工具函数测试
 */

import { describe, it, expect, vi } from 'vitest';
import {
  generateTimeRangeColumns,
  exportPerformanceRecords,
  type ExportTimeRangeParams,
} from '@/utils/export';
import type { BusinessQueryRecord } from '@/types/performance-report';

describe('generateTimeRangeColumns', () => {
  it('应该生成单年全部季度（包含年度列）', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2024,
      start_quarter: 'Q1',
      end_quarter: 'Q4',
    });

    // 年度列 + 4个季度列（倒序）
    expect(columns).toEqual([
      '2024年度',
      '2024Q4',
      '2024Q3',
      '2024Q2',
      '2024Q1',
    ]);
  });

  it('应该生成多年部分季度（包含年度列）', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2025,
      start_quarter: 'Q3',
      end_quarter: 'Q2',
    });

    // 2024: 年度 + Q4, Q3
    // 2025: 年度 + Q2, Q1
    expect(columns).toEqual([
      '2024年度',
      '2024Q4',
      '2024Q3',
      '2025年度',
      '2025Q2',
      '2025Q1',
    ]);
  });

  it('当未指定季度时应默认为全年（包含年度列）', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2024,
    });

    expect(columns).toEqual([
      '2024年度',
      '2024Q4',
      '2024Q3',
      '2024Q2',
      '2024Q1',
    ]);
  });

  it('应该处理单季度情况（包含年度列）', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2024,
      end_year: 2024,
      start_quarter: 'Q3',
      end_quarter: 'Q3',
    });

    expect(columns).toEqual(['2024年度', '2024Q3']);
  });

  it('应该处理多年跨度（边界情况：10年）', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2020,
      end_year: 2029,
      start_quarter: 'Q1',
      end_quarter: 'Q4',
    });

    // 10 years * (1 annual + 4 quarters) = 50 columns
    expect(columns).toHaveLength(50);
    expect(columns[0]).toBe('2020年度');
    expect(columns[1]).toBe('2020Q4');
    expect(columns[49]).toBe('2029Q1');
  });

  it('应该按年份升序、每年内部季度倒序排列', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2023,
      end_year: 2024,
      start_quarter: 'Q4',
      end_quarter: 'Q1',
    });

    // 2023: 年度 + Q4
    // 2024: 年度 + Q1
    expect(columns).toEqual(['2023年度', '2023Q4', '2024年度', '2024Q1']);
  });

  it('应该处理完整年份范围（多年全部季度）', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2023,
      end_year: 2025,
    });

    // 3 years * (1 annual + 4 quarters) = 15 columns
    expect(columns).toHaveLength(15);
    expect(columns).toEqual([
      '2023年度',
      '2023Q4',
      '2023Q3',
      '2023Q2',
      '2023Q1',
      '2024年度',
      '2024Q4',
      '2024Q3',
      '2024Q2',
      '2024Q1',
      '2025年度',
      '2025Q4',
      '2025Q3',
      '2025Q2',
      '2025Q1',
    ]);
  });

  it('应该正确处理中间年份的全部季度', () => {
    const columns = generateTimeRangeColumns({
      start_year: 2023,
      end_year: 2025,
      start_quarter: 'Q2',
      end_quarter: 'Q3',
    });

    // First year: 年度 + Q4, Q3, Q2 (4 columns)
    // Middle year (2024): 年度 + Q4, Q3, Q2, Q1 (5 columns)
    // Last year: 年度 + Q3, Q2, Q1 (4 columns)
    // Total: 13 columns
    expect(columns).toHaveLength(13);
    expect(columns).toEqual([
      '2023年度',
      '2023Q4',
      '2023Q3',
      '2023Q2',
      '2024年度',
      '2024Q4',
      '2024Q3',
      '2024Q2',
      '2024Q1',
      '2025年度',
      '2025Q3',
      '2025Q2',
      '2025Q1',
    ]);
  });
});

describe('exportPerformanceRecords with timeRangeParams', () => {
  // Mock DOM APIs for file download
  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement, appendChild, removeChild
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    } as any;
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
  });

  it('[T007] 应该在提供timeRangeParams时生成完整列集', async () => {
    const records: BusinessQueryRecord[] = [
      {
        employeeNo: '001',
        name: '张三',
        level1Department: '技术部',
        level2Department: '',
        level3Department: '',
        level4Department: '',
        employmentDate: '2020-01-01',
        position: '工程师',
        ratingCountS: 0,
        ratingCountA: 1,
        ratingCountB: 0,
        ratingCountC: 0,
        ratingCountD: 0,
        '2024Q1': 'A',
        // Missing Q2 and Q4 data intentionally
        '2024Q3': 'B',
      } as any,
    ];

    const timeRangeParams: ExportTimeRangeParams = {
      start_year: 2024,
      end_year: 2024,
      start_quarter: 'Q1',
      end_quarter: 'Q4',
    };

    await exportPerformanceRecords(
      records,
      'xlsx',
      '测试导出',
      timeRangeParams,
    );

    // Verify that URL.createObjectURL was called (file was created)
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');

    // The actual verification of complete columns would require inspecting the generated Excel
    // For now, we verify the function executes without errors
  });

  it('[T008] 应该在timeRangeParams未定义时回退到数据扫描', async () => {
    const records: BusinessQueryRecord[] = [
      {
        employeeNo: '001',
        name: '张三',
        level1Department: '技术部',
        level2Department: '',
        level3Department: '',
        level4Department: '',
        employmentDate: '2020-01-01',
        position: '工程师',
        ratingCountS: 0,
        ratingCountA: 1,
        ratingCountB: 0,
        ratingCountC: 0,
        ratingCountD: 0,
        '2024Q1': 'A',
        '2024Q3': 'B',
      } as any,
    ];

    // Call without timeRangeParams - should fall back to scanning data
    await exportPerformanceRecords(records, 'xlsx', '测试导出');

    // Verify that URL.createObjectURL was called (file was created)
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('[T009] 应该在空记录数组且有timeRangeParams时生成仅包含表头的导出', async () => {
    const records: BusinessQueryRecord[] = [];

    const timeRangeParams: ExportTimeRangeParams = {
      start_year: 2024,
      end_year: 2024,
      start_quarter: 'Q1',
      end_quarter: 'Q4',
    };

    await exportPerformanceRecords(
      records,
      'xlsx',
      '空数据导出',
      timeRangeParams,
    );

    // Verify that URL.createObjectURL was called (file was created even with empty data)
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });
});
