/**
 * Performance Store 测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePerformanceStore } from '@/stores/performance';

// Mock API
vi.mock('@/api', () => ({
  performanceApi: {
    getReports: vi.fn(),
    triggerSync: vi.fn(),
  },
  syncApi: {
    getBatchDetail: vi.fn(),
  },
}));

import { performanceApi, syncApi } from '@/api';

describe('Performance Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = usePerformanceStore();
      expect(store.reports).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.loading).toBe(false);
      expect(store.filters).toEqual({});
      expect(store.currentPage).toBe(1);
      expect(store.pageSize).toBe(10);
      expect(store.syncing).toBe(false);
      expect(store.syncProgress).toBeNull();
      expect(store.lastSyncTime).toBeNull();
      expect(store.syncStatus).toBe('idle');
      expect(store.syncError).toBeNull();
      expect(store.currentBatchId).toBeNull();
    });
  });

  describe('Getters', () => {
    it('totalPages 应该正确计算总页数', () => {
      const store = usePerformanceStore();
      store.total = 45;
      store.pageSize = 10;
      expect(store.totalPages).toBe(5);

      store.total = 40;
      expect(store.totalPages).toBe(4);

      store.total = 0;
      expect(store.totalPages).toBe(0);
    });

    it('hasReports 应该正确判断是否有数据', () => {
      const store = usePerformanceStore();
      expect(store.hasReports).toBe(false);

      store.reports = [
        {
          id: '1',
          batch_id: 'batch1',
          external_system_id: 'sys1',
          year: 2024,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_full_name: '技术部',
          organization_path_ids: '1/2',
          performance_rating: 'A',
          last_synced_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      expect(store.hasReports).toBe(true);
    });

    it('canSync 应该正确判断是否可以触发同步', () => {
      const store = usePerformanceStore();
      expect(store.canSync).toBe(true);

      store.syncing = true;
      expect(store.canSync).toBe(false);

      store.syncing = false;
      store.syncStatus = 'syncing';
      expect(store.canSync).toBe(false);
    });
  });

  describe('Actions', () => {
    it('fetchReports 应该获取绩效数据列表', async () => {
      const store = usePerformanceStore();
      const mockData = {
        list: [
          {
            id: '1',
            batch_id: 'batch1',
            external_system_id: 'sys1',
            year: 2024,
            quarter: 'Q1',
            employee_name: '张三',
            employee_user_id: 'user1',
            organization_full_name: '技术部',
            organization_path_ids: '1/2',
            performance_rating: 'A',
            last_synced_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        pageNum: 1,
        pageSize: 10,
        totalPages: 1,
      };

      vi.mocked(performanceApi.getReports).mockResolvedValue(mockData);

      await store.fetchReports();

      expect(store.reports).toEqual(mockData.list);
      expect(store.total).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('fetchReports 失败时应该清空列表', async () => {
      const store = usePerformanceStore();
      store.reports = [
        {
          id: '1',
          batch_id: 'batch1',
          external_system_id: 'sys1',
          year: 2024,
          quarter: 'Q1',
          employee_name: '张三',
          employee_user_id: 'user1',
          organization_full_name: '技术部',
          organization_path_ids: '1/2',
          performance_rating: 'A',
          last_synced_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      store.total = 1;

      vi.mocked(performanceApi.getReports).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(store.fetchReports()).rejects.toThrow('Network error');
      expect(store.reports).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.loading).toBe(false);
    });

    it('updateFilters 应该更新筛选条件并重置页码', () => {
      const store = usePerformanceStore();
      store.currentPage = 3;
      store.updateFilters({ year: 2024, quarter: 'Q1' });

      expect(store.filters.year).toBe(2024);
      expect(store.filters.quarter).toBe('Q1');
      expect(store.currentPage).toBe(1);
    });

    it('resetFilters 应该重置筛选条件', () => {
      const store = usePerformanceStore();
      store.filters = { year: 2024, quarter: 'Q1' };
      store.currentPage = 3;

      store.resetFilters();

      expect(store.filters).toEqual({});
      expect(store.currentPage).toBe(1);
    });

    it('updatePagination 应该更新分页信息', () => {
      const store = usePerformanceStore();
      store.updatePagination(2, 20);

      expect(store.currentPage).toBe(2);
      expect(store.pageSize).toBe(20);
    });

    it('triggerSync 应该触发同步并开始轮询', async () => {
      const store = usePerformanceStore();
      const mockResponse = {
        message: '同步已触发',
        batch_id: 'batch123',
        status: 'running',
      };

      vi.mocked(performanceApi.triggerSync).mockResolvedValue(mockResponse);

      const mockBatch = {
        batch: {
          batch_id: 'batch123',
          sync_type: 'employee',
          status: 'running',
          trigger_mode: 'manual',
          started_at: '2024-01-01T00:00:00Z',
          completed_at: null,
          duration_ms: null,
          total_records: 100,
          success_records: 50,
          failed_records: 0,
          error_message: null,
        },
        logs: {
          total: 0,
          page: 1,
          size: 20,
          logs: [],
        },
      };

      vi.mocked(syncApi.getBatchDetail).mockResolvedValue(mockBatch);

      await store.triggerSync({ sync_type: 'incremental' });

      expect(store.syncing).toBe(true);
      expect(store.syncStatus).toBe('syncing');
      expect(store.currentBatchId).toBe('batch123');
      expect(store.syncError).toBeNull();

      // 验证轮询已启动
      vi.advanceTimersByTime(5000);
      expect(syncApi.getBatchDetail).toHaveBeenCalled();
    });

    it('triggerSync 失败时应该设置错误状态', async () => {
      const store = usePerformanceStore();

      vi.mocked(performanceApi.triggerSync).mockRejectedValue(
        new Error('同步失败'),
      );

      await expect(
        store.triggerSync({ sync_type: 'incremental' }),
      ).rejects.toThrow('同步失败');

      expect(store.syncStatus).toBe('failed');
      expect(store.syncError).toBe('同步失败');
      expect(store.syncing).toBe(false);
    });

    it('checkSyncStatus 应该检查同步状态', async () => {
      const store = usePerformanceStore();
      const mockBatch = {
        batch: {
          batch_id: 'batch123',
          sync_type: 'employee',
          status: 'success',
          trigger_mode: 'manual',
          started_at: '2024-01-01T00:00:00Z',
          completed_at: '2024-01-01T01:00:00Z',
          duration_ms: 3600000,
          total_records: 100,
          success_records: 100,
          failed_records: 0,
          error_message: null,
        },
        logs: {
          total: 0,
          page: 1,
          size: 20,
          logs: [],
        },
      };

      vi.mocked(syncApi.getBatchDetail).mockResolvedValue(mockBatch);

      await store.checkSyncStatus('batch123');

      expect(store.syncStatus).toBe('success');
      expect(store.syncing).toBe(false);
      expect(store.syncProgress).toBe(100);
    });
  });
});
