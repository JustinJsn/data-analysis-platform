# API 契约文档

**版本:** 1.0  
**日期:** 2025-12-23  
**状态:** 已完成

---

## 概述

本目录包含数据分析平台前端与后端交互的所有 API 接口定义和实现示例。

## 文件说明

- **api-client.ts** - TypeScript 接口定义和类型声明
- **README.md** - API 契约说明文档（本文件）

---

## API 实现示例

### 1. Axios 实例配置

```typescript
// src/utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import { useAuthStore } from '@/stores/auth'
import { router } from '@/router'
import type { UnifiedResponse } from '@/types'

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求计数器（用于 nprogress）
let requestCount = 0

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 显示进度条
    if (requestCount === 0) {
      NProgress.start()
    }
    requestCount++

    // 注入认证 Token
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    requestCount--
    if (requestCount === 0) {
      NProgress.done()
    }
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    requestCount--
    if (requestCount === 0) {
      NProgress.done()
    }

    // 检查是否是统一响应结构（核心数据查询接口）
    if (response.data && 'code' in response.data) {
      const { code, message, data } = response.data as UnifiedResponse

      if (code === 200) {
        return data // 直接返回 data
      } else {
        // 业务错误
        ElMessage.error(message || '请求失败')
        return Promise.reject(new Error(message))
      }
    }

    // 非统一响应结构（同步触发接口等）
    return response.data
  },
  (error) => {
    requestCount--
    if (requestCount === 0) {
      NProgress.done()
    }

    const { response } = error

    // HTTP 错误处理
    if (response) {
      const errorMessages: Record<number, string> = {
        400: '请求参数错误',
        401: '登录已过期，请重新登录',
        403: '无权访问',
        404: '资源不存在',
        409: '操作冲突（可能有任务正在运行）',
        500: '服务器错误',
        503: '服务暂时不可用',
      }

      const message = errorMessages[response.status] || '网络错误，请稍后重试'
      ElMessage.error(message)

      // 401 未授权，跳转登录
      if (response.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }
    } else {
      // 网络错误或请求超时
      ElMessage.error('网络连接失败，请检查网络设置')
    }

    return Promise.reject(error)
  }
)

export default service
```

---

### 2. API 服务实现

```typescript
// src/api/index.ts
import request from '@/utils/request'
import type {
  ApiClient,
  LoginRequest,
  LoginResponse,
  User,
  EmployeeQueryParams,
  Employee,
  PaginatedResponse,
  Organization,
  PositionQueryParams,
  Position,
  SyncTriggerRequest,
  SimpleResponse,
  SyncBatchQueryParams,
  SyncBatchListResponse,
  SyncBatch,
  SyncBatchLogsResponse,
  OrderedFlowStatus,
  RunningStatus,
  API_ENDPOINTS,
} from '@/types'

/**
 * API 服务实现
 */
const api: ApiClient = {
  /* ========== 认证接口 ========== */

  async login(data: LoginRequest): Promise<LoginResponse> {
    return request.post(API_ENDPOINTS.LOGIN, data)
  },

  async logout(): Promise<void> {
    return request.post(API_ENDPOINTS.LOGOUT)
  },

  async getUserInfo(): Promise<User> {
    return request.get(API_ENDPOINTS.USER_INFO)
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    return request.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken })
  },

  /* ========== 员工接口 ========== */

  async getEmployees(params: EmployeeQueryParams): Promise<PaginatedResponse<Employee>> {
    return request.get(API_ENDPOINTS.EMPLOYEES, { params })
  },

  async getEmployeeDetail(id: string): Promise<Employee> {
    return request.get(API_ENDPOINTS.EMPLOYEE_DETAIL(id))
  },

  /* ========== 组织接口 ========== */

  async getOrganizationTree(): Promise<Organization[]> {
    return request.get(API_ENDPOINTS.ORGANIZATION_TREE)
  },

  /* ========== 职务接口 ========== */

  async getPositions(params: PositionQueryParams): Promise<PaginatedResponse<Position>> {
    return request.get(API_ENDPOINTS.POSITIONS, { params })
  },

  /* ========== 同步触发接口 ========== */

  async triggerEmployeeSync(data?: SyncTriggerRequest): Promise<SimpleResponse> {
    return request.post(API_ENDPOINTS.SYNC_EMPLOYEES, data || {})
  },

  async triggerOrganizationSync(data?: SyncTriggerRequest): Promise<SimpleResponse> {
    return request.post(API_ENDPOINTS.SYNC_ORGANIZATIONS, data || {})
  },

  async triggerJobPostSync(data?: SyncTriggerRequest): Promise<SimpleResponse> {
    return request.post(API_ENDPOINTS.SYNC_JOBPOSTS, data || {})
  },

  async triggerOrderedSync(): Promise<SimpleResponse> {
    return request.post(API_ENDPOINTS.SYNC_ORDERED, {})
  },

  /* ========== 监控查询接口 ========== */

  async getSyncBatches(params?: SyncBatchQueryParams): Promise<SyncBatchListResponse> {
    return request.get(API_ENDPOINTS.SYNC_BATCHES, { params })
  },

  async getSyncBatchDetail(batchId: string): Promise<SyncBatch> {
    return request.get(API_ENDPOINTS.SYNC_BATCH_DETAIL(batchId))
  },

  async getSyncBatchLogs(batchId: string): Promise<SyncBatchLogsResponse> {
    return request.get(API_ENDPOINTS.SYNC_BATCH_LOGS(batchId))
  },

  async getOrderedFlowStatus(batchId: string): Promise<OrderedFlowStatus> {
    return request.get(API_ENDPOINTS.SYNC_ORDERED_FLOW_STATUS, {
      params: { batch_id: batchId },
    })
  },

  async getCurrentRunningStatus(): Promise<RunningStatus> {
    return request.get(API_ENDPOINTS.SYNC_STATUS)
  },

  /* ========== 健康检查接口 ========== */

  async healthCheck(): Promise<{ status: string }> {
    return request.get(API_ENDPOINTS.HEALTH)
  },

  async readyCheck(): Promise<{ status: string; checks: Record<string, string> }> {
    return request.get(API_ENDPOINTS.READY)
  },
}

export default api
```

---

### 3. 使用示例

#### 3.1 登录

```typescript
// src/stores/auth.ts
import api from '@/api'

export const useAuthStore = defineStore('auth', {
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await api.login({ username, password })

        // 保存 Token
        this.token = response.accessToken
        this.refreshToken = response.refreshToken
        this.userInfo = response.user
        this.permissions = response.user.permissions

        localStorage.setItem('access_token', response.accessToken)
        localStorage.setItem('refresh_token', response.refreshToken)

        ElMessage.success('登录成功')
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名和密码')
        throw error
      }
    },
  },
})
```

#### 3.2 查询员工列表

```typescript
// src/stores/employee.ts
import api from '@/api'

export const useEmployeeStore = defineStore('employee', {
  actions: {
    async fetchList() {
      this.loading = true
      try {
        const response = await api.getEmployees(this.filters)
        this.list = response.list
        this.total = response.total
      } catch (error) {
        ElMessage.error('获取员工列表失败')
      } finally {
        this.loading = false
      }
    },
  },
})
```

#### 3.3 触发同步任务

```typescript
// src/stores/sync.ts
import api from '@/api'

export const useSyncStore = defineStore('sync', {
  actions: {
    async triggerSync(syncType: 'employee' | 'organization' | 'jobpost') {
      try {
        let response: SimpleResponse

        switch (syncType) {
          case 'employee':
            response = await api.triggerEmployeeSync()
            break
          case 'organization':
            response = await api.triggerOrganizationSync()
            break
          case 'jobpost':
            response = await api.triggerJobPostSync()
            break
        }

        ElMessage.success(response.message)

        // 刷新批次列表
        await this.fetchBatches()
      } catch (error: any) {
        if (error.response?.status === 409) {
          ElMessage.warning('已有同步任务正在运行，请稍后再试')
        } else {
          ElMessage.error('触发同步失败')
        }
      }
    },

    async triggerOrderedSync() {
      try {
        const response = await api.triggerOrderedSync()
        ElMessage.success(response.message)
        await this.fetchBatches()
      } catch (error) {
        ElMessage.error('触发完整同步失败')
      }
    },
  },
})
```

---

## API 响应处理

### 统一响应结构（核心数据查询接口）

**成功响应：**

```json
{
  "code": 200,
  "message": "success",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "list": [...],
    "pageNum": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**错误响应：**

```json
{
  "code": 400,
  "message": "参数错误",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": null
}
```

### 简单响应结构（同步触发接口）

**成功响应：**

```json
{
  "message": "Employee sync triggered successfully",
  "status": "running"
}
```

**错误响应：**

```json
{
  "error": "已有同步任务正在运行"
}
```

---

## 错误处理

### HTTP 状态码映射

| 状态码 | 说明               | 前端处理           |
| ------ | ------------------ | ------------------ |
| 200    | 成功               | 正常返回数据       |
| 202    | 已接受（异步处理） | 提示任务已触发     |
| 400    | 参数错误           | 提示用户检查输入   |
| 401    | 未授权             | 跳转登录页         |
| 403    | 无权限             | 跳转 403 页面      |
| 404    | 资源不存在         | 提示资源不存在     |
| 409    | 冲突               | 提示任务已在运行   |
| 500    | 服务器错误         | 提示服务器错误     |
| 503    | 服务不可用         | 提示服务暂时不可用 |

### 错误处理流程

1. **请求拦截器**：注入 Token，显示进度条
2. **响应拦截器**：
   - 检查 HTTP 状态码
   - 检查业务状态码（code 字段）
   - 统一错误提示
   - 401 自动跳转登录
3. **组件层**：捕获异常，显示友好提示

---

## 环境变量配置

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8080

# .env.production
VITE_API_BASE_URL=https://api.example.com
```

---

## TypeScript 类型安全

所有 API 接口都有完整的 TypeScript 类型定义：

```typescript
// 类型推断示例
const employees = await api.getEmployees({ pageNum: 1, pageSize: 20 })
// employees 类型自动推断为 PaginatedResponse<Employee>

employees.list.forEach(emp => {
  // emp 类型自动推断为 Employee
  console.log(emp.name, emp.email)
})
```

---

## 测试建议

### 单元测试

```typescript
// tests/api/employee.test.ts
import { describe, it, expect, vi } from 'vitest'
import api from '@/api'

describe('Employee API', () => {
  it('should fetch employee list', async () => {
    const response = await api.getEmployees({
      pageNum: 1,
      pageSize: 20,
    })

    expect(response).toHaveProperty('list')
    expect(response).toHaveProperty('total')
    expect(Array.isArray(response.list)).toBe(true)
  })

  it('should fetch employee detail', async () => {
    const employee = await api.getEmployeeDetail('1')

    expect(employee).toHaveProperty('id')
    expect(employee).toHaveProperty('name')
    expect(employee).toHaveProperty('email')
  })
})
```

### Mock 服务

使用 MSW (Mock Service Worker) 模拟 API：

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.get('/api/v1/employees', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 200,
        message: 'success',
        requestId: 'mock-request-id',
        data: {
          list: [
            { id: '1', name: '张三', email: 'zhangsan@example.com', ... },
          ],
          pageNum: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),
]
```

---

## 性能优化

### 请求缓存

对于不经常变化的数据（如组织树），可使用缓存：

```typescript
// src/utils/cache.ts
import { setupCache } from 'axios-cache-adapter'

const cache = setupCache({
  maxAge: 15 * 60 * 1000, // 15分钟
  exclude: {
    // 排除同步触发接口
    paths: [/\/api\/v1\/sync\//],
  },
})

const cachedRequest = axios.create({
  adapter: cache.adapter,
})
```

### 请求取消

使用 AbortController 取消请求：

```typescript
// src/stores/employee.ts
let abortController: AbortController | null = null

export const useEmployeeStore = defineStore('employee', {
  actions: {
    async fetchList() {
      // 取消上一次请求
      if (abortController) {
        abortController.abort()
      }

      abortController = new AbortController()

      try {
        const response = await api.getEmployees(this.filters, {
          signal: abortController.signal,
        })
        this.list = response.list
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Request cancelled')
        }
      }
    },
  },
})
```

---

## 总结

本契约文档提供了：

1. ✅ **完整的 TypeScript 接口定义**
2. ✅ **Axios 实例配置示例**
3. ✅ **API 服务实现代码**
4. ✅ **使用示例和最佳实践**
5. ✅ **错误处理策略**
6. ✅ **测试建议**
7. ✅ **性能优化方案**

所有接口遵循 TypeScript Strict Mode，确保类型安全。响应拦截器统一处理业务逻辑和错误，提供一致的开发体验。
