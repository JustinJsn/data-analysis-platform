/**
 * 权限检查 Composable
 */
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

export function usePermission() {
  const authStore = useAuthStore();

  const permissions = computed(() => authStore.permissions);

  /**
   * 检查是否有指定权限
   */
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission);
  };

  /**
   * 检查是否有任一权限
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return authStore.hasAnyPermission(permissions);
  };

  /**
   * 检查是否有所有权限
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return authStore.hasAllPermissions(permissions);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
