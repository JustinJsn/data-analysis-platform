/**
 * 认证相关 API
 */
import { request } from '@/utils/request';
import type { LoginRequest, LoginResponse, User } from '@/types/api';

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
