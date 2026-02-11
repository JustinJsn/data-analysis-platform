/**
 * 绩效数据报表相关类型定义
 */

import type { PaginatedResponse } from './api';

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
  pageNum?: number;
  /** 每页条数（10, 20, 50, 100） */
  pageSize?: number;
}

/**
 * 绩效数据业务查询参数（business-query 接口）
 */
export interface PerformanceReportBusinessQueryParams {
  /** 页码（从1开始），最小值：1，默认：1 */
  pageNum?: number;
  /** 每页条数，范围：1-100，默认：20 */
  pageSize?: number;
  /** 开始年份（2000-2100） */
  start_year?: number;
  /** 结束年份（2000-2100） */
  end_year?: number;
  /** 开始季度，枚举值：Q1、Q2、Q3、Q4 */
  start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** 结束季度，枚举值：Q1、Q2、Q3、Q4 */
  end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** 员工UserId列表，逗号分隔，最多100个，每个ID最长50字符，总长度不超过5000字符 */
  employee_user_ids?: string;
  /** 部门ID（UUID格式） */
  organization_id?: string;
  /** 是否包含下级部门，默认：false */
  include_children?: boolean;
  /** 批次ID（UUID格式），不指定时使用最新批次 */
  batch_id?: string;
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

/* ==================== 时间范围相关 ==================== */

/**
 * 季度时间
 */
export interface QuarterTime {
  /** 年份 */
  year: number;
  /** 季度（1-4） */
  quarter: 1 | 2 | 3 | 4;
}

/**
 * 时间范围
 */
export interface TimeRange {
  /** 开始时间 */
  start: Date;
  /** 结束时间 */
  end: Date;
}

/* ==================== 人员选择器相关 ==================== */

/**
 * 人员信息（用于选择器）
 */
export interface EmployeeForSelector {
  /** 人员ID */
  id: string;
  /** 姓名 */
  name: string;
  /** 工号 */
  employeeNumber: string;
  /** 部门ID */
  departmentId: string;
  /** 部门名称 */
  departmentName: string;
  /** 部门路径（如："A部门/B部门/C部门"） */
  departmentPath: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
}

/**
 * 人员查询参数
 */
export interface EmployeeQueryParams {
  /** 搜索关键词（姓名、工号） */
  keyword?: string;
  /** 部门ID（可选） */
  department_id?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/* ==================== 部门选择器相关 ==================== */

/**
 * 部门信息（用于选择器）
 */
export interface DepartmentForSelector {
  /** 部门ID */
  id: string;
  /** 部门名称 */
  name: string;
  /** 部门编码 */
  code: string;
  /** 父部门ID（根部门为null） */
  parentId: string | null;
  /** 部门层级（根部门为1） */
  level: number;
  /** 部门路径（如："A部门/B部门/C部门"） */
  path: string;
  /** 子部门列表 */
  children?: DepartmentForSelector[];
}

/* ==================== 导出相关 ==================== */

/**
 * 导出请求（根据API文档：POST /api/v1/performance-reports/export）
 *
 * 注意：根据API文档，导出接口直接使用查询参数，不区分批量/全量
 * 批量导出由前端处理当前页数据，全量导出由后端处理所有数据
 */
export interface ExportRequest {
  /** 导出格式，支持 xlsx 或 xls */
  format: 'xlsx' | 'xls';
  /** 开始年份（2000-2100） */
  start_year?: number;
  /** 结束年份（2000-2100） */
  end_year?: number;
  /** 开始季度，必须与 end_quarter 同时提供 */
  start_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** 结束季度，必须与 start_quarter 同时提供 */
  end_quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** 员工 UserId 列表（北森ID/BeisenID，数字格式字符串），逗号分隔，最多 100 个 */
  employee_user_ids?: string;
  /** 部门 ID（UUID 格式），系统内部会转换为北森ID进行查询 */
  organization_id?: string;
  /** 是否包含下级部门，默认 false */
  include_children?: boolean;
  /** 批次 ID（UUID 格式），默认使用最新批次 */
  batch_id?: string;
}

/**
 * 导出响应
 *
 * 注意：根据API文档，导出接口直接返回CSV文件流（Content-Type: text/csv; charset=utf-8）
 * 响应头包含 Content-Disposition: attachment; filename=performance_reports_YYYYMMDD_HHMMSS.csv
 * 因此不需要JSON响应体，直接处理文件流即可
 */
export interface ExportResponse {
  /** 文件Blob对象（用于下载） */
  blob: Blob;
  /** 文件名（从Content-Disposition头提取） */
  filename: string;
}

/**
 * 导出任务状态（如果后端支持异步导出任务）
 *
 * 注意：根据API文档，导出接口是同步的，直接返回CSV文件流
 * 如果未来需要支持异步导出，可以使用此接口
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

/* ==================== API 响应类型 ==================== */

/**
 * 绩效数据列表响应
 */
export type PerformanceRecordListResponse =
  PaginatedResponse<PerformanceRecord>;

/**
 * 人员列表响应（用于选择器）
 */
export type EmployeeListForSelectorResponse =
  PaginatedResponse<EmployeeForSelector>;

/* ==================== Business Query 响应类型 ==================== */

/**
 * Business Query 接口的响应数据结构
 */
export interface BusinessQueryRecord {
  /** 员工工号 */
  employeeNo: string;
  /** 员工姓名 */
  name: string;
  /** 一级部门 */
  level1Department: string | null;
  /** 二级部门 */
  level2Department: string | null;
  /** 三级部门 */
  level3Department: string | null;
  /** 四级部门 */
  level4Department: string | null;
  /** 入职日期 */
  employmentDate: string | null;
  /** 职务 */
  position: string | null;
  /** 年度数据对象（如 year2025, year2024 等） */
  [key: `year${number}`]: Record<string, any> | undefined;
  /** 季度评级（如 2025Q3, 2025Q2 等） */
  [key: `${number}Q${1 | 2 | 3 | 4}`]: string | undefined;
  /** S级评级次数 */
  ratingCountS: number;
  /** A级评级次数 */
  ratingCountA: number;
  /** B级评级次数 */
  ratingCountB: number;
  /** C级评级次数 */
  ratingCountC: number;
  /** D级评级次数 */
  ratingCountD: number;
}

/**
 * Business Query 接口的响应类型
 *
 * 注意：根据API文档，响应格式为：
 * {
 *   "code": 200,
 *   "message": "success",
 *   "data": { ... },
 *   "request_id": "xxx-xxx-xxx"
 * }
 *
 * 响应拦截器会提取data字段，所以这里定义的是data部分的结构
 */
export interface BusinessQueryResponse {
  /** 数据列表 */
  list: BusinessQueryRecord[];
  /** 当前页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

/* ==================== 年度绩效显示相关 ==================== */

/**
 * 年度绩效提取结果
 *
 * 从 BusinessQueryRecord 的 year2025/year2024 字段中提取的年度绩效数据
 *
 * @example
 * { year: 2025, rating: "A" }      // 有年度评级
 * { year: 2024, rating: null }     // 暂无年度评级
 */
export interface AnnualRatingData {
  /** 年份（如 2025, 2024） */
  year: number;

  /**
   * 绩效评级（S/A/B/C/D）或 null（无评级）
   *
   * 有效值: "S", "A", "B", "C", "D", null
   * null 表示: 无评级、空对象 {}、undefined 或字段不存在
   */
  rating: string | null;
}

/**
 * 年度绩效列定义（用于 el-table-v2）
 *
 * 定义年度绩效列在绩效报表中的显示结构
 * 与季度列结构相似，但使用 "年度" 后缀而不是 "Q1/Q2/Q3/Q4"
 *
 * @example
 * {
 *   year: 2025,
 *   key: "2025-年度",
 *   title: "2025年度",
 *   dataKey: "performance_data.2025-年度",
 *   width: 100,
 *   fixed: false,
 *   align: 'center'
 * }
 */
export interface AnnualColumn {
  /** 该列代表的年份（如 2025） */
  year: number;

  /**
   * el-table-v2 的唯一列标识
   * 格式: "${year}-年度"（如 "2025-年度"）
   * 与季度模式匹配: "${year}-Q${quarter}"（如 "2025-Q4"）
   */
  key: string;

  /**
   * 显示给用户的列标题
   * 格式: "${year}年度"（如 "2025年度"）
   */
  title: string;

  /**
   * PerformanceTableRow 对象中的数据路径
   * 格式: "performance_data.${year}-年度"
   * 用于 el-table-v2 访问单元格数据
   */
  dataKey: string;

  /** 列宽（像素，通常为 100px） */
  width: number;

  /** 水平滚动时是否固定（通常为 false） */
  fixed: boolean;

  /** 单元格内文本对齐方式（评级始终为 'center'） */
  align: 'center';
}
