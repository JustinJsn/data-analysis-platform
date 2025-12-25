/**
 * Axios 请求封装
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ElMessage } from 'element-plus';
import NProgress from './nprogress';
import type { UnifiedResponse } from '@/types';
import { captureError, addBreadcrumb } from './sentry';

// 请求计数器（用于控制 nprogress）
let requestCount = 0;

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 显示进度条
    if (requestCount === 0) {
      NProgress.start();
    }
    requestCount++;

    // 注入 Token
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    requestCount--;
    if (requestCount === 0) {
      NProgress.done();
    }
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<UnifiedResponse>) => {
    requestCount--;
    if (requestCount === 0) {
      NProgress.done();
    }

    const { code, message, data } = response.data;

    if (code !== 0) {
      // 业务失败
      ElMessage.error(message || '请求失败');

      // 记录业务错误到 Sentry（非严重错误，使用 breadcrumb）
      addBreadcrumb({
        message: `业务错误: ${message}`,
        category: 'api.business-error',
        level: 'warning',
        data: {
          code,
          url: response.config.url,
          method: response.config.method,
        },
      });

      return Promise.reject(new Error(message || '请求失败'));
    }

    // 业务成功
    return data;
  },
  (error) => {
    requestCount--;
    if (requestCount === 0) {
      NProgress.done();
    }

    // HTTP 错误处理
    if (error.response) {
      const { status, data } = error.response;

      // 错误消息映射
      const errorMessages: Record<number, string> = {
        400: '请求参数错误',
        401: '登录已过期，请重新登录',
        403: '无权访问',
        404: '资源不存在',
        500: '服务器错误',
        502: '网关错误',
        503: '服务暂时不可用',
        504: '网关超时',
      };

      const errorMessage =
        data?.message || errorMessages[status] || '网络错误，请稍后重试';
      ElMessage.error(errorMessage);

      // 上报严重错误到 Sentry（排除 401，因为已有专门的登录跳转处理）
      if (status !== 401) {
        // 创建新的错误对象以清晰标识错误来源
        const apiError = new Error(
          `HTTP ${status}: ${errorMessage} - ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        );

        // 设置错误名称以便在 Sentry 中分类
        apiError.name = `HTTPError${status}`;

        // 保留原始堆栈但添加 API 请求信息
        apiError.stack = `API Request Failed\n    at ${error.config?.method?.toUpperCase()} ${error.config?.url}\n${error.stack || ''}`;

        captureError(apiError, {
          type: 'HTTP Error',
          status,
          url: error.config?.url,
          method: error.config?.method,
          errorMessage,
          responseData: data,
          requestData: error.config?.data,
          // 添加指纹以便 Sentry 正确分组
          fingerprint: [
            'http-error',
            String(status),
            error.config?.url || 'unknown',
          ],
        });
      }

      // 401 跳转登录页
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // 如果已经在登录页，不重复跳转
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    } else if (error.request) {
      // 网络连接失败
      ElMessage.error('网络连接失败，请检查网络');

      // 创建明确的网络错误对象
      const networkError = new Error(
        `网络连接失败: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      );
      networkError.name = 'NetworkError';
      networkError.stack = `Network Request Failed\n    at ${error.config?.method?.toUpperCase()} ${error.config?.url}\n${error.stack || ''}`;

      captureError(networkError, {
        type: 'Network Error',
        url: error.config?.url,
        method: error.config?.method,
        fingerprint: ['network-error', error.config?.url || 'unknown'],
      });
    } else {
      // 请求配置错误
      ElMessage.error('请求配置错误');

      // 创建明确的配置错误对象
      const configError = new Error(
        `请求配置错误: ${error.message || '未知错误'}`,
      );
      configError.name = 'RequestConfigError';
      configError.stack = `Request Configuration Error\n${error.stack || ''}`;

      captureError(configError, {
        type: 'Request Config Error',
        config: error.config,
        errorMessage: error.message,
        fingerprint: ['config-error'],
      });
    }

    return Promise.reject(error);
  },
);

/**
 * 导出请求实例
 */
export default service;

/**
 * 导出请求方法
 */
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config);
  },

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return service.post(url, data, config);
  },

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config);
  },

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return service.patch(url, data, config);
  },
};
