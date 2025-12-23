/**
 * 职务相关类型定义
 */

/**
 * 职务信息（对应 API 的 PositionVO）
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
 * 职务列表筛选条件
 */
export interface PositionFilters {
  /** 页码（从1开始） */
  pageNum: number;
  /** 每页数量（1-100） */
  pageSize: number;
  /** 搜索关键词（职务名称模糊匹配） */
  keyword?: string;
}

/**
 * 职务列表响应
 */
export interface PositionListResponse {
  /** 职务列表 */
  list: Position[];
  /** 当前页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}
