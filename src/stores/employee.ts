/**
 * Employee Store - 员工数据管理
 *
 * 负责员工数据的状态管理、列表查询、详情获取等功能
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Employee, EmployeeQueryParams } from '@/types/api';
import { employeeApi } from '@/api';

export const useEmployeeStore = defineStore('employee', () => {
  // ==================== State ====================

  /** 员工列表 */
  const list = ref<Employee[]>([]);

  /** 总记录数 */
  const total = ref(0);

  /** 加载状态 */
  const loading = ref(false);

  /** 筛选条件 */
  const filters = ref<EmployeeQueryParams>({
    pageNum: 1,
    pageSize: 20,
    keyword: '',
  });

  /** 当前查看的员工详情 */
  const currentEmployee = ref<Employee | null>(null);

  // ==================== Getters ====================

  /** 总页数 */
  const totalPages = computed(() => {
    return Math.ceil(total.value / filters.value.pageSize);
  });

  // ==================== Actions ====================

  /**
   * 获取员工列表
   */
  const fetchList = async () => {
    try {
      loading.value = true;
      const response = await employeeApi.getList(filters.value);
      list.value = response.list;
      total.value = response.total;
    } catch (error) {
      list.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取员工详情
   * @param id 员工ID
   */
  const fetchDetail = async (id: string) => {
    try {
      loading.value = true;
      const response = await employeeApi.getDetail(id);
      currentEmployee.value = response;
      return response;
    } catch (error) {
      currentEmployee.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 设置页码
   * @param page 页码
   */
  const setPage = (page: number) => {
    filters.value.pageNum = page;
  };

  /**
   * 设置搜索关键词
   * @param keyword 关键词
   */
  const setKeyword = (keyword: string) => {
    filters.value.keyword = keyword;
    // 重置到第一页
    filters.value.pageNum = 1;
  };

  /**
   * 重置筛选条件
   */
  const resetFilters = () => {
    filters.value = {
      pageNum: 1,
      pageSize: 20,
      keyword: '',
    };
  };

  return {
    // State
    list,
    total,
    loading,
    filters,
    currentEmployee,

    // Getters
    totalPages,

    // Actions
    fetchList,
    fetchDetail,
    setPage,
    setKeyword,
    resetFilters,
  };
});
