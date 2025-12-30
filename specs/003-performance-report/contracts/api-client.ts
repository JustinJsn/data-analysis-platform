/**
 * API 客户端接口定义：绩效数据报表
 *
 * 本文件定义了绩效数据报表功能的所有 API 接口
 *
 * @version 1.0
 * @date 2025-12-28
 */

/* ==================== 通用类型 ==================== */

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  page_size: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  total_pages: number;
}

/* ==================== 绩效数据查询 ==================== */

/**
 * 绩效数据查询参数
 */
export interface PerformanceReportQueryParams {
  // 年份段查询
  /** 开始年份 */
  start_year?: number;
  /** 结束年份 */
  end_year?: number;

  // 季度查询
  /** 开始时间（年份+季度，格式: "2025-Q1"） */
  start_year_quarter?: string;
  /** 结束时间（年份+季度，格式: "2025-Q4"） */
  end_year_quarter?: string;
  /** 查询长度（年数，1-10） */
  query_length?: number;

  // 人员查询
  /** 人员ID数组 */
  user_ids?: string[];

  // 部门查询
  /** 部门ID */
  department_id?: string;
  /** 是否包含下级部门 */
  include_sub_departments?: boolean;

  // 分页
  /** 页码（从1开始） */
  page?: number;
  /** 每页条数（10, 20, 50, 100） */
  page_size?: number;
}

/**
 * 绩效数据记录
 */
export interface PerformanceRecord {
  /** 绩效记录ID（主键） */
  id: string;
  /** 同步批次ID */
  batch_id: string;
  /** 外部系统ID */
  external_system_id: string;
  /** 员工ID */
  employee_id: string;
  /** 员工姓名 */
  employee_name: string;
  /** 员工工号 */
  employee_number: string;
  /** 员工用户ID */
  employee_user_id: string;
  /** 部门ID */
  department_id: string;
  /** 部门名称 */
  department_name: string;
  /** 部门路径（如："A部门/B部门/C部门"） */
  department_path: string;
  /** 组织全名 */
  organization_full_name: string;
  /** 组织路径ID（用/分隔） */
  organization_path_ids: string;
  /** 年份 */
  year: number;
  /** 季度（Q1/Q2/Q3/Q4） */
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** 绩效评级 */
  performance_rating: string;
  /** 绩效指标列表 */
  performance_indicators?: PerformanceIndicator[];
  /** 评价人ID */
  evaluator_id?: string;
  /** 评价时间 */
  evaluated_at?: string;
  /** 最后同步时间 */
  last_synced_at: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

/**
 * 绩效指标
 */
export interface PerformanceIndicator {
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: string | number;
  /** 指标类型 */
  type: 'number' | 'text' | 'rating';
}

/* ==================== 人员查询（用于选择器） ==================== */

/**
 * 人员查询参数
 */
export interface EmployeeQueryParams {
  /** 搜索关键词（姓名、工号） */
  keyword?: string;
  /** 部门ID（可选） */
  department_id?: string;
  /** 页码 */
  page?: number;
  /** 每页条数 */
  page_size?: number;
}

/**
 * 人员信息（用于选择器）
 */
export interface Employee {
  /** 人员ID */
  id: string;
  /** 姓名 */
  name: string;
  /** 工号 */
  employee_number: string;
  /** 部门ID */
  department_id: string;
  /** 部门名称 */
  department_name: string;
  /** 部门路径（如："A部门/B部门/C部门"） */
  department_path: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
}

/* ==================== 部门查询（用于选择器） ==================== */

/**
 * 部门信息（用于选择器）
 */
export interface Department {
  /** 部门ID */
  id: string;
  /** 部门名称 */
  name: string;
  /** 部门编码 */
  code: string;
  /** 父部门ID（根部门为null） */
  parent_id: string | null;
  /** 部门层级（根部门为1） */
  level: number;
  /** 部门路径（如："A部门/B部门/C部门"） */
  path: string;
  /** 子部门列表 */
  children?: Department[];
}

/* ==================== 导出相关 ==================== */

/**
 * 导出请求
 */
export interface ExportRequest {
  /** 查询参数 */
  query_params: PerformanceReportQueryParams;
  /** 导出类型：batch（批量）或 all（全量） */
  export_type: 'batch' | 'all';
  /** 导出格式：xlsx 或 csv */
  format: 'xlsx' | 'csv';
}

/**
 * 导出响应
 */
export interface ExportResponse {
  /** 任务ID（全量导出） */
  task_id?: string;
  /** 文件URL（批量导出直接返回） */
  file_url?: string;
  /** 状态 */
  status: 'processing' | 'completed' | 'failed';
  /** 错误信息（失败时） */
  error_message?: string;
}

/**
 * 导出任务状态
 */
export interface ExportTaskStatus {
  /** 任务ID */
  task_id: string;
  /** 状态 */
  status: 'processing' | 'completed' | 'failed';
  /** 进度（0-100） */
  progress?: number;
  /** 文件URL（完成时） */
  file_url?: string;
  /** 错误信息（失败时） */
  error_message?: string;
}

/* ==================== API 客户端接口 ==================== */

/**
 * 绩效数据报表 API 客户端
 */
export interface PerformanceReportApiClient {
  /**
   * 查询绩效数据
   *
   * @method GET
   * @path /api/v1/performance-reports
   * @param params 查询参数
   * @returns 分页的绩效数据列表
   *
   * @example
   * ```typescript
   * const response = await api.getReports({
   *   start_year: 2025,
   *   end_year: 2025,
   *   page: 1,
   *   page_size: 20,
   * });
   * ```
   */
  getReports(
    params?: PerformanceReportQueryParams,
  ): Promise<PaginatedResponse<PerformanceRecord>>;

  /**
   * 导出绩效数据
   *
   * @method POST
   * @path /api/v1/performance-reports/export
   * @param request 导出请求
   * @returns 导出响应（批量导出直接返回文件URL，全量导出返回任务ID）
   *
   * @example
   * ```typescript
   * // 批量导出
   * const response = await api.exportReports({
   *   query_params: { page: 1, page_size: 20 },
   *   export_type: 'batch',
   *   format: 'xlsx',
   * });
   *
   * // 全量导出
   * const response = await api.exportReports({
   *   query_params: { start_year: 2025, end_year: 2025 },
   *   export_type: 'all',
   *   format: 'xlsx',
   * });
   * ```
   */
  exportReports(request: ExportRequest): Promise<ExportResponse>;

  /**
   * 获取导出任务状态
   *
   * @method GET
   * @path /api/v1/performance-reports/export/:taskId/status
   * @param taskId 任务ID
   * @returns 导出任务状态
   *
   * @example
   * ```typescript
   * const status = await api.getExportTaskStatus('task-123');
   * if (status.status === 'completed') {
   *   // 下载文件
   *   downloadFile(status.file_url);
   * }
   * ```
   */
  getExportTaskStatus(taskId: string): Promise<ExportTaskStatus>;
}

/**
 * 人员 API 客户端（扩展，用于选择器）
 */
export interface EmployeeApiClient {
  /**
   * 获取人员列表（用于选择器）
   *
   * @method GET
   * @path /api/v1/employees
   * @param params 查询参数
   * @returns 分页的人员列表
   *
   * @example
   * ```typescript
   * const response = await api.getListForSelector({
   *   keyword: '张三',
   *   page: 1,
   *   page_size: 100,
   * });
   * ```
   */
  getListForSelector(
    params?: EmployeeQueryParams,
  ): Promise<PaginatedResponse<Employee>>;
}

/**
 * 部门 API 客户端（扩展，用于选择器）
 */
export interface DepartmentApiClient {
  /**
   * 获取部门树
   *
   * @method GET
   * @path /api/v1/organizations/tree
   * @returns 部门树
   *
   * @example
   * ```typescript
   * const tree = await api.getTree();
   * ```
   */
  getTree(): Promise<Department[]>;
}

/* ==================== 错误处理 ==================== */

/**
 * API 错误响应
 */
export interface ApiErrorResponse {
  /** 错误码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 请求追踪ID */
  request_id?: string;
  /** 详细错误信息 */
  details?: Record<string, unknown>;
}

/**
 * 常见错误码
 */
export enum ApiErrorCode {
  /** 参数错误 */
  INVALID_PARAMS = 400,
  /** 未授权 */
  UNAUTHORIZED = 401,
  /** 禁止访问 */
  FORBIDDEN = 403,
  /** 资源不存在 */
  NOT_FOUND = 404,
  /** 服务器错误 */
  INTERNAL_ERROR = 500,
  /** 服务不可用 */
  SERVICE_UNAVAILABLE = 503,
}

/* ==================== 类型守卫 ==================== */

/**
 * 检查是否为 API 错误响应
 */
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/* ==================== 工具类型 ==================== */

/**
 * 提取 API 响应类型
 */
export type ApiResponse<T> = T extends Promise<infer U> ? U : never;

/**
 * 提取 API 错误类型
 */
export type ApiError = ApiErrorResponse;
