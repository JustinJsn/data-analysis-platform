/**
 * Sync Store - 同步任务数据管理
 *
 * 负责同步批次和日志的状态管理、查询、触发等功能
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  SyncBatch,
  SyncLog,
  SyncBatchQueryParams,
  SyncTriggerRequest,
  SyncType,
} from '@/types/api';
import { syncApi } from '@/api';

export const useSyncStore = defineStore('sync', () => {
  // ==================== State ====================

  /** 批次列表 */
  const batches = ref<SyncBatch[]>([]);

  /** 批次总数 */
  const batchesTotal = ref(0);

  /** 批次列表加载状态 */
  const batchesLoading = ref(false);

  /** 批次筛选条件 */
  const filters = ref<SyncBatchQueryParams>({
    pageNum: 1,
    pageSize: 20,
  });

  /** 当前批次详情 */
  const currentBatch = ref<SyncBatch | null>(null);

  /** 批次详情加载状态 */
  const batchDetailLoading = ref(false);

  /** 当前批次的日志列表 */
  const currentLogs = ref<SyncLog[]>([]);

  /** 日志总数 */
  const logsTotal = ref(0);

  /** 日志加载状态 */
  const logsLoading = ref(false);

  /** 日志筛选条件 */
  const logsFilters = ref({
    pageNum: 1,
    pageSize: 50,
  });

  // ==================== Getters ====================

  /** 批次列表总页数 */
  const batchesTotalPages = computed(() => {
    return Math.ceil(batchesTotal.value / (filters.value.pageSize || 20));
  });

  /** 日志总页数 */
  const logsTotalPages = computed(() => {
    return Math.ceil(logsTotal.value / logsFilters.value.pageSize);
  });

  /** 是否有正在运行的批次 */
  const hasRunningBatch = computed(() => {
    return batches.value.some((batch) => batch.status === 'running');
  });

  // ==================== Actions ====================

  /**
   * 获取批次列表
   */
  const fetchBatches = async () => {
    try {
      batchesLoading.value = true;
      const response = await syncApi.getBatches(filters.value);
      // 后端返回结构为 { list: [...], pageNum, pageSize, total, totalPages }
      batches.value = response.list;
      batchesTotal.value = response.total;
    } catch (error) {
      batches.value = [];
      batchesTotal.value = 0;
      throw error;
    } finally {
      batchesLoading.value = false;
    }
  };

  /**
   * 获取批次详情
   * @param id 批次ID
   * @param logPage 日志页码（可选，默认使用 logsFilters.pageNum）
   * @param logPageSize 日志每页数量（可选，默认使用 logsFilters.pageSize）
   */
  const fetchBatchDetail = async (
    id: string,
    logPage?: number,
    logPageSize?: number,
  ) => {
    try {
      batchDetailLoading.value = true;
      const page = logPage ?? logsFilters.value.pageNum;
      const pageSize = logPageSize ?? logsFilters.value.pageSize;
      const response = await syncApi.getBatchDetail(id, page, pageSize);
      // 从响应中提取批次信息
      currentBatch.value = response.batch;
      // 处理分页的日志数据
      if (
        response.logs &&
        response.logs.logs &&
        response.logs.logs.length > 0
      ) {
        // 转换日志格式 - 将 SyncLogRaw 转换为 SyncLog
        currentLogs.value = response.logs.logs.map((log) => {
          // 尝试解析 details JSON 字符串
          let recordDetails: Record<string, any> = {};
          try {
            recordDetails = log.details ? JSON.parse(log.details) : {};
          } catch {
            // 如果解析失败，使用空对象
          }

          return {
            id: log.log_id,
            batchId: log.batch_id,
            recordType: log.record_type,
            recordIdentifier: log.record_id,
            operation: 'update' as const, // 默认操作类型，因为原始数据没有此字段
            status: log.status,
            errorMessage: log.status === 'failed' ? log.message : '',
            errorCode: log.status === 'failed' ? log.level : '',
            recordDetails,
            processedAt: log.created_at,
            createdAt: log.created_at,
          };
        });
        logsTotal.value = response.logs.total;
        // 同步分页信息
        logsFilters.value.pageNum = response.logs.page;
        logsFilters.value.pageSize = response.logs.size;
      } else {
        currentLogs.value = [];
        logsTotal.value = 0;
      }
      return response.batch;
    } catch (error) {
      currentBatch.value = null;
      currentLogs.value = [];
      logsTotal.value = 0;
      throw error;
    } finally {
      batchDetailLoading.value = false;
    }
  };

  /**
   * 获取批次日志
   * @param batchId 批次ID
   */
  const fetchBatchLogs = async (batchId: string) => {
    try {
      logsLoading.value = true;
      const response = await syncApi.getBatchLogs(batchId);
      currentLogs.value = response.logs;
      logsTotal.value = response.totalCount;
    } catch (error) {
      currentLogs.value = [];
      logsTotal.value = 0;
      throw error;
    } finally {
      logsLoading.value = false;
    }
  };

  /**
   * 触发同步任务
   * @param type 同步类型
   * @param params 同步参数（可选时间范围）
   */
  const triggerSync = async (type: SyncType, params?: SyncTriggerRequest) => {
    let response;
    switch (type) {
      case 'employee':
        response = await syncApi.triggerEmployeeSync(params);
        break;
      case 'organization':
        response = await syncApi.triggerOrganizationSync(params);
        break;
      case 'jobpost':
        response = await syncApi.triggerPositionSync(params);
        break;
      default:
        throw new Error(`未知的同步类型: ${type}`);
    }
    return response;
  };

  /**
   * 触发完整有序同步
   * @param params 同步参数（可选时间范围）
   */
  const triggerFullSync = async (params?: SyncTriggerRequest) => {
    const response = await syncApi.triggerOrderedSync(params);
    return response;
  };

  /**
   * 设置批次列表页码
   */
  const setBatchesPage = (page: number) => {
    filters.value.pageNum = page;
  };

  /**
   * 设置日志列表页码
   */
  const setLogsPage = (page: number) => {
    logsFilters.value.pageNum = page;
  };

  /**
   * 设置批次筛选条件
   */
  const setBatchesFilters = (newFilters: Partial<SyncBatchQueryParams>) => {
    filters.value = { ...filters.value, ...newFilters };
    // 重置到第一页
    filters.value.pageNum = 1;
  };

  /**
   * 重置批次筛选条件
   */
  const resetBatchesFilters = () => {
    filters.value = {
      pageNum: 1,
      pageSize: 20,
    };
  };

  return {
    // State
    batches,
    batchesTotal,
    batchesLoading,
    filters,
    currentBatch,
    batchDetailLoading,
    currentLogs,
    logsTotal,
    logsLoading,
    logsFilters,

    // Getters
    batchesTotalPages,
    logsTotalPages,
    hasRunningBatch,

    // Actions
    fetchBatches,
    fetchBatchDetail,
    fetchBatchLogs,
    triggerSync,
    triggerFullSync,
    setBatchesPage,
    setLogsPage,
    setBatchesFilters,
    resetBatchesFilters,
  };
});
