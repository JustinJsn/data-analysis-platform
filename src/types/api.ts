/**
 * API 客户端接口定义
 *
 * 本文件定义了前端与后端交互的所有 API 接口
 * 基于后端 API 参考文档: docs/api-reference.md
 *
 * @version 1.0
 * @date 2025-12-23
 */

// 从其他类型文件导入所需类型
import type { User, LoginRequest, LoginResponse } from './auth';
import type { Employee } from './employee';
import type { Organization } from './organization';
import type { Position } from './position';
import type {
  SyncBatch,
  SyncBatchListResponse,
  SyncLog,
  SyncTriggerRequest,
  OrderedFlowStatus,
} from './sync';

/* ==================== API 专用类型 ==================== */

/**
 * 分页响应（API 接口使用）
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 当前页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 简单响应（同步触发接口）
 */
export interface SimpleResponse {
  /** 消息 */
  message: string;
  /** 状态（可选） */
  status?: string;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  /** 错误信息 */
  error: string;
}

/**
 * 同步类型
 */
export type SyncType = 'employee' | 'organization' | 'jobpost';

/**
 * 同步状态
 */
export type SyncStatus = 'running' | 'success' | 'failed' | 'partial_success';

/**
 * 触发模式
 */
export type TriggerMode = 'manual' | 'scheduled';

/**
 * 员工查询参数（API 使用）
 */
export interface EmployeeQueryParams {
  /** 页码（从1开始） */
  pageNum: number;
  /** 每页数量（1-100） */
  pageSize: number;
  /** 搜索关键词（姓名模糊匹配） */
  keyword?: string;
}

/**
 * 职务查询参数（API 使用）
 */
export interface PositionQueryParams {
  /** 页码（从1开始） */
  pageNum: number;
  /** 每页数量（1-100） */
  pageSize: number;
  /** 搜索关键词（职务名称模糊匹配） */
  keyword?: string;
}

/**
 * 同步批次查询参数（API 使用）
 */
export interface SyncBatchQueryParams {
  /** 页码 */
  page?: number;
  /** 每页数量（最大100） */
  pageSize?: number;
  /** 同步类型 */
  sync_type?: SyncType;
  /** 状态 */
  status?: SyncStatus;
  /** 触发模式 */
  trigger_mode?: TriggerMode;
  /** 开始时间范围-起 */
  start_time_from?: string;
  /** 开始时间范围-止 */
  start_time_to?: string;
}

/**
 * 批次详情响应（包含批次信息和日志）
 */
export interface SyncBatchDetailResponse {
  /** 批次信息 */
  batch: SyncBatch;
  /** 日志分页数据 */
  logs: {
    /** 总记录数 */
    total: number;
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    size: number;
    /** 日志列表 */
    logs: SyncLogRaw[];
  };
}

/**
 * 原始同步日志（后端返回格式）
 */
export interface SyncLogRaw {
  /** 日志ID */
  log_id: string;
  /** 批次ID */
  batch_id: string;
  /** 记录类型 */
  record_type: string;
  /** 记录ID */
  record_id: string;
  /** 状态 */
  status: 'success' | 'failed';
  /** 级别 */
  level: string;
  /** 消息 */
  message: string;
  /** 详情（JSON字符串） */
  details: string;
  /** 创建时间 */
  created_at: string;
}

/**
 * 批次日志响应
 */
export interface SyncBatchLogsResponse {
  /** 日志列表 */
  logs: SyncLog[];
  /** 总记录数 */
  totalCount: number;
}

/**
 * 当前运行状态
 */
export interface RunningStatus {
  /** 正在运行的批次列表 */
  runningBatches: Array<{
    batchId: string;
    syncType: SyncType;
    triggerMode: TriggerMode;
    status: 'running';
    startTime: string;
    elapsedMs: number;
  }>;
  /** 运行中批次总数 */
  totalRunning: number;
}

/* ==================== API 接口定义 ==================== */

/**
 * API 客户端接口
 */
export interface ApiClient {
  /* ========== 认证接口 ========== */

  /**
   * 用户登录
   * @param data 登录信息
   * @returns 登录响应（包含token和用户信息）
   */
  login(data: LoginRequest): Promise<LoginResponse>;

  /**
   * 用户登出
   */
  logout(): Promise<void>;

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  getUserInfo(): Promise<User>;

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌
   */
  refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; expiresIn: number }>;

  /* ========== 员工接口 ========== */

  /**
   * 查询员工列表
   * @param params 查询参数
   * @returns 员工列表（UnifiedResponse包装）
   */
  getEmployees(
    params: EmployeeQueryParams,
  ): Promise<PaginatedResponse<Employee>>;

  /**
   * 查询员工详情
   * @param id 员工ID
   * @returns 员工详情（UnifiedResponse包装）
   */
  getEmployeeDetail(id: string): Promise<Employee>;

  /* ========== 组织接口 ========== */

  /**
   * 查询组织树
   * @returns 组织树（UnifiedResponse包装）
   */
  getOrganizationTree(): Promise<Organization[]>;

  /* ========== 职务接口 ========== */

  /**
   * 查询职务列表
   * @param params 查询参数
   * @returns 职务列表（UnifiedResponse包装）
   */
  getPositions(
    params: PositionQueryParams,
  ): Promise<PaginatedResponse<Position>>;

  /* ========== 同步触发接口 ========== */

  /**
   * 触发员工同步
   * @param data 同步参数（可选时间范围）
   * @returns 触发响应
   */
  triggerEmployeeSync(data?: SyncTriggerRequest): Promise<SimpleResponse>;

  /**
   * 触发组织同步
   * @param data 同步参数（可选时间范围）
   * @returns 触发响应
   */
  triggerOrganizationSync(data?: SyncTriggerRequest): Promise<SimpleResponse>;

  /**
   * 触发职务同步
   * @param data 同步参数（可选时间范围）
   * @returns 触发响应
   */
  triggerJobPostSync(data?: SyncTriggerRequest): Promise<SimpleResponse>;

  /**
   * 触发完整顺序同步（组织 → 职务 → 员工）
   * @returns 触发响应
   */
  triggerOrderedSync(): Promise<SimpleResponse>;

  /* ========== 监控查询接口 ========== */

  /**
   * 查询同步批次列表
   * @param params 查询参数
   * @returns 批次列表
   */
  getSyncBatches(params?: SyncBatchQueryParams): Promise<SyncBatchListResponse>;

  /**
   * 查询批次详情
   * @param batchId 批次ID
   * @returns 批次详情
   */
  getSyncBatchDetail(batchId: string): Promise<SyncBatch>;

  /**
   * 查询批次日志
   * @param batchId 批次ID
   * @returns 批次日志
   */
  getSyncBatchLogs(batchId: string): Promise<SyncBatchLogsResponse>;

  /**
   * 查询完整同步流程状态
   * @param batchId 任一批次ID
   * @returns 完整流程状态
   */
  getOrderedFlowStatus(batchId: string): Promise<OrderedFlowStatus>;

  /**
   * 查询当前运行状态
   * @returns 运行状态
   */
  getCurrentRunningStatus(): Promise<RunningStatus>;

  /* ========== 健康检查接口 ========== */

  /**
   * 健康检查
   * @returns 健康状态
   */
  healthCheck(): Promise<{ status: string }>;

  /**
   * 就绪检查
   * @returns 就绪状态
   */
  readyCheck(): Promise<{ status: string; checks: Record<string, string> }>;
}

/**
 * API 端点常量
 */
export const API_ENDPOINTS = {
  // 认证
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  USER_INFO: '/api/auth/user',
  REFRESH_TOKEN: '/api/auth/refresh',

  // 员工
  EMPLOYEES: '/api/v1/employees',
  EMPLOYEE_DETAIL: (id: string) => `/api/v1/employees/${id}`,

  // 组织
  ORGANIZATION_TREE: '/api/v1/organizations/tree',

  // 职务
  POSITIONS: '/api/v1/positions',

  // 同步触发
  SYNC_EMPLOYEES: '/api/v1/sync/employees',
  SYNC_ORGANIZATIONS: '/api/v1/sync/organizations',
  SYNC_JOBPOSTS: '/api/v1/sync/jobposts',
  SYNC_ORDERED: '/api/v1/sync/ordered',

  // 监控查询
  SYNC_BATCHES: '/api/v1/sync/batches',
  SYNC_BATCH_DETAIL: (batchId: string) => `/api/v1/sync/batches/${batchId}`,
  SYNC_BATCH_LOGS: (batchId: string) => `/api/v1/sync/batches/${batchId}/logs`,
  SYNC_ORDERED_FLOW_STATUS: '/api/v1/sync/ordered-flow-status',
  SYNC_STATUS: '/api/v1/sync/status',

  // 健康检查
  HEALTH: '/health',
  READY: '/ready',
} as const;

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * 业务状态码（核心数据查询接口）
 */
export const BUSINESS_CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 400,
  NOT_FOUND: 404,
  DATABASE_ERROR: 500,
} as const;

/* ==================== 重新导出（供其他模块使用） ==================== */

// 重新导出通用类型
export type { UnifiedResponse } from './common';

// 重新导出认证相关类型
export type { User, LoginRequest, LoginResponse } from './auth';

// 重新导出员工相关类型
export type { Employee, EmployeeFilters } from './employee';

// 重新导出组织相关类型
export type { Organization } from './organization';

// 重新导出职务相关类型
export type { Position, PositionFilters } from './position';

// 重新导出同步相关类型
export type {
  SyncBatch,
  SyncBatchListResponse,
  SyncLog,
  SyncTriggerRequest,
  OrderedFlowStatus,
} from './sync';
