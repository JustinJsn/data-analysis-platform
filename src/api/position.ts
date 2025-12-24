/**
 * 职务相关 API
 */
import { request } from '@/utils/request';
import type {
  Position,
  PositionQueryParams,
  PaginatedResponse,
} from '@/types/api';

export const positionApi = {
  /**
   * 获取职务列表
   */
  getList(filters: PositionQueryParams) {
    return request.get<PaginatedResponse<Position>>('/api/v1/positions', {
      params: filters,
    });
  },
};
