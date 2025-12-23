/**
 * API 服务
 */
import { request } from '@/utils/request';
import type {
  LoginRequest,
  LoginResponse,
  User,
  EmployeeVO,
  EmployeeListFilters,
  EmployeeListResponse,
  OrganizationTreeNodeVO,
  PositionVO,
  PositionListFilters,
  PositionListResponse,
  SyncBatchVO,
  SyncBatchFilters,
  SyncBatchListResponse,
  SyncBatchLogResponse,
  SyncTriggerRequest,
  OrderedFlowStatusResponse,
  SimpleResponse,
} from '@/types/api';

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 登录
   */
  login(data: LoginRequest) {
    return request.post<LoginResponse>('/api/auth/login', data);
  },

  /**
   * 获取当前用户信息
   */
  getUserInfo() {
    return request.get<User>('/api/auth/user');
  },

  /**
   * 登出
   */
  logout() {
    return request.post<void>('/api/auth/logout');
  },
};

/**
 * 员工相关 API
 */
export const employeeApi = {
  /**
   * 获取员工列表
   */
  getList(filters: EmployeeListFilters) {
    return request.get<EmployeeListResponse>('/api/v1/employees', {
      params: filters,
    });
  },

  /**
   * 获取员工详情
   */
  getDetail(id: string) {
    return request.get<EmployeeVO>(`/api/v1/employees/${id}`);
  },
};

/**
 * 组织架构相关 API
 */
export const organizationApi = {
  /**
   * 获取组织树
   */
  getTree() {
    return request.get<OrganizationTreeNodeVO[]>('/api/v1/organizations/tree');
  },
};

/**
 * 职务相关 API
 */
export const positionApi = {
  /**
   * 获取职务列表
   */
  getList(filters: PositionListFilters) {
    return request.get<PositionListResponse>('/api/v1/positions', {
      params: filters,
    });
  },
};

/**
 * 同步任务相关 API
 */
export const syncApi = {
  /**
   * 获取批次列表
   */
  getBatches(filters: SyncBatchFilters) {
    return request.get<SyncBatchListResponse>('/api/v1/sync/batches', {
      params: filters,
    });
  },

  /**
   * 获取批次详情
   */
  getBatchDetail(batchId: string) {
    return request.get<SyncBatchVO>(`/api/v1/sync/batches/${batchId}`);
  },

  /**
   * 获取批次日志
   */
  getBatchLogs(batchId: string) {
    return request.get<SyncBatchLogResponse>(
      `/api/v1/sync/batches/${batchId}/logs`,
    );
  },

  /**
   * 触发员工同步
   */
  triggerEmployeeSync(data?: SyncTriggerRequest) {
    return request.post<SimpleResponse>('/api/v1/sync/employees', data);
  },

  /**
   * 触发组织同步
   */
  triggerOrganizationSync(data?: SyncTriggerRequest) {
    return request.post<SimpleResponse>('/api/v1/sync/organizations', data);
  },

  /**
   * 触发职务同步
   */
  triggerPositionSync(data?: SyncTriggerRequest) {
    return request.post<SimpleResponse>('/api/v1/sync/jobposts', data);
  },

  /**
   * 触发完整同步
   */
  triggerOrderedSync() {
    return request.post<SimpleResponse>('/api/v1/sync/ordered-flow');
  },

  /**
   * 获取完整同步流程状态
   */
  getOrderedFlowStatus(batchId: string) {
    return request.get<OrderedFlowStatusResponse>(
      `/api/v1/sync/ordered-flow/${batchId}/status`,
    );
  },
};

/**
 * 默认导出所有 API
 */
export default {
  auth: authApi,
  employee: employeeApi,
  organization: organizationApi,
  position: positionApi,
  sync: syncApi,
};
