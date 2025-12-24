/**
 * API 客户端接口定义
 *
 * 本文件定义了前端与后端交互的所有 API 接口
 * 基于后端 API 参考文档: docs/api-reference.md
 *
 * @version 1.0
 * @date 2025-12-23
 */

/* ==================== 通用类型 ==================== */

/**
 * 统一响应结构（核心数据查询接口）
 */
export interface UnifiedResponse<T = any> {
  /** 业务状态码（200=成功） */
  code: number;
  /** 响应消息 */
  message: string;
  /** 请求追踪ID */
  requestId: string;
  /** 实际数据 */
  data: T;
}

/**
 * 分页响应
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

/* ==================== 认证相关 ==================== */

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 过期时间（秒） */
  expiresIn: number;
  /** 令牌类型 */
  tokenType: 'Bearer';
  /** 用户信息 */
  user: User;
}

/**
 * 用户信息
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 姓名 */
  name: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  phone?: string;
  /** 角色列表 */
  roles: string[];
  /** 权限码列表 */
  permissions: string[];
  /** 头像URL */
  avatar?: string;
}

/* ==================== 员工相关 ==================== */

/**
 * 员工信息
 */
export interface Employee {
  /** 员工内部ID */
  id: string;
  /** 员工工号 */
  employeeNo: string;
  /** 员工姓名 */
  name: string;
  /** 邮箱地址 */
  email: string;
  /** 手机号码 */
  phone: string;
  /** 入职日期（ISO 8601格式） */
  employmentDate: string;
  /** 在职状态 */
  employmentStatus: string;
  /** 职务（字符串） */
  position: string;
  /** 所属组织ID */
  organizationId: string | null;
  /** 所属组织名称 */
  organizationName: string | null;
  /** 职务ID */
  jobPostId: string | null;
  /** 职务名称 */
  jobPostName: string | null;
}

/**
 * 员工查询参数
 */
export interface EmployeeQueryParams {
  /** 页码（从1开始） */
  pageNum: number;
  /** 每页数量（1-100） */
  pageSize: number;
  /** 搜索关键词（姓名模糊匹配） */
  keyword?: string;
}

/* ==================== 组织相关 ==================== */

/**
 * 组织树节点
 */
export interface Organization {
  /** 组织ID */
  id: string;
  /** 组织名称 */
  name: string;
  /** 组织编码 */
  code: string;
  /** 父组织ID */
  parentId: string | null;
  /** 组织层级 */
  level: number;
  /** 子组织列表 */
  children: Organization[];
}

/* ==================== 职务相关 ==================== */

/**
 * 职务信息
 */
export interface Position {
  /** 职务ID */
  id: string;
  /** 职务名称 */
  name: string;
  /** 职务编码 */
  code: string;
}

/**
 * 职务查询参数
 */
export interface PositionQueryParams {
  /** 页码（从1开始） */
  pageNum: number;
  /** 每页数量（1-100） */
  pageSize: number;
  /** 搜索关键词（职务名称模糊匹配） */
  keyword?: string;
}

/* ==================== 同步任务相关 ==================== */

/**
 * 同步类型
 */
export type SyncType = 'employee' | 'organization' | 'jobpost';

/**
 * 同步状态
 */
export type SyncStatus = 'running' | 'success' | 'failed';

/**
 * 触发模式
 */
export type TriggerMode = 'manual' | 'scheduled';

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
 * 同步批次信息
 */
export interface SyncBatch {
  /** 批次ID */
  id: string;
  /** 批次ID（兼容字段） */
  batchId: string;
  /** 同步类型 */
  syncType: SyncType;
  /** 触发模式 */
  triggerMode: TriggerMode;
  /** 状态 */
  status: SyncStatus;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string | null;
  /** 持续时间（毫秒） */
  durationMs: number | null;
  /** 总记录数 */
  totalCount: number;
  /** 成功记录数 */
  successCount: number;
  /** 失败记录数 */
  failedCount: number;
  /** 错误摘要 */
  errorSummary: string;
  /** 时间范围开始 */
  timeRangeStart: string | null;
  /** 时间范围结束 */
  timeRangeEnd: string | null;
  /** 父批次ID */
  parentBatchId: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 同步批次查询参数
 */
export interface SyncBatchQueryParams {
  /** 页码 */
  page?: number;
  /** 每页数量（最大100） */
  pageSize?: number;
  /** 同步类型 */
  syncType?: SyncType;
  /** 状态 */
  status?: SyncStatus;
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
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

/**
 * 同步日志
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
  /** 记录详情 */
  recordDetails: Record<string, any>;
  /** 处理时间 */
  processedAt: string;
  /** 创建时间 */
  createdAt: string;
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
 * 完整同步流程状态
 */
export interface OrderedFlowStatus {
  latestOrderedSync: {
    /** 组织同步批次 */
    orgBatch: {
      batchId: string;
      status: SyncStatus;
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
      status: SyncStatus;
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
      status: SyncStatus;
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
    overallStatus: SyncStatus;
  };
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
