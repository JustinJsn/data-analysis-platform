/**
 * 路由配置
 */
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { setupRouterGuards } from './guards';

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// 注册路由守卫
setupRouterGuards(router);

export default router;
