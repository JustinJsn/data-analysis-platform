/**
 * Organization Store - 组织数据管理
 *
 * 负责组织树数据的状态管理和查询功能
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Organization } from '@/types/api';
import { organizationApi } from '@/api';

export const useOrganizationStore = defineStore('organization', () => {
  // ==================== State ====================

  /** 组织树数据 */
  const tree = ref<Organization[]>([]);

  /** 加载状态 */
  const loading = ref(false);

  /** 组织扁平化映射（用于快速查询） */
  const organizationMap = ref<Map<string, Organization>>(new Map());

  // ==================== Getters ====================

  /**
   * 根据ID获取组织信息
   */
  const getOrganizationById = computed(() => {
    return (id: string): Organization | undefined => {
      return organizationMap.value.get(id);
    };
  });

  // ==================== Actions ====================

  /**
   * 递归构建组织映射
   */
  const buildOrganizationMap = (orgs: Organization[]) => {
    for (const org of orgs) {
      organizationMap.value.set(org.id, org);
      if (org.children && org.children.length > 0) {
        buildOrganizationMap(org.children);
      }
    }
  };

  /**
   * 获取组织树
   */
  const fetchTree = async () => {
    try {
      loading.value = true;
      const response = await organizationApi.getTree();
      tree.value = response;

      // 构建扁平化映射
      organizationMap.value.clear();
      buildOrganizationMap(response);
    } catch (error) {
      tree.value = [];
      organizationMap.value.clear();
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    tree,
    loading,
    organizationMap,

    // Getters
    getOrganizationById,

    // Actions
    fetchTree,
    buildOrganizationMap,
  };
});
