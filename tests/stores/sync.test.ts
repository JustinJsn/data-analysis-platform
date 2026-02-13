/**
 * Sync Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSyncStore } from '@/stores/sync';
import { syncApi } from '@/api';
import type { SyncBatchDetailResponse } from '@/types/api';

// Mock syncApi
vi.mock('@/api', () => ({
  syncApi: {
    getBatches: vi.fn(),
    getBatchDetail: vi.fn(),
    getBatchLogs: vi.fn(),
    triggerEmployeeSync: vi.fn(),
    triggerOrganizationSync: vi.fn(),
    triggerPositionSync: vi.fn(),
    triggerOrderedSync: vi.fn(),
  },
}));

describe('Sync Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchBatchDetail', () => {
    it('应该正确转换日志数据格式', async () => {
      const mockResponse: SyncBatchDetailResponse = {
        batch: {
          batch_id: 'test-batch-id',
          sync_type: 'organization',
          status: 'success',
          trigger_mode: 'manual',
          started_at: '2026-02-12T02:00:00Z',
          completed_at: '2026-02-12T02:01:00Z',
          duration_ms: 60000,
          total_records: 2,
          success_records: 1,
          failed_records: 1,
          error_message: null,
        },
        logs: {
          total: 2,
          page: 1,
          size: 50,
          logs: [
            {
              log_id: 'log-1',
              batch_id: 'test-batch-id',
              record_type: 'organization',
              record_id: 'RootOrg',
              status: 'failed',
              level: 'failed',
              message: 'validation error',
              details: '{"oId": 900612450}',
              created_at: '2026-02-12T02:00:03Z',
            },
            {
              log_id: 'log-2',
              batch_id: 'test-batch-id',
              record_type: 'organization',
              record_id: '12105057',
              status: 'success',
              level: 'success',
              message: 'Success',
              details: '{"oId": 1725925}',
              created_at: '2026-02-12T02:00:04Z',
            },
          ],
        },
      };

      vi.mocked(syncApi.getBatchDetail).mockResolvedValue(mockResponse);

      const store = useSyncStore();
      await store.fetchBatchDetail('test-batch-id');

      // 验证日志数据转换正确
      expect(store.currentLogs).toHaveLength(2);
      expect(store.currentLogs[0]).toEqual({
        id: 'log-1',
        batchId: 'test-batch-id',
        recordType: 'organization',
        recordId: 'RootOrg',
        status: 'failed',
        level: 'failed',
        message: 'validation error',
        details: '{"oId": 900612450}',
        timestamp: '2026-02-12T02:00:03Z',
      });

      expect(store.currentLogs[1]).toEqual({
        id: 'log-2',
        batchId: 'test-batch-id',
        recordType: 'organization',
        recordId: '12105057',
        status: 'success',
        level: 'success',
        message: 'Success',
        details: '{"oId": 1725925}',
        timestamp: '2026-02-12T02:00:04Z',
      });

      // 验证分页信息
      expect(store.logsTotal).toBe(2);
      expect(store.logsFilters.pageNum).toBe(1);
      expect(store.logsFilters.pageSize).toBe(50);
    });

    it('应该处理空日志列表', async () => {
      const mockResponse: SyncBatchDetailResponse = {
        batch: {
          batch_id: 'test-batch-id',
          sync_type: 'organization',
          status: 'success',
          trigger_mode: 'manual',
          started_at: '2026-02-12T02:00:00Z',
          completed_at: '2026-02-12T02:01:00Z',
          duration_ms: 60000,
          total_records: 0,
          success_records: 0,
          failed_records: 0,
          error_message: null,
        },
        logs: {
          total: 0,
          page: 1,
          size: 50,
          logs: [],
        },
      };

      vi.mocked(syncApi.getBatchDetail).mockResolvedValue(mockResponse);

      const store = useSyncStore();
      await store.fetchBatchDetail('test-batch-id');

      expect(store.currentLogs).toHaveLength(0);
      expect(store.logsTotal).toBe(0);
    });
  });
});
