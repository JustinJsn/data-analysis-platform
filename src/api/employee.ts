/**
 * 员工相关 API
 */
import { request } from '@/utils/request';
import type {
  Employee,
  EmployeeQueryParams,
  PaginatedResponse,
} from '@/types/api';

export const employeeApi = {
  /**
   * 获取员工列表
   */
  getList(filters: EmployeeQueryParams) {
    return request.get<PaginatedResponse<Employee>>('/api/v1/employees', {
      params: filters,
    });
  },

  /**
   * 获取员工详情
   */
  getDetail(id: string) {
    return request.get<Employee>(`/api/v1/employees/${id}`);
  },
};
