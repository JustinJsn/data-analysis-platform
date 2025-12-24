/**
 * Employee Store 测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEmployeeStore } from '@/stores/employee';

// Mock API
vi.mock('@/api', () => ({
  employeeApi: {
    getList: vi.fn(),
    getDetail: vi.fn(),
  },
}));

import { employeeApi } from '@/api';

describe('Employee Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const store = useEmployeeStore();
      expect(store.list).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.loading).toBe(false);
      expect(store.filters).toEqual({
        pageNum: 1,
        pageSize: 20,
        keyword: '',
      });
      expect(store.currentEmployee).toBeNull();
    });
  });

  describe('Getters', () => {
    it('totalPages 应该正确计算总页数', () => {
      const store = useEmployeeStore();
      store.total = 45;
      store.filters.pageSize = 20;
      expect(store.totalPages).toBe(3);

      store.total = 40;
      expect(store.totalPages).toBe(2);

      store.total = 0;
      expect(store.totalPages).toBe(0);
    });
  });

  describe('Actions', () => {
    it('fetchList 应该获取员工列表', async () => {
      const store = useEmployeeStore();
      const mockData = {
        list: [
          {
            id: '1',
            employeeNumber: 'E001',
            name: '张三',
            mobile: '13800138000',
            email: 'zhangsan@example.com',
            organizationId: 'org1',
            organizationName: '技术部',
            organizationCode: 'TECH',
            positionId: 'pos1',
            positionName: '工程师',
            positionCode: 'ENG',
            status: 'active' as const,
            hireDate: '2024-01-01',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      vi.mocked(employeeApi.getList).mockResolvedValue(mockData);

      await store.fetchList();

      expect(store.list).toEqual(mockData.list);
      expect(store.total).toBe(1);
      expect(store.loading).toBe(false);
    });

    it('fetchList 失败时应该清空列表', async () => {
      const store = useEmployeeStore();
      store.list = [{ id: '1' } as any];
      store.total = 1;

      vi.mocked(employeeApi.getList).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(store.fetchList()).rejects.toThrow('Network error');
      expect(store.list).toEqual([]);
      expect(store.total).toBe(0);
      expect(store.loading).toBe(false);
    });

    it('setPage 应该设置页码', () => {
      const store = useEmployeeStore();
      store.setPage(3);
      expect(store.filters.pageNum).toBe(3);
    });

    it('setKeyword 应该设置关键词并重置页码', () => {
      const store = useEmployeeStore();
      store.filters.pageNum = 3;
      store.setKeyword('测试');

      expect(store.filters.keyword).toBe('测试');
      expect(store.filters.pageNum).toBe(1);
    });

    it('resetFilters 应该重置筛选条件', () => {
      const store = useEmployeeStore();
      store.filters.pageNum = 3;
      store.filters.pageSize = 50;
      store.filters.keyword = '测试';

      store.resetFilters();

      expect(store.filters).toEqual({
        pageNum: 1,
        pageSize: 20,
        keyword: '',
      });
    });
  });
});
