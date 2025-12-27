/**
 * 绩效数据相关类型定义
 */

/**
 * 绩效数据
 */
export interface PerformanceReport {
  /** 绩效记录ID */
  id: string;
  /** 同步批次ID */
  batch_id: string;
  /** 外部系统ID */
  external_system_id: string;
  /** 年份 */
  year: number;
  /** 季度（Q1/Q2/Q3/Q4） */
  quarter: string;
  /** 员工姓名 */
  employee_name: string;
  /** 员工用户ID */
  employee_user_id: string;
  /** 组织全名 */
  organization_full_name: string;
  /** 组织路径ID（用/分隔） */
  organization_path_ids: string;
  /** 绩效评级 */
  performance_rating: string;
  /** 最后同步时间 */
  last_synced_at: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

/**
 * 绩效数据查询参数
 */
export interface PerformanceReportQueryParams {
  /** 页码（从1开始） */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
  /** 年份筛选 */
  year?: number;
  /** 季度筛选 */
  quarter?: string;
  /** 员工姓名搜索 */
  employee_name?: string;
  /** 员工用户ID搜索 */
  employee_user_id?: string;
  /** 组织路径ID筛选 */
  organization_path_ids?: string;
  /** 绩效评级筛选 */
  performance_rating?: string;
}

/**
 * 绩效数据筛选条件
 */
export interface PerformanceReportFilters {
  /** 年份 */
  year?: number;
  /** 季度 */
  quarter?: string;
  /** 员工姓名 */
  employee_name?: string;
  /** 员工用户ID */
  employee_user_id?: string;
  /** 组织路径ID */
  organization_path_ids?: string;
  /** 绩效评级 */
  performance_rating?: string;
}

/**
 * 绩效数据同步请求
 */
export interface PerformanceSyncRequest {
  /** 同步类型：incremental（增量）或 full（全量） */
  sync_type?: 'incremental' | 'full';
  /** 外部系统ID（可选，不传则同步所有数据源） */
  external_system_id?: string;
  /** 时间范围开始（可选，ISO 8601格式） */
  time_range_start?: string;
  /** 时间范围结束（可选，ISO 8601格式） */
  time_range_end?: string;
}

/**
 * 绩效数据同步响应
 */
export interface PerformanceSyncResponse {
  /** 响应消息 */
  message: string;
  /** 批次ID（同步任务ID） */
  batch_id?: string;
  /** 同步状态 */
  status?: string;
}
