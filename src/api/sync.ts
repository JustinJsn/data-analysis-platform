/**
 * 同步任务相关 API
 */
import { request } from '@/utils/request';
import type {
  SyncBatch,
  SyncBatchQueryParams,
  SyncBatchListResponse,
  SyncBatchLogsResponse,
  SyncTriggerRequest,
  OrderedFlowStatus,
  SimpleResponse,
} from '@/types/api';

export const syncApi = {
  /**
   * 获取批次列表
   */
  getBatches(filters: SyncBatchQueryParams) {
    return request.get<SyncBatchListResponse>('/api/v1/sync/batches', {
      params: filters,
    });
  },

  /**
   * 获取批次详情
   */
  getBatchDetail(batchId: string) {
    return request.get<SyncBatch>(`/api/v1/sync/batches/${batchId}`);
  },

  /**
   * 获取批次日志
   */
  getBatchLogs(batchId: string) {
    return request.get<SyncBatchLogsResponse>(
      `/api/v1/sync/batches/${batchId}/logs`,
    );
  },

  /**
   * 触发员工同步
   */
  triggerEmployeeSync(data?: SyncTriggerRequest) {
    return request.post<SimpleResponse>('/api/v1/sync/employees', data);
  },

  /**
   * 触发组织同步
   */
  triggerOrganizationSync(data?: SyncTriggerRequest) {
    return request.post<SimpleResponse>('/api/v1/sync/organizations', data);
  },

  /**
   * 触发职务同步
   */
  triggerPositionSync(data?: SyncTriggerRequest) {
    return request.post<SimpleResponse>('/api/v1/sync/jobposts', data);
  },

  /**
   * 触发完整同步
   */
  triggerOrderedSync() {
    return request.post<SimpleResponse>('/api/v1/sync/ordered-flow');
  },

  /**
   * 获取完整同步流程状态
   */
  getOrderedFlowStatus(batchId: string) {
    return request.get<OrderedFlowStatus>(
      `/api/v1/sync/ordered-flow/${batchId}/status`,
    );
  },
};
