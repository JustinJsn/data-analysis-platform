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
 */
export interface BusinessQueryResponse {
  /** 数据列表 */
  list: BusinessQueryRecord[];
  /** 总记录数 */
  total: number;
}
