/**
 * Position Store - 职务数据管理
 *
 * 负责职务数据的状态管理、列表查询等功能
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Position, PositionQueryParams } from '@/types/api';
import { positionApi } from '@/api';

export const usePositionStore = defineStore('position', () => {
  // ==================== State ====================

  /** 职务列表 */
  const list = ref<Position[]>([]);

  /** 总记录数 */
  const total = ref(0);

  /** 加载状态 */
  const loading = ref(false);

  /** 筛选条件 */
  const filters = ref<PositionQueryParams>({
    pageNum: 1,
    pageSize: 20,
    keyword: '',
  });

  // ==================== Getters ====================

  /** 总页数 */
  const totalPages = computed(() => {
    return Math.ceil(total.value / filters.value.pageSize);
  });

  // ==================== Actions ====================

  /**
   * 获取职务列表
   */
  const fetchList = async () => {
    try {
      loading.value = true;
      const response = await positionApi.getList(filters.value);
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

    // Getters
    totalPages,

    // Actions
    fetchList,
    setPage,
    setKeyword,
    resetFilters,
  };
});
