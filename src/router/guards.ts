/**
 * 路由守卫
 */
import type { Router } from 'vue-router';
import NProgress from '@/utils/nprogress';

/**
 * 注册全局导航守卫
 */
export function setupRouterGuards(router: Router) {
  // 前置守卫
  router.beforeEach(async (to, from, next) => {
    // 启动进度条
    NProgress.start();

    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || '数据分析平台'}`;
    }

    // TODO: 临时禁用登录校验 - 等待后端实现登录功能
    // const authStore = useAuthStore()

    // // 检查是否需要认证
    // if (to.meta.requiresAuth !== false) {
    //   // 未登录，跳转到登录页
    //   if (!authStore.isAuthenticated) {
    //     next({
    //       path: '/login',
    //       query: { redirect: to.fullPath },
    //     })
    //     NProgress.done()
    //     return
    //   }

    //   // 检查权限
    //   if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
    //     next('/403')
    //     NProgress.done()
    //     return
    //   }
    // }

    // // 已登录用户访问登录页，跳转到首页
    // if (to.path === '/login' && authStore.isAuthenticated) {
    //   next('/')
    //   NProgress.done()
    //   return
    // }

    next();
  });

  // 后置守卫
  router.afterEach(() => {
    // 完成进度条
    NProgress.done();
  });

  // 错误处理
  router.onError(() => {
    NProgress.done();
  });
}
