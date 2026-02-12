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

        // 调用API
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
     * 批量导出（前端处理当前页数据）
     *
     * 注意：批量导出由前端处理，支持 xlsx 或 xls 格式
     */
    const exportBatch = async (format: 'xlsx' | 'xls' = 'xlsx') => {
      try {
        exporting.value = true;

        // 使用当前页数据（优先使用 businessQueryRecords）
        const data =
          businessQueryRecords.value.length > 0
            ? businessQueryRecords.value
            : records.value;

        // 从当前查询中提取时间范围参数
        const timeRangeParams =
          businessQueryParams.value.start_year &&
          businessQueryParams.value.end_year
            ? {
                start_year: businessQueryParams.value.start_year,
                end_year: businessQueryParams.value.end_year,
                start_quarter: businessQueryParams.value.start_quarter,
                end_quarter: businessQueryParams.value.end_quarter,
              }
            : undefined;

        // 调用导出工具函数
        const { exportPerformanceRecords } = await import('@/utils/export');
        await exportPerformanceRecords(
          data as any,
          format,
          '绩效数据',
          timeRangeParams,
        );

        addBreadcrumb({
          message: '批量导出成功',
          category: 'performance-report.exportBatch',
          level: 'info',
          data: { count: data.length, format, timeRangeParams },
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
     * 全量导出（后端处理）
     *
     * 注意：如果后端返回 CSV 格式，会在前端自动转换为 XLSX/XLS
     */
    const exportAll = async (format: 'xlsx' | 'xls' = 'xlsx') => {
      try {
        exporting.value = true;

        // 构建导出请求，尝试请求 XLSX 格式
        const exportRequest: ExportRequest = {
          format: format === 'xls' ? 'xlsx' : format, // 如果后端不支持 xls，使用 xlsx
          start_year: businessQueryParams.value.start_year,
          end_year: businessQueryParams.value.end_year,
          start_quarter: businessQueryParams.value.start_quarter,
          end_quarter: businessQueryParams.value.end_quarter,
          employee_user_ids: businessQueryParams.value.employee_user_ids,
          organization_id: businessQueryParams.value.organization_id,
          include_children: businessQueryParams.value.include_children,
          batch_id: businessQueryParams.value.batch_id,
        };

        // 请求导出（后端可能返回 CSV 或 XLSX）
        const response =
          await performanceReportApi.exportReports(exportRequest);

        // 检查返回的文件类型
        let finalBlob = response.blob;
        let finalFilename = response.filename;

        // 如果返回的是 CSV 文件，转换为 Excel
        if (
          response.blob.type === 'text/csv' ||
          response.filename.endsWith('.csv')
        ) {
          const { convertCsvToExcel } = await import('@/utils/export');
          finalBlob = await convertCsvToExcel(response.blob, format);
          finalFilename = response.filename.replace(/\.csv$/i, `.${format}`);
        }

        // 下载文件
        const url = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addBreadcrumb({
          message: '全量导出成功',
          category: 'performance-report.exportAll',
          level: 'info',
          data: { filename: finalFilename, format },
        });

        exporting.value = false;
        return { blob: finalBlob, filename: finalFilename };
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
