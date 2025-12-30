/**
 * 绩效数据相关 API
 */
import { request } from '@/utils/request';
import type {
  PerformanceReport,
  PerformanceReportBusinessQueryParams,
  PerformanceSyncRequest,
  PerformanceSyncResponse,
  PaginatedResponse,
} from '@/types';
import type { PerformanceReportFilters } from '@/types/performance';

export const performanceApi = {
  /**
   * 获取绩效数据列表
   */
  getReports(params?: PerformanceReportFilters) {
    return request.get<PaginatedResponse<PerformanceReport>>(
      '/api/v1/performance-reports',
      {
        params,
      },
    );
  },

  /**
   * 绩效数据业务查询
   * 支持多种查询条件的绩效数据查询接口
   *
   * @param params 业务查询参数
   * @returns 分页响应数据
   */
  businessQuery(params?: PerformanceReportBusinessQueryParams) {
    return request.get<PaginatedResponse<PerformanceReport>>(
      '/api/v1/performance-reports/business-query',
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
