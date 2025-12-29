/**
 * 通用类型定义
 */

/**
 * 统一响应结构（核心数据查询接口使用）
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
 * API 错误
 */
export interface ApiError {
  /** 错误消息 */
  error: string;
  /** HTTP 状态码 */
  status: number;
  /** 请求ID（如果有） */
  requestId?: string;
}

/**
 * 分页信息
 */
export interface PaginationInfo {
  /** 当前页码 */
  pageNum: number;
  /** 每页数量 */
  pageSize: number;
  /** 总记录数 */
  totalCount: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 菜单项
 */
export interface MenuItem {
  /** 菜单ID */
  id: string;
  /** 菜单名称 */
  name: string;
  /** 路由路径 */
  path: string;
  /** 图标 */
  icon?: string;
  /** 权限标识 */
  permission?: string;
  /** 子菜单 */
  children?: MenuItem[];
  /** 是否隐藏 */
  hidden?: boolean;
}

/**
 * 路由元信息（扩展 Vue Router 的 RouteMeta）
 */
export interface RouteMetaCustom {
  /** 页面标题 */
  title: string;
  /** 权限标识 */
  permission?: string;
  /** 是否需要认证 */
  requiresAuth?: boolean;
  /** 是否缓存 */
  keepAlive?: boolean;
  /** 图标 */
  icon?: string;
  /** 是否在菜单中隐藏 */
  hidden?: boolean;
}

/**
 * 面包屑项
 */
export interface Breadcrumb {
  /** 名称 */
  name: string;
  /** 路径 */
  path: string;
}
