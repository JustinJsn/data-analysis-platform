/**
 * Auth Store - 认证状态管理
 */
import { defineStore } from 'pinia';
import type { User, LoginRequest, LoginResponse } from '@/types/api';
import { authApi } from '@/api';

interface AuthState {
  /** 访问令牌 */
  token: string | null;
  /** 刷新令牌 */
  refreshToken: string | null;
  /** 用户信息 */
  userInfo: User | null;
  /** 权限列表 */
  permissions: string[];
  /** 是否正在登录 */
  isLoggingIn: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    userInfo: null,
    permissions: [],
    isLoggingIn: false,
  }),

  getters: {
    /** 是否已认证 */
    isAuthenticated: (state) => !!state.token,

    /** 检查是否有指定权限 */
    hasPermission: (state) => (permission: string) => {
      return state.permissions.includes(permission);
    },

    /** 检查是否有任一权限 */
    hasAnyPermission: (state) => (permissions: string[]) => {
      return permissions.some((p) => state.permissions.includes(p));
    },

    /** 检查是否有所有权限 */
    hasAllPermissions: (state) => (permissions: string[]) => {
      return permissions.every((p) => state.permissions.includes(p));
    },

    /** 用户名 */
    username: (state) => state.userInfo?.username || '',

    /** 用户姓名 */
    name: (state) => state.userInfo?.name || '',

    /** 用户头像 */
    avatar: (state) => state.userInfo?.avatar || '',
  },

  actions: {
    /**
     * 登录
     */
    async login(loginData: LoginRequest) {
      this.isLoggingIn = true;
      try {
        const response = await authApi.login(loginData);
        this.setAuth(response);
      } finally {
        this.isLoggingIn = false;
      }
    },

    /**
     * 设置认证信息
     */
    setAuth(authData: LoginResponse) {
      this.token = authData.accessToken;
      this.refreshToken = authData.refreshToken;
      this.userInfo = authData.user;
      this.permissions = authData.user.permissions;

      localStorage.setItem('access_token', authData.accessToken);
      localStorage.setItem('refresh_token', authData.refreshToken);
    },

    /**
     * 登出
     */
    async logout() {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('登出失败:', error);
      } finally {
        this.clearAuth();
      }
    },

    /**
     * 清除认证信息
     */
    clearAuth() {
      this.token = null;
      this.refreshToken = null;
      this.userInfo = null;
      this.permissions = [];

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },

    /**
     * 刷新用户信息
     */
    async refreshUserInfo() {
      if (!this.isAuthenticated) return;

      try {
        const userInfo = await authApi.getUserInfo();
        this.userInfo = userInfo;
        this.permissions = userInfo.permissions;
      } catch (error) {
        console.error('刷新用户信息失败:', error);
      }
    },
  },
});
