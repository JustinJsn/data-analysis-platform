/**
 * Sentry 错误监控初始化配置
 */
import * as Sentry from '@sentry/vue';
import type { App } from 'vue';
import type { Router } from 'vue-router';

/**
 * 初始化 Sentry
 * @param app Vue 应用实例
 * @param router Vue Router 实例
 */
export function initSentry(app: App, router: Router): void {
  // 仅在生产环境或配置了 DSN 时启用
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    // eslint-disable-next-line no-console
    console.warn('Sentry DSN 未配置，错误监控已禁用');
    return;
  }

  Sentry.init({
    app,
    dsn: dsn || 'http://c82f6a00252969d1a1226cf4a879b4ad@192.168.0.161:9000/2',

    // 集成 Vue Router 进行路由追踪
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // 性能监控采样率（0.0 - 1.0）
    tracesSampleRate: import.meta.env.PROD ? 0.5 : 1.0,

    // Session Replay 采样率
    replaysSessionSampleRate: 0.1, // 10% 的会话
    replaysOnErrorSampleRate: 1.0, // 100% 的错误会话

    // 环境标识
    environment: import.meta.env.MODE,

    // 发送默认 PII 数据（如 IP 地址）
    sendDefaultPii: true,

    // 忽略特定错误
    ignoreErrors: [
      // 浏览器扩展相关错误
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // 网络相关错误（由 Axios 拦截器处理）
      'Network Error',
      'timeout',
    ],

    // 自定义错误过滤
    beforeSend(event, hint) {
      // 开发环境输出到控制台
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(
          '[Sentry]',
          hint.originalException || hint.syntheticException,
        );
      }

      // 过滤掉 401 错误（已由路由守卫处理）
      if (event.exception?.values?.[0]?.value?.includes('401')) {
        return null;
      }

      return event;
    },

    // 设置用户信息（在用户登录后调用 setUser）
    // initialScope: {
    //   user: {
    //     id: undefined,
    //     username: undefined,
    //     email: undefined,
    //   },
    // },
  });

  // eslint-disable-next-line no-console
  console.info('[Sentry] 错误监控已启用');
}

/**
 * 设置用户信息
 * @param user 用户信息
 */
export function setSentryUser(user: {
  id?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}): void {
  Sentry.setUser(user);
}

/**
 * 清除用户信息（登出时调用）
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * 手动捕获错误
 * @param error 错误对象
 * @param context 错误上下文
 */
export function captureError(
  error: Error,
  context?: Record<string, any>,
): void {
  Sentry.withScope((scope) => {
    if (context) {
      // 设置自定义上下文
      scope.setContext('custom', context);

      // 如果有 fingerprint，设置以便正确分组
      if (context.fingerprint) {
        scope.setFingerprint(context.fingerprint);
      }

      // 设置标签便于过滤
      if (context.type) {
        scope.setTag('error_type', context.type);
      }
      if (context.status) {
        scope.setTag('http_status', context.status);
      }
      if (context.url) {
        scope.setTag('api_url', context.url);
      }
      if (context.method) {
        scope.setTag('http_method', context.method);
      }
    }

    Sentry.captureException(error);
  });
}

/**
 * 手动记录消息
 * @param message 消息内容
 * @param level 日志级别
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
): void {
  Sentry.captureMessage(message, level);
}

/**
 * 添加面包屑（用于追踪用户行为）
 * @param breadcrumb 面包屑信息
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}): void {
  Sentry.addBreadcrumb(breadcrumb);
}
