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
   * 导出绩效数据（根据API文档：POST /api/v1/performance-reports/export）
   *
   * @param data 导出请求
   * @returns 导出响应（包含Blob和文件名）
   *
   * 注意：根据API文档，导出接口直接返回CSV文件流
   * 响应头：Content-Type: text/csv; charset=utf-8
   * 响应头：Content-Disposition: attachment; filename=performance_reports_YYYYMMDD_HHMMSS.csv
   */
  async exportReports(data: ExportRequest): Promise<ExportResponse> {
    // 使用axios实例直接调用，指定responseType为blob
    const axios = await import('axios');
    const axiosInstance = axios.default.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '',
      timeout: 300000, // 导出可能需要较长时间，设置5分钟超时
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 注入Token
    const token = localStorage.getItem('access_token');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;
    }

    const response = await axiosInstance.post<Blob>(
      '/api/v1/performance-reports/export',
      data,
      {
        responseType: 'blob', // 指定响应类型为Blob
      },
    );

    // 从响应头提取文件名
    const contentDisposition =
      response.headers['content-disposition'] ||
      response.headers['Content-Disposition'] ||
      '';
    let filename = 'performance_reports.csv';

    if (contentDisposition) {
      // 支持两种格式：filename="xxx.csv" 或 filename=xxx.csv
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '').trim();
      }
    }

    return {
      blob: response.data,
      filename,
    };
  },

  /**
   * 获取导出任务状态（如果后端支持异步导出任务）
   *
   * @param taskId 任务ID
   * @returns 导出任务状态
   *
   * 注意：根据API文档，导出接口是同步的，直接返回CSV文件流
   * 此接口仅用于未来可能的异步导出功能
   */
  getExportTaskStatus(taskId: string) {
    return request.get<ExportTaskStatus>(
      `/api/v1/performance-reports/export/${taskId}/status`,
    );
  },
};
