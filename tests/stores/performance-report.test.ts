/**
 * Performance Report Store 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePerformanceReportStore } from '@/stores/performance-report';

// Mock API
vi.mock('@/api/performance-report', () => ({
  performanceReportApi: {
    businessQuery: vi.fn(),
    exportReports: vi.fn(),
    getExportTaskStatus: vi.fn(),
  },
}));

// Mock Sentry
vi.mock('@/utils/sentry', () => ({
  captureError: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

// Mock export utils
vi.mock('@/utils/export', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    exportPerformanceRecords: vi.fn(),
    downloadFile: vi.fn(),
    convertCsvToExcel: vi.fn(),
  };
});

import { performanceReportApi } from '@/api/performance-report';
import { exportPerformanceRecords, downloadFile } from '@/utils/export';

describe('Performance Report Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = usePerformanceReportStore();
      expect(store.records).toEqual([]);
      expect(store.businessQueryRecords).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.loading).toBe(false);
      expect(store.currentPage).toBe(1);
      expect(store.pageSize).toBe(20);
      expect(store.exporting).toBe(false);
      expect(store.exportTaskId).toBeNull();
      expect(store.queryParams).toEqual({
        pageNum: 1,
        pageSize: 20,
      });
      expect(store.businessQueryParams).toEqual({
        pageNum: 1,
        pageSize: 20,
      });
    });
  });

  describe('Getters', () => {
    it('totalPages 应该正确计算总页数', () => {
      const store = usePerformanceReportStore();
      store.total = 45;
      store.pageSize = 20;
      expect(store.totalPages).toBe(3);

      store.total = 40;
      expect(store.totalPages).toBe(2);

      store.total = 0;
      expect(store.totalPages).toBe(0);
    });

    it('hasRecords 应该正确判断是否有数据', () => {
      const store = usePerformanceReportStore();
      expect(store.hasRecords).toBe(false);

      store.businessQueryRecords = [
        {
          id: '1',
          batch_id: 'batch1',
          year: 2025,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_name: '技术部',
          organization_id: 'org1',
          performance_rating: 'A',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];
      expect(store.hasRecords).toBe(true);

      store.businessQueryRecords = [];
      store.records = [
        {
          id: '1',
          batch_id: 'batch1',
          external_system_id: 'sys1',
          year: 2025,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_full_name: '技术部',
          organization_path_ids: '1/2',
          performance_rating: 'A',
          last_synced_at: '2025-01-01T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];
      expect(store.hasRecords).toBe(true);
    });

    it('canExport 应该正确判断是否可以导出', () => {
      const store = usePerformanceReportStore();
      expect(store.canExport).toBe(false); // 没有数据

      store.businessQueryRecords = [
        {
          id: '1',
          batch_id: 'batch1',
          year: 2025,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_name: '技术部',
          organization_id: 'org1',
          performance_rating: 'A',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];
      expect(store.canExport).toBe(true);

      store.exporting = true;
      expect(store.canExport).toBe(false);
    });
  });

  describe('Actions', () => {
    it('fetchRecords 应该获取绩效数据列表', async () => {
      const store = usePerformanceReportStore();
      const mockData = {
        list: [
          {
            id: '1',
            batch_id: 'batch1',
            year: 2025,
            quarter: 'Q1',
            employee_name: '张三',
            employee_user_id: 'user1',
            organization_name: '技术部',
            organization_id: 'org1',
            performance_rating: 'A',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-01T00:00:00Z',
          },
        ],
        total: 1,
        pageNum: 1,
        pageSize: 20,
        totalPages: 1,
      };

      vi.mocked(performanceReportApi.businessQuery).mockResolvedValue(mockData);

      await store.fetchRecords();

      expect(store.businessQueryRecords).toEqual(mockData.list);
      expect(store.total).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('fetchRecords 应该合并查询参数', async () => {
      const store = usePerformanceReportStore();
      store.businessQueryParams = {
        pageNum: 1,
        pageSize: 20,
        start_year: 2025,
        end_year: 2025,
      };
      store.currentPage = 2;
      store.pageSize = 50;

      const mockData = {
        list: [],
        total: 0,
        pageNum: 2,
        pageSize: 50,
        totalPages: 0,
      };

      vi.mocked(performanceReportApi.businessQuery).mockResolvedValue(mockData);

      await store.fetchRecords({ organization_id: 'org1' });

      expect(performanceReportApi.businessQuery).toHaveBeenCalledWith({
        pageNum: 2,
        pageSize: 50,
        start_year: 2025,
        end_year: 2025,
        organization_id: 'org1',
      });
    });

    it('fetchRecords 失败时应该清空列表', async () => {
      const store = usePerformanceReportStore();
      store.businessQueryRecords = [
        {
          id: '1',
          batch_id: 'batch1',
          year: 2025,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_name: '技术部',
          organization_id: 'org1',
          performance_rating: 'A',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];
      store.total = 1;

      vi.mocked(performanceReportApi.businessQuery).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(store.fetchRecords()).rejects.toThrow('Network error');
      expect(store.businessQueryRecords).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.loading).toBe(false);
    });

    it('updateQueryParams 应该更新查询参数并重置页码', () => {
      const store = usePerformanceReportStore();
      store.currentPage = 3;
      store.updateQueryParams({ start_year: 2025, end_year: 2025 });

      expect(store.businessQueryParams.start_year).toBe(2025);
      expect(store.businessQueryParams.end_year).toBe(2025);
      expect(store.currentPage).toBe(1);
    });

    it('resetQueryParams 应该重置查询参数', () => {
      const store = usePerformanceReportStore();
      store.businessQueryParams = {
        pageNum: 1,
        pageSize: 20,
        start_year: 2025,
        end_year: 2025,
        organization_id: 'org1',
      };
      store.currentPage = 3;
      store.pageSize = 50;

      store.resetQueryParams();

      expect(store.businessQueryParams).toEqual({
        pageNum: 1,
        pageSize: 20,
      });
      expect(store.currentPage).toBe(1);
      expect(store.pageSize).toBe(20);
    });

    it('updatePagination 应该更新分页信息', () => {
      const store = usePerformanceReportStore();
      store.updatePagination(2, 50);

      expect(store.currentPage).toBe(2);
      expect(store.pageSize).toBe(50);
    });

    it('exportBatch 应该导出当前页数据', async () => {
      const store = usePerformanceReportStore();
      store.businessQueryRecords = [
        {
          id: '1',
          batch_id: 'batch1',
          year: 2025,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_name: '技术部',
          organization_id: 'org1',
          performance_rating: 'A',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(exportPerformanceRecords).mockResolvedValue(undefined);

      await store.exportBatch('xlsx');

      expect(exportPerformanceRecords).toHaveBeenCalledWith(
        store.businessQueryRecords,
        'xlsx',
        '绩效数据',
        undefined, // timeRangeParams is undefined when no query params are set
      );
      expect(store.exporting).toBe(false);
    });

    it('exportBatch 失败时应该设置错误状态', async () => {
      const store = usePerformanceReportStore();
      store.businessQueryRecords = [
        {
          id: '1',
          batch_id: 'batch1',
          year: 2025,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_name: '技术部',
          organization_id: 'org1',
          performance_rating: 'A',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(exportPerformanceRecords).mockRejectedValue(
        new Error('导出失败'),
      );

      await expect(store.exportBatch()).rejects.toThrow('导出失败');
      expect(store.exporting).toBe(false);
    });

    it('exportAll 应该调用导出API并下载文件', async () => {
      const store = usePerformanceReportStore();
      store.businessQueryParams = {
        pageNum: 1,
        pageSize: 20,
        start_year: 2025,
        end_year: 2025,
      };

      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      const mockResponse = {
        blob: mockBlob,
        filename: '绩效数据_2025.csv',
      };

      vi.mocked(performanceReportApi.exportReports).mockResolvedValue(
        mockResponse,
      );

      // Mock convertCsvToExcel to return a Blob
      const { convertCsvToExcel } = await import('@/utils/export');
      vi.mocked(convertCsvToExcel).mockResolvedValue(
        new Blob(['converted'], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      );

      // Mock DOM methods
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(() => null as any);
      const clickSpy = vi.fn();
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
      } as any;

      createElementSpy.mockReturnValue(mockLink);
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');

      await store.exportAll('csv');

      expect(performanceReportApi.exportReports).toHaveBeenCalledWith({
        format: 'csv',
        start_year: 2025,
        end_year: 2025,
        start_quarter: undefined,
        end_quarter: undefined,
        employee_user_ids: undefined,
        organization_id: undefined,
        include_children: undefined,
        batch_id: undefined,
      });
      expect(store.exporting).toBe(false);

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });

    it('exportAll 失败时应该设置错误状态', async () => {
      const store = usePerformanceReportStore();
      store.businessQueryParams = {
        pageNum: 1,
        pageSize: 20,
      };

      vi.mocked(performanceReportApi.exportReports).mockRejectedValue(
        new Error('导出失败'),
      );

      await expect(store.exportAll()).rejects.toThrow('导出失败');
      expect(store.exporting).toBe(false);
      expect(store.exportTaskId).toBeNull();
    });

    it('checkExportTaskStatus 应该检查任务状态并下载文件', async () => {
      const store = usePerformanceReportStore();
      const mockStatus = {
        task_id: 'task1',
        status: 'completed',
        file_url: 'https://example.com/file.csv',
        error_message: null,
      };

      vi.mocked(performanceReportApi.getExportTaskStatus).mockResolvedValue(
        mockStatus,
      );
      vi.mocked(downloadFile).mockResolvedValue(undefined);

      const result = await store.checkExportTaskStatus('task1');

      expect(result).toEqual(mockStatus);
      expect(downloadFile).toHaveBeenCalledWith(
        'https://example.com/file.csv',
        '绩效数据.xlsx',
      );
      expect(store.exporting).toBe(false);
      expect(store.exportTaskId).toBeNull();
    });

    it('checkExportTaskStatus 应该处理失败状态', async () => {
      const store = usePerformanceReportStore();
      const mockStatus = {
        task_id: 'task1',
        status: 'failed',
        file_url: null,
        error_message: '导出任务失败',
      };

      vi.mocked(performanceReportApi.getExportTaskStatus).mockResolvedValue(
        mockStatus,
      );

      await expect(store.checkExportTaskStatus('task1')).rejects.toThrow(
        '导出任务失败',
      );
      expect(store.exporting).toBe(false);
      expect(store.exportTaskId).toBeNull();
    });
  });
});
