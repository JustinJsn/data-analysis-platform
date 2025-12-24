/**
 * 组织架构相关 API
 */
import { request } from '@/utils/request';
import type { Organization } from '@/types/api';

export const organizationApi = {
  /**
   * 获取组织树
   */
  getTree() {
    return request.get<Organization[]>('/api/v1/organizations/tree');
  },
};
