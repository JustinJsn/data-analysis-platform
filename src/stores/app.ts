/**
 * App Store - 全局应用状态
 */
import { defineStore } from 'pinia';
import type { MenuItem, Breadcrumb } from '@/types';

interface AppState {
  /** 主题模式 */
  theme: 'light' | 'dark';
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean;
  /** 菜单列表 */
  menuList: MenuItem[];
  /** 面包屑导航 */
  breadcrumbs: Breadcrumb[];
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
    menuList: [
      {
        id: 'dashboard',
        name: '监控中心',
        path: '/dashboard',
        icon: 'Monitor',
        permission: 'dashboard:view',
      },
      {
        id: 'employees',
        name: '员工管理',
        path: '/employees',
        icon: 'User',
        permission: 'employee:view',
      },
      {
        id: 'organizations',
        name: '组织架构',
        path: '/organizations',
        icon: 'OfficeBuilding',
        permission: 'organization:view',
      },
      {
        id: 'positions',
        name: '职务管理',
        path: '/positions',
        icon: 'Suitcase',
        permission: 'position:view',
      },
      {
        id: 'sync',
        name: '同步任务',
        path: '/sync/batches',
        icon: 'Refresh',
        permission: 'sync:view',
      },
      {
        id: 'performance',
        name: '绩效数据',
        path: '/performance/reports',
        icon: 'DataAnalysis',
        permission: 'performance:view',
      },
    ],
    breadcrumbs: [],
  }),

  actions: {
    /**
     * 切换主题
     */
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.theme);
      localStorage.setItem('theme', this.theme);
    },

    /**
     * 设置主题
     */
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme;
      this.applyTheme(theme);
      localStorage.setItem('theme', theme);
    },

    /**
     * 应用主题到 DOM（同时支持 Element Plus 和 Tailwind CSS）
     */
    applyTheme(theme: 'light' | 'dark') {
      const html = document.documentElement;

      // Tailwind CSS 暗黑模式
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }

      // Element Plus 暗黑模式（自定义变量支持）
      html.setAttribute('data-theme', theme);
    },

    /**
     * 切换侧边栏
     */
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', String(this.sidebarCollapsed));
    },

    /**
     * 设置菜单列表
     */
    setMenuList(menus: MenuItem[]) {
      this.menuList = menus;
    },

    /**
     * 设置面包屑
     */
    setBreadcrumbs(breadcrumbs: Breadcrumb[]) {
      this.breadcrumbs = breadcrumbs;
    },

    /**
     * 初始化主题（在应用启动时调用）
     */
    initTheme() {
      this.applyTheme(this.theme);
    },
  },
});
