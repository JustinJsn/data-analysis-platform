/**
 * 员工相关类型定义
 */

/**
 * 员工信息（对应 API 的 EmployeeVO）
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
  /** 所属组织ID（可能为null） */
  organizationId: string | null;
  /** 所属组织名称（可能为null） */
  organizationName: string | null;
  /** 职务ID（可能为null） */
  jobPostId: string | null;
  /** 职务名称（可能为null） */
  jobPostName: string | null;
}

/**
 * 员工列表筛选条件
 */
export interface EmployeeFilters {
  /** 页码（从1开始） */
  pageNum: number;
  /** 每页数量（1-100） */
  pageSize: number;
  /** 搜索关键词（姓名模糊匹配） */
  keyword?: string;
}

/**
 * 员工列表响应
 */
export interface EmployeeListResponse {
  /** 员工列表 */
  list: Employee[];
  /** 当前页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}
