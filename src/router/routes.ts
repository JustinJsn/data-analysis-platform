/**
 * 路由定义
 */
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginPage.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardPage.vue'),
        meta: {
          title: '监控中心',
          icon: 'Monitor',
          permission: 'dashboard:view',
        },
      },
      {
        path: 'employees',
        name: 'EmployeeList',
        component: () => import('@/views/employee/EmployeeListPage.vue'),
        meta: {
          title: '员工列表',
          icon: 'User',
          permission: 'employee:view',
        },
      },
      {
        path: 'employees/:id',
        name: 'EmployeeDetail',
        component: () => import('@/views/employee/EmployeeDetailPage.vue'),
        meta: {
          title: '员工详情',
          hidden: true,
          permission: 'employee:view',
        },
      },
      {
        path: 'organizations',
        name: 'OrganizationTree',
        component: () =>
          import('@/views/organization/OrganizationTreePage.vue'),
        meta: {
          title: '组织架构',
          icon: 'OfficeBuilding',
          permission: 'organization:view',
        },
      },
      {
        path: 'positions',
        name: 'PositionList',
        component: () => import('@/views/position/PositionListPage.vue'),
        meta: {
          title: '职务列表',
          icon: 'Suitcase',
          permission: 'position:view',
        },
      },
      {
        path: 'sync/batches',
        name: 'SyncBatchList',
        component: () => import('@/views/sync/SyncBatchListPage.vue'),
        meta: {
          title: '同步批次',
          icon: 'Refresh',
          permission: 'sync:view',
        },
      },
      {
        path: 'sync/batches/:id',
        name: 'SyncBatchDetail',
        component: () => import('@/views/sync/SyncBatchDetailPage.vue'),
        meta: {
          title: '批次详情',
          hidden: true,
          permission: 'sync:view',
        },
      },
      {
        path: 'performance/reports',
        name: 'PerformanceReports',
        component: () =>
          import('@/views/performance/PerformanceReportListPage.vue'),
        meta: {
          title: '绩效数据列表',
          icon: 'DataAnalysis',
          permission: 'performance:view',
        },
      },
      {
        path: 'performance/reports/query',
        name: 'PerformanceReportQuery',
        component: () =>
          import('@/views/performance/PerformanceReportQueryPage.vue'),
        meta: {
          title: '绩效数据报表',
          hidden: true,
          permission: 'performance:view',
        },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权访问',
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
    },
  },
];

export default routes;
