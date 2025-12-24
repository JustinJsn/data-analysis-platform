/**
 * Auth Store 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

// Mock API
vi.mock('@/api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getUserInfo: vi.fn(),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // 每个测试前创建新的 Pinia 实例
    setActivePinia(createPinia());
    // 清除 localStorage mock
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useAuthStore();
      expect(store.token).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.permissions).toEqual([]);
      expect(store.isLoggingIn).toBe(false);
    });

    it('应该从 localStorage 加载 token', () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh-token');

      setActivePinia(createPinia());
      const store = useAuthStore();

      expect(store.token).toBe('test-token');
      expect(store.refreshToken).toBe('test-refresh-token');
    });
  });

  describe('Getters', () => {
    it('isAuthenticated 应该在有 token 时返回 true', () => {
      const store = useAuthStore();
      expect(store.isAuthenticated).toBe(false);

      store.token = 'test-token';
      expect(store.isAuthenticated).toBe(true);
    });

    it('hasPermission 应该正确检查权限', () => {
      const store = useAuthStore();
      store.permissions = ['user:read', 'user:write'];

      expect(store.hasPermission('user:read')).toBe(true);
      expect(store.hasPermission('user:delete')).toBe(false);
    });

    it('hasAnyPermission 应该正确检查任一权限', () => {
      const store = useAuthStore();
      store.permissions = ['user:read', 'user:write'];

      expect(store.hasAnyPermission(['user:read', 'user:delete'])).toBe(true);
      expect(store.hasAnyPermission(['user:delete', 'admin:write'])).toBe(
        false,
      );
    });

    it('hasAllPermissions 应该正确检查所有权限', () => {
      const store = useAuthStore();
      store.permissions = ['user:read', 'user:write'];

      expect(store.hasAllPermissions(['user:read', 'user:write'])).toBe(true);
      expect(store.hasAllPermissions(['user:read', 'user:delete'])).toBe(false);
    });

    it('username 应该返回用户名或空字符串', () => {
      const store = useAuthStore();
      expect(store.username).toBe('');

      store.userInfo = {
        id: '1',
        username: 'admin',
        name: 'Admin',
        permissions: [],
      };
      expect(store.username).toBe('admin');
    });
  });

  describe('Actions', () => {
    it('setAuth 应该设置认证信息', () => {
      const store = useAuthStore();
      const authData = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: '1',
          username: 'admin',
          name: 'Admin',
          permissions: ['user:read'],
        },
      };

      store.setAuth(authData);

      expect(store.token).toBe('test-access-token');
      expect(store.refreshToken).toBe('test-refresh-token');
      expect(store.userInfo).toEqual(authData.user);
      expect(store.permissions).toEqual(['user:read']);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'test-access-token',
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'test-refresh-token',
      );
    });

    it('clearAuth 应该清除认证信息', () => {
      const store = useAuthStore();
      store.token = 'test-token';
      store.refreshToken = 'test-refresh-token';
      store.userInfo = {
        id: '1',
        username: 'admin',
        name: 'Admin',
        permissions: ['user:read'],
      };
      store.permissions = ['user:read'];

      store.clearAuth();

      expect(store.token).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.userInfo).toBeNull();
      expect(store.permissions).toEqual([]);
      expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });
});
