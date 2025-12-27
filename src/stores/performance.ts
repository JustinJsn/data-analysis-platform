/**
 * Performance Store - 绩效数据管理
 *
 * 负责绩效数据的状态管理、列表查询、同步触发等功能
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  PerformanceReport,
  PerformanceReportQueryParams,
  PerformanceReportFilters,
  PerformanceSyncRequest,
} from '@/types/performance';
import { performanceApi } from '@/api';
import { syncApi } from '@/api';
import type { SyncBatch } from '@/types/api';

export const usePerformanceStore = defineStore('performance', () => {
  // ==================== State ====================

  /** 绩效数据列表 */
  const reports = ref<PerformanceReport[]>([]);

  /** 总记录数 */
  const total = ref(0);

  /** 加载状态 */
  const loading = ref(false);

  /** 筛选条件 */
  const filters = ref<PerformanceReportFilters>({});

  /** 当前页码 */
  const currentPage = ref(1);

  /** 每页条数 */
  const pageSize = ref(10);

  /** 是否正在同步 */
  const syncing = ref(false);

  /** 同步进度（0-100） */
  const syncProgress = ref<number | null>(null);

  /** 最后同步时间 */
  const lastSyncTime = ref<string | null>(null);

  /** 同步状态 */
  const syncStatus = ref<'idle' | 'syncing' | 'success' | 'failed'>('idle');

  /** 同步错误信息 */
  const syncError = ref<string | null>(null);

  /** 当前同步批次ID */
  const currentBatchId = ref<string | null>(null);

  /** 轮询定时器 */
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  // ==================== Getters ====================

  /** 总页数 */
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value);
  });

  /** 是否有数据 */
  const hasReports = computed(() => {
    return reports.value.length > 0;
  });

  /** 是否可以触发同步 */
  const canSync = computed(() => {
    return !syncing.value && syncStatus.value !== 'syncing';
  });

  // ==================== Actions ====================

  /**
   * 获取绩效数据列表
   */
  const fetchReports = async (params?: PerformanceReportQueryParams) => {
    try {
      loading.value = true;
      const queryParams: PerformanceReportQueryParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...filters.value,
        ...params,
      };
      const response = await performanceApi.getReports(queryParams);
      reports.value = response.list;
      total.value = response.total;
    } catch (error) {
      reports.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 触发绩效数据同步
   */
  const triggerSync = async (data?: PerformanceSyncRequest) => {
    try {
      syncing.value = true;
      syncStatus.value = 'syncing';
      syncError.value = null;
      syncProgress.value = 0;

      // 调用同步接口
      const response = await performanceApi.triggerSync(data);

      // 获取批次ID
      if (response.batch_id) {
        currentBatchId.value = response.batch_id;
        // 开始轮询检查同步状态
        startPolling(response.batch_id);
      } else {
        // 如果没有批次ID，直接标记为成功
        syncStatus.value = 'success';
        syncing.value = false;
        syncProgress.value = 100;
        lastSyncTime.value = new Date().toISOString();
      }
    } catch (error) {
      syncStatus.value = 'failed';
      syncError.value = error instanceof Error ? error.message : '同步失败';
      syncing.value = false;
      syncProgress.value = null;
      throw error;
    }
  };

  /**
   * 检查同步状态
   */
  const checkSyncStatus = async (batchId: string) => {
    try {
      // 通过同步批次详情接口检查状态
      const response = await syncApi.getBatchDetail(batchId, 1, 1);
      const batchData = response.batch;

      if (batchData.status === 'running') {
        // 仍在运行中，更新进度（这里可以根据实际情况计算进度）
        syncProgress.value = batchData.total_records
          ? Math.floor(
              (batchData.success_records / batchData.total_records) * 100,
            )
          : null;
      } else if (batchData.status === 'success') {
        // 同步成功
        syncStatus.value = 'success';
        syncing.value = false;
        syncProgress.value = 100;
        lastSyncTime.value = batchData.completed_at || new Date().toISOString();
        currentBatchId.value = null;
        stopPolling();
        // 刷新数据列表
        await fetchReports();
      } else if (batchData.status === 'failed') {
        // 同步失败
        syncStatus.value = 'failed';
        syncError.value = batchData.error_message || '同步失败';
        syncing.value = false;
        syncProgress.value = null;
        currentBatchId.value = null;
        stopPolling();
      } else if (batchData.status === 'partial_success') {
        // 部分成功，也视为成功
        syncStatus.value = 'success';
        syncing.value = false;
        syncProgress.value = 100;
        lastSyncTime.value = batchData.completed_at || new Date().toISOString();
        currentBatchId.value = null;
        stopPolling();
        // 刷新数据列表
        await fetchReports();
      }
    } catch (error) {
      // 检查状态失败，但不影响主流程
      console.error('检查同步状态失败:', error);
    }
  };

  /**
   * 开始轮询检查同步状态
   */
  const startPolling = (batchId: string) => {
    // 清除之前的定时器
    stopPolling();

    // 立即检查一次
    checkSyncStatus(batchId);

    // 每5秒检查一次
    pollTimer = setInterval(() => {
      checkSyncStatus(batchId);
    }, 5000);
  };

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  /**
   * 更新筛选条件
   */
  const updateFilters = (newFilters: Partial<PerformanceReportFilters>) => {
    filters.value = { ...filters.value, ...newFilters };
    // 重置到第一页
    currentPage.value = 1;
  };

  /**
   * 重置筛选条件
   */
  const resetFilters = () => {
    filters.value = {};
    currentPage.value = 1;
  };

  /**
   * 更新分页信息
   */
  const updatePagination = (page: number, size: number) => {
    currentPage.value = page;
    pageSize.value = size;
  };

  return {
    // State
    reports,
    total,
    loading,
    filters,
    currentPage,
    pageSize,
    syncing,
    syncProgress,
    lastSyncTime,
    syncStatus,
    syncError,
    currentBatchId,

    // Getters
    totalPages,
    hasReports,
    canSync,

    // Actions
    fetchReports,
    triggerSync,
    checkSyncStatus,
    updateFilters,
    resetFilters,
    updatePagination,
    stopPolling,
  };
});
