/**
 * Performance Report Store - 绩效数据报表管理
 *
 * 负责绩效数据报表的状态管理、查询、导出等功能
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  PerformanceRecord,
  PerformanceReportQueryParams,
  PerformanceReportBusinessQueryParams,
  BusinessQueryRecord,
  ExportRequest,
} from '@/types/performance-report';
import { performanceReportApi } from '@/api/performance-report';
import { captureError, addBreadcrumb } from '@/utils/sentry';

export const usePerformanceReportStore = defineStore(
  'performance-report',
  () => {
    // ==================== State ====================

    /** 绩效数据列表（兼容旧格式） */
    const records = ref<PerformanceRecord[]>([]);

    /** Business Query 数据列表（新格式） */
    const businessQueryRecords = ref<BusinessQueryRecord[]>([]);

    /** 总记录数 */
    const total = ref(0);

    /** 加载状态 */
    const loading = ref(false);

    /** 查询参数 */
    const queryParams = ref<PerformanceReportQueryParams>({
      pageNum: 1,
      pageSize: 20,
    });

    /** Business Query 查询参数 */
    const businessQueryParams = ref<PerformanceReportBusinessQueryParams>({
      pageNum: 1,
      pageSize: 20,
    });

    /** 当前页码 */
    const currentPage = ref(1);

    /** 每页条数 */
    const pageSize = ref(20);

    /** 导出状态 */
    const exporting = ref(false);

    /** 导出任务ID（全量导出） */
    const exportTaskId = ref<string | null>(null);

    // ==================== Getters ====================

    /** 总页数 */
    const totalPages = computed(() => {
      return Math.ceil(total.value / pageSize.value);
    });

    /** 是否有数据 */
    const hasRecords = computed(() => {
      return businessQueryRecords.value.length > 0 || records.value.length > 0;
    });

    /** 是否可以导出 */
    const canExport = computed(() => {
      return !exporting.value && hasRecords.value;
    });

    // ==================== Actions ====================

    /**
     * 查询绩效数据（使用 business-query 接口）
     */
    const fetchRecords = async (
      params?: Partial<PerformanceReportBusinessQueryParams>,
    ) => {
      try {
        loading.value = true;

        // 合并查询参数
        const mergedParams: PerformanceReportBusinessQueryParams = {
          ...businessQueryParams.value,
          ...params,
          pageNum: currentPage.value,
          pageSize: pageSize.value,
        };

        const response = await performanceReportApi.businessQuery(mergedParams);
        businessQueryRecords.value = response.list;
        total.value = response.total;

        // 更新查询参数
        businessQueryParams.value = mergedParams;

        // 记录成功操作
        addBreadcrumb({
          message: '查询绩效数据成功',
          category: 'performance-report.fetchRecords',
          level: 'info',
          data: {
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            total: response.total,
          },
        });
      } catch (error) {
        businessQueryRecords.value = [];
        total.value = 0;

        // 上报错误到 Sentry
        const err = error instanceof Error ? error : new Error(String(error));
        captureError(err, {
          type: 'Performance Report Fetch Error',
          queryParams: businessQueryParams.value,
          fingerprint: ['performance-report-fetch-error'],
        });

        throw error;
      } finally {
        loading.value = false;
      }
    };

    /**
     * 更新查询参数
     */
    const updateQueryParams = (
      params: Partial<PerformanceReportBusinessQueryParams>,
    ) => {
      businessQueryParams.value = { ...businessQueryParams.value, ...params };
      currentPage.value = 1; // 重置到第一页
    };

    /**
     * 重置查询参数
     */
    const resetQueryParams = () => {
      businessQueryParams.value = {
        pageNum: 1,
        pageSize: 20,
      };
      currentPage.value = 1;
      pageSize.value = 20;
    };

    /**
     * 更新分页信息
     */
    const updatePagination = (page: number, size: number) => {
      currentPage.value = page;
      pageSize.value = size;
    };

    /**
     * 批量导出（前端处理）
     */
    const exportBatch = async (format: 'xlsx' | 'csv' = 'xlsx') => {
      try {
        exporting.value = true;

        // 使用当前页数据（优先使用 businessQueryRecords）
        const data =
          businessQueryRecords.value.length > 0
            ? businessQueryRecords.value
            : records.value;

        // 调用导出工具函数
        const { exportPerformanceRecords } = await import('@/utils/export');
        await exportPerformanceRecords(data as any, format, '绩效数据');

        addBreadcrumb({
          message: '批量导出成功',
          category: 'performance-report.exportBatch',
          level: 'info',
          data: { count: data.length, format },
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        captureError(err, {
          type: 'Performance Report Export Batch Error',
          fingerprint: ['performance-report-export-batch-error'],
        });
        throw error;
      } finally {
        exporting.value = false;
      }
    };

    /**
     * 全量导出（后端异步处理）
     */
    const exportAll = async (format: 'xlsx' | 'csv' = 'xlsx') => {
      try {
        exporting.value = true;

        // 提交导出任务
        // 注意：ExportRequest 的 query_params 类型是 PerformanceReportQueryParams
        // 但我们需要传递 PerformanceReportBusinessQueryParams，需要进行类型转换
        const request: ExportRequest = {
          query_params: {
            start_year: businessQueryParams.value.start_year,
            end_year: businessQueryParams.value.end_year,
            start_year_quarter: businessQueryParams.value.start_quarter
              ? `2025-${businessQueryParams.value.start_quarter}`
              : undefined,
            end_year_quarter: businessQueryParams.value.end_quarter
              ? `2025-${businessQueryParams.value.end_quarter}`
              : undefined,
            user_ids: businessQueryParams.value.employee_user_ids
              ? businessQueryParams.value.employee_user_ids.split(',')
              : undefined,
            department_id: businessQueryParams.value.organization_id,
            include_sub_departments: businessQueryParams.value.include_children,
            page: businessQueryParams.value.pageNum,
            page_size: businessQueryParams.value.pageSize,
          },
          export_type: 'all',
          format,
        };

        const response = await performanceReportApi.exportReports(request);

        exportTaskId.value = response.task_id || null;

        addBreadcrumb({
          message: '全量导出任务已提交',
          category: 'performance-report.exportAll',
          level: 'info',
          data: { taskId: exportTaskId.value, format },
        });

        return response;
      } catch (error) {
        exporting.value = false;
        exportTaskId.value = null;

        const err = error instanceof Error ? error : new Error(String(error));
        captureError(err, {
          type: 'Performance Report Export All Error',
          fingerprint: ['performance-report-export-all-error'],
        });
        throw error;
      }
    };

    /**
     * 检查导出任务状态
     */
    const checkExportTaskStatus = async (taskId: string) => {
      try {
        const status = await performanceReportApi.getExportTaskStatus(taskId);

        if (status.status === 'completed' && status.file_url) {
          // 下载文件
          const { downloadFile } = await import('@/utils/export');
          await downloadFile(status.file_url, '绩效数据.xlsx');
          exporting.value = false;
          exportTaskId.value = null;
        } else if (status.status === 'failed') {
          exporting.value = false;
          exportTaskId.value = null;
          throw new Error(status.error_message || '导出失败');
        }

        return status;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        captureError(err, {
          type: 'Performance Report Export Task Status Error',
          fingerprint: ['performance-report-export-task-status-error'],
        });
        throw error;
      }
    };

    return {
      // State
      records,
      businessQueryRecords,
      total,
      loading,
      queryParams,
      businessQueryParams,
      currentPage,
      pageSize,
      exporting,
      exportTaskId,

      // Getters
      totalPages,
      hasRecords,
      canExport,

      // Actions
      fetchRecords,
      updateQueryParams,
      resetQueryParams,
      updatePagination,
      exportBatch,
      exportAll,
      checkExportTaskStatus,
    };
  },
);
