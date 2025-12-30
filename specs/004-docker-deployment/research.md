# 研究文档：Docker 部署

**功能:** Docker 部署  
**日期:** 2025-01-27  
**状态:** 完成

---

## 研究目标

为 Vue 3 SPA 应用设计最优的 Docker 容器化部署方案，包括：

1. 构建策略和基础镜像选择
2. Web 服务器配置（nginx）
3. 环境变量注入方案
4. 多阶段构建优化
5. SPA 路由处理

---

## 研究结果

### 1. 基础镜像选择

**决策：** 使用多阶段构建，构建阶段使用 `node:20-alpine`，运行阶段使用 `nginx:alpine`

**理由：**

- `alpine` 镜像体积小（约 5-10MB），减少最终镜像大小
- `node:20-alpine` 包含 Node.js 和 npm，支持 pnpm 安装
- `nginx:alpine` 是生产环境常用的轻量级 Web 服务器
- 多阶段构建可以分离构建依赖和运行依赖，最终镜像只包含运行所需文件

**替代方案考虑：**

- `node:20`（非 alpine）：体积较大（~300MB），但兼容性更好
- `node:20-slim`：体积中等（~100MB），但可能缺少某些工具
- **选择 alpine 的原因：** 体积最小，满足需求，符合镜像大小目标（< 500MB）

---

### 2. 构建策略

**决策：** 使用多阶段构建，分离构建环境和运行环境

**阶段1 - 构建阶段：**

```dockerfile
FROM node:20-alpine AS builder
# 安装 pnpm
# 复制 package.json 和 pnpm-lock.yaml
# 安装依赖（利用 Docker 层缓存）
# 复制源代码
# 构建应用
```

**阶段2 - 运行阶段：**

```dockerfile
FROM nginx:alpine
# 从构建阶段复制 dist/ 目录
# 复制 nginx 配置
# 配置非 root 用户运行
# 暴露端口
```

**理由：**

- 构建阶段包含所有开发依赖（~500MB），运行阶段只需要静态文件（~10MB）
- 最终镜像大小减少 90% 以上
- 构建依赖不会进入生产镜像，提高安全性
- 利用 Docker 层缓存，只有代码变更时才重新构建

**优化策略：**

- 先复制 `package.json` 和 `pnpm-lock.yaml`，安装依赖（利用缓存）
- 再复制源代码，触发构建
- 使用 `.dockerignore` 排除不必要的文件

---

### 3. Web 服务器配置（nginx）

**决策：** 使用 nginx 服务静态文件，配置 SPA 路由回退

**nginx 配置要点：**

1. **静态文件服务：**

```nginx
location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```

2. **SPA 路由支持：**

- `try_files $uri $uri/ /index.html;` 确保所有路由都回退到 index.html
- 这是 Vue Router 的 hash 和 history 模式都需要的配置

3. **健康检查端点：**

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

4. **Gzip 压缩：**

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

**理由：**

- nginx 是生产环境标准选择，性能优秀
- SPA 路由回退是必需配置，否则刷新页面会 404
- 健康检查端点便于容器编排工具检测服务状态
- Gzip 压缩减少传输大小，提升性能

**替代方案考虑：**

- Apache：功能强大但配置复杂，镜像体积较大
- Caddy：自动 HTTPS，但体积和性能不如 nginx
- **选择 nginx 的原因：** 轻量、高性能、配置简单、广泛使用

---

### 4. 环境变量注入方案

**决策：** 构建时注入 VITE\_\* 环境变量，运行时通过 nginx 配置或环境变量文件

**方案1 - 构建时注入（推荐）：**

```dockerfile
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build
```

**方案2 - 运行时注入（需要额外配置）：**

- 使用 nginx 的 `sub_filter` 替换占位符
- 或使用 JavaScript 在运行时读取环境变量

**选择方案1的理由：**

- Vite 在构建时将环境变量内联到代码中，这是标准做法
- 运行时注入需要额外工具和配置，增加复杂度
- 构建时注入更简单、更可靠

**环境变量管理：**

- 开发环境：使用 `.env.development`
- 生产环境：通过 `docker-compose.yml` 或 `docker run -e` 传递
- 敏感信息：通过 Docker secrets 或环境变量文件（不提交到代码库）

---

### 5. 包管理器选择（pnpm）

**决策：** 在 Dockerfile 中安装 pnpm，使用项目指定的 pnpm 版本

**安装方式：**

```dockerfile
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate
```

**理由：**

- 项目使用 pnpm 作为包管理器（package.json 中指定）
- corepack 是 Node.js 官方工具，支持 pnpm 管理
- 使用项目指定的版本确保一致性

**替代方案考虑：**

- 使用 npm：不需要额外安装，但性能不如 pnpm
- 全局安装 pnpm：需要额外步骤，版本可能不一致
- **选择 corepack 的原因：** 官方推荐，版本可控，无需额外安装

---

### 6. 安全配置

**决策：** 以非 root 用户运行 nginx

**实现方式：**

```dockerfile
# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 修改文件所有权
RUN chown -R nextjs:nodejs /usr/share/nginx/html

# 切换到非 root 用户
USER nextjs
```

**理由：**

- 容器安全最佳实践
- 即使容器被攻破，攻击者也无法获得 root 权限
- 符合规范要求

**注意：**

- nginx 默认以 root 用户运行，需要配置以非 root 用户运行
- 可能需要调整 nginx 配置，避免需要 root 权限的操作（如绑定 80 端口）

---

### 7. 健康检查配置

**决策：** 使用 HTTP 健康检查端点 + Docker HEALTHCHECK 指令

**Dockerfile 配置：**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1
```

**nginx 配置：**

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

**理由：**

- HTTP 健康检查比进程检查更准确（验证服务真正可用）
- Docker HEALTHCHECK 自动检测容器健康状态
- 容器编排工具（如 docker-compose）可以利用健康检查状态

---

### 8. 资源限制配置

**决策：** 在 docker-compose.yml 中配置资源限制

**配置示例：**

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

**理由：**

- 符合规范要求（内存 ≤512MB，CPU ≤1 核）
- 防止单个容器占用过多资源
- 便于资源规划和监控

---

### 9. 日志配置

**决策：** 应用日志输出到标准输出，nginx 日志也输出到标准输出

**nginx 配置：**

```nginx
access_log /dev/stdout;
error_log /dev/stderr;
```

**理由：**

- Docker 最佳实践：容器日志应该输出到标准输出/错误
- 便于使用 `docker logs` 查看
- 便于日志收集工具（如 ELK、Fluentd）收集

---

### 10. 多实例支持

**决策：** 通过 docker-compose scale 或多个容器实例实现

**配置要点：**

- 每个实例使用不同的端口映射（如 8080:80, 8081:80）
- 或使用负载均衡器（nginx、traefik）统一入口
- 所有实例共享相同的配置（通过环境变量）

**理由：**

- 支持水平扩展，应对流量高峰
- 符合规范要求（支持至少 10 个并发实例）
- 简单直接，无需额外配置

---

## 总结

所有技术决策已确定，可以开始实施：

1. ✅ 多阶段构建策略
2. ✅ Alpine 基础镜像
3. ✅ nginx 作为 Web 服务器
4. ✅ SPA 路由配置
5. ✅ 环境变量注入方案
6. ✅ 安全配置（非 root 用户）
7. ✅ 健康检查配置
8. ✅ 日志配置
9. ✅ 资源限制配置
10. ✅ 多实例支持方案

所有决策都有明确的理由和替代方案评估，可以进入实施阶段。
