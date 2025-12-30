/**
 * 类型定义统一导出
 */

// 通用类型（必须先导出，因为其他类型可能依赖它）
export type * from './common';

// 认证相关
export type * from './auth';

// 员工相关
export type * from './employee';

// 组织架构相关
export type * from './organization';

// 职务相关
export type * from './position';

// 同步任务相关
export type * from './sync';

// 绩效数据相关
export type * from './performance';

// 绩效数据报表相关
export type * from './performance-report';

// API 相关类型（最后导出，包含 API 客户端接口和专用类型）
// 注意：这里只导出 API 特有的类型，避免与上面的类型冲突
export type {
  // API 专用类型
  PaginatedResponse,
  SimpleResponse,
  ErrorResponse,
  SyncType,
  SyncStatus,
  TriggerMode,
  EmployeeQueryParams,
  PositionQueryParams,
  SyncBatchQueryParams,
  SyncBatchDetailResponse,
  SyncLogRaw,
  SyncBatchLogsResponse,
  RunningStatus,
  // API 客户端接口
  ApiClient,
} from './api';

// 导出 API 常量
export { API_ENDPOINTS, HTTP_STATUS, BUSINESS_CODE } from './api';
