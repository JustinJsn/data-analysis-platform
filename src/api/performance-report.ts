/**
 * 绩效数据报表 API
 */
import { request } from '@/utils/request';
import type {
  PerformanceReportQueryParams,
  PerformanceRecordListResponse,
  ExportRequest,
  ExportResponse,
  ExportTaskStatus,
  BusinessQueryResponse,
  PerformanceReportBusinessQueryParams,
} from '@/types/performance-report';

export const performanceReportApi = {
  /**
   * 查询绩效数据
   *
   * @param params 查询参数
   * @returns 分页的绩效数据列表
   */
  getReports(params?: PerformanceReportQueryParams) {
    return request.get<PerformanceRecordListResponse>(
      '/api/v1/performance-reports',
      {
        params,
      },
    );
  },

  /**
   * 业务查询绩效数据（business-query 接口）
   *
   * @param params 业务查询参数
   * @returns 分页的绩效数据列表
   */
  businessQuery(params?: PerformanceReportBusinessQueryParams) {
    return request.get<BusinessQueryResponse>(
      '/api/v1/performance-reports/business-query',
      {
        params,
      },
    );
  },

  /**
   * 导出绩效数据
   *
   * @param data 导出请求
   * @returns 导出响应（批量导出直接返回文件URL，全量导出返回任务ID）
   */
  exportReports(data: ExportRequest) {
    return request.post<ExportResponse>(
      '/api/v1/performance-reports/export',
      data,
    );
  },

  /**
   * 获取导出任务状态
   *
   * @param taskId 任务ID
   * @returns 导出任务状态
   */
  getExportTaskStatus(taskId: string) {
    return request.get<ExportTaskStatus>(
      `/api/v1/performance-reports/export/${taskId}/status`,
    );
  },
};
