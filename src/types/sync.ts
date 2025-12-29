/**
 * 同步任务相关类型定义
 */

/**
 * 同步批次信息
 */
export interface SyncBatch {
  /** 批次ID */
  batch_id: string;
  /** 同步类型 */
  sync_type: 'employee' | 'organization' | 'jobpost';
  /** 状态 */
  status: 'running' | 'success' | 'failed' | 'partial_success';
  /** 触发模式 */
  trigger_mode: 'manual' | 'scheduled';
  /** 开始时间 */
  started_at: string;
  /** 结束时间 */
  completed_at: string | null;
  /** 持续时间（毫秒） */
  duration_ms: number | null;
  /** 总记录数 */
  total_records: number;
  /** 成功记录数 */
  success_records: number;
  /** 失败记录数 */
  failed_records: number;
  /** 错误信息 */
  error_message: string | null;
}

/**
 * 同步批次筛选条件
 */
export interface SyncBatchFilters {
  /** 页码 */
  pageNum: number;
  /** 每页数量（最大100） */
  pageSize: number;
  /** 同步类型 */
  syncType?: 'employee' | 'organization' | 'jobpost';
  /** 状态 */
  status?: 'running' | 'success' | 'failed';
  /** 开始时间（ISO 8601格式） */
  startTime?: string;
  /** 结束时间（ISO 8601格式） */
  endTime?: string;
}

/**
 * 同步批次列表响应
 */
export interface SyncBatchListResponse {
  /** 批次列表 */
  batches: SyncBatch[];
  /** 分页信息 */
  pagination: {
    pageNum: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * 同步日志详情
 */
export interface SyncLog {
  /** 日志ID */
  id: string;
  /** 批次ID */
  batchId: string;
  /** 记录类型 */
  recordType: string;
  /** 记录标识符 */
  recordIdentifier: string;
  /** 操作类型 */
  operation: 'insert' | 'update' | 'delete';
  /** 状态 */
  status: 'success' | 'failed';
  /** 错误信息 */
  errorMessage: string;
  /** 错误代码 */
  errorCode: string;
  /** 记录详情（JSON对象） */
  recordDetails: Record<string, any>;
  /** 处理时间 */
  processedAt: string;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 同步触发请求
 */
export interface SyncTriggerRequest {
  /** 开始时间（可选，ISO 8601格式） */
  timeRangeStart?: string;
  /** 结束时间（可选，ISO 8601格式） */
  timeRangeEnd?: string;
}

/**
 * 完整顺序同步流程状态
 */
export interface OrderedFlowStatus {
  latestOrderedSync: {
    /** 组织同步批次 */
    orgBatch: {
      batchId: string;
      status: 'running' | 'success' | 'failed';
      startTime: string;
      endTime: string | null;
      durationMs: number | null;
      totalCount: number;
      successCount: number;
      failedCount: number;
    };
    /** 职务同步批次 */
    jobpostBatch: {
      batchId: string;
      status: 'running' | 'success' | 'failed';
      startTime: string;
      endTime: string | null;
      durationMs: number | null;
      totalCount: number;
      successCount: number;
      failedCount: number;
    };
    /** 员工同步批次 */
    employeeBatch: {
      batchId: string;
      status: 'running' | 'success' | 'failed';
      startTime: string;
      endTime: string | null;
      durationMs: number | null;
      totalCount: number;
      successCount: number;
      failedCount: number;
    };
    /** 总持续时间（毫秒） */
    totalDurationMs: number;
    /** 整体状态 */
    overallStatus: 'running' | 'success' | 'failed';
  };
}
