/**
 * 绩效数据相关 API
 */
import { request } from '@/utils/request';
import type {
  PerformanceReport,
  PerformanceReportQueryParams,
  PerformanceSyncRequest,
  PerformanceSyncResponse,
  PaginatedResponse,
} from '@/types';

export const performanceApi = {
  /**
   * 获取绩效数据列表
   */
  getReports(params?: PerformanceReportQueryParams) {
    return request.get<PaginatedResponse<PerformanceReport>>(
      '/api/v1/performance-reports',
      {
        params,
      },
    );
  },

  /**
   * 触发绩效数据同步
   */
  triggerSync(data?: PerformanceSyncRequest) {
    return request.post<PerformanceSyncResponse>(
      '/api/v1/sync/performance-reports',
      data,
    );
  },
};
