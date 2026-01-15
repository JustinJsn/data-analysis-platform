# 快速开始指南：Docker 部署

**版本:** 1.0  
**日期:** 2025-01-27  
**目标受众:** 运维人员、开发人员

---

## 概述

本指南帮助您快速使用 Docker 部署数据分析平台，包括本地开发环境和生产环境部署。

---

## 前置要求

### 系统要求

- **Docker:** 20.10+ 或 Docker Desktop
- **docker-compose:** 2.0+（可选，用于多容器编排）
- **操作系统:** Linux、macOS、Windows（支持 WSL2）

### 验证安装

```bash
# 检查 Docker 版本
docker --version

# 检查 docker-compose 版本（如果使用）
docker-compose --version
```

---

## 快速开始

### 方式1：使用 Docker Compose（推荐）

1. **准备环境变量文件**

创建 `.env` 文件：

```env
# API 基础地址
VITE_API_BASE_URL=http://localhost:8080

# Sentry DSN（可选）
VITE_SENTRY_DSN=your-sentry-dsn
```

2. **启动服务**

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

3. **访问应用**

打开浏览器访问：http://localhost:8080

### 方式2：使用 Docker 命令

1. **构建镜像**

```bash
# 构建镜像（需要设置环境变量）
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -t data-analysis-platform:latest \
  .

# 或使用默认值
docker build -t data-analysis-platform:latest .
```

2. **运行容器**

```bash
# 运行容器
docker run -d \
  --name data-analysis-platform \
  -p 8080:80 \
  -e VITE_API_BASE_URL=http://localhost:8080 \
  data-analysis-platform:latest

# 查看日志
docker logs -f data-analysis-platform

# 停止容器
docker stop data-analysis-platform

# 删除容器
docker rm data-analysis-platform
```

3. **访问应用**

打开浏览器访问：http://localhost:8080

---

## 环境配置

### 环境变量说明

| 变量名              | 说明                   | 必需 | 默认值                  |
| ------------------- | ---------------------- | ---- | ----------------------- |
| `VITE_API_BASE_URL` | 后端 API 基础地址      | 是   | `http://localhost:8080` |
| `VITE_SENTRY_DSN`   | Sentry DSN（错误追踪） | 否   | -                       |
| `VITE_APP_TITLE`    | 应用标题               | 否   | `数据分析平台`          |

### 配置方式

**方式1：环境变量文件（.env）**

```env
VITE_API_BASE_URL=https://api.example.com
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**方式2：docker-compose.yml**

```yaml
services:
  app:
    environment:
      - VITE_API_BASE_URL=https://api.example.com
      - VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**方式3：Docker 命令**

```bash
docker run -e VITE_API_BASE_URL=https://api.example.com ...
```

---

## 生产环境部署

### 1. 准备生产配置

创建 `.env.production`：

```env
VITE_API_BASE_URL=https://api.production.com
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_APP_TITLE=数据分析平台
```

### 2. 构建生产镜像

```bash
# 使用生产环境变量构建
docker build \
  --build-arg VITE_API_BASE_URL=https://api.production.com \
  --build-arg VITE_SENTRY_DSN=https://xxx@sentry.io/xxx \
  -t data-analysis-platform:production \
  .
```

### 3. 运行生产容器

```bash
docker run -d \
  --name data-analysis-platform-prod \
  -p 80:80 \
  --restart unless-stopped \
  --memory=512m \
  --cpus=1 \
  data-analysis-platform:production
```

### 4. 验证部署

```bash
# 检查容器状态
docker ps

# 检查健康状态
curl http://localhost/health

# 查看日志
docker logs data-analysis-platform-prod
```

---

## 多实例部署

### 使用 Docker Compose

```yaml
services:
  app:
    # ... 配置 ...
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 使用 Docker 命令

```bash
# 启动多个实例（使用不同端口）
docker run -d --name app1 -p 8080:80 data-analysis-platform:latest
docker run -d --name app2 -p 8081:80 data-analysis-platform:latest
docker run -d --name app3 -p 8082:80 data-analysis-platform:latest
```

### 使用负载均衡器

建议使用 nginx 或 traefik 作为负载均衡器，统一入口。

---

## 健康检查

### 检查端点

```bash
# HTTP 健康检查
curl http://localhost:8080/health

# 预期响应
healthy
```

### Docker 健康检查

```bash
# 查看容器健康状态
docker ps

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' <container-id> | jq
```

---

## 日志管理

### 查看日志

```bash
# 实时查看日志
docker logs -f data-analysis-platform

# 查看最近 100 行日志
docker logs --tail 100 data-analysis-platform

# 查看带时间戳的日志
docker logs -f -t data-analysis-platform
```

### 日志导出

```bash
# 导出日志到文件
docker logs data-analysis-platform > app.log 2>&1
```

---

## 故障排查

### 问题1：容器无法启动

**检查步骤：**

```bash
# 查看容器日志
docker logs <container-id>

# 检查容器状态
docker ps -a

# 检查镜像
docker images
```

**常见原因：**

- 端口被占用
- 环境变量配置错误
- 镜像构建失败

### 问题2：应用无法访问后端 API

**检查步骤：**

```bash
# 检查环境变量
docker exec <container-id> env | grep VITE_API_BASE_URL

# 测试 API 连接
docker exec <container-id> wget -O- $VITE_API_BASE_URL/health
```

**解决方案：**

- 确认 `VITE_API_BASE_URL` 配置正确
- 检查网络连接
- 确认后端服务可用

### 问题3：页面刷新后 404

**原因：** nginx 配置未正确设置 SPA 路由回退

**解决方案：** 检查 nginx 配置中的 `try_files` 指令

### 问题4：容器内存不足

**检查步骤：**

```bash
# 查看容器资源使用
docker stats <container-id>
```

**解决方案：**

- 增加内存限制
- 优化应用代码
- 检查是否有内存泄漏

---

## 最佳实践

### 1. 镜像标签管理

```bash
# 使用版本标签
docker build -t data-analysis-platform:v1.0.0 .
docker build -t data-analysis-platform:latest .

# 推送到镜像仓库
docker tag data-analysis-platform:v1.0.0 registry.example.com/data-analysis-platform:v1.0.0
docker push registry.example.com/data-analysis-platform:v1.0.0
```

### 2. 安全配置

- ✅ 使用非 root 用户运行
- ✅ 最小化暴露端口
- ✅ 定期更新基础镜像
- ✅ 扫描镜像漏洞

### 3. 资源限制

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

### 4. 自动重启

```bash
# 容器异常退出时自动重启
docker run --restart unless-stopped ...
```

### 5. 数据持久化

如果需要持久化数据（如导出文件），使用 Docker volumes：

```yaml
volumes:
  - ./data:/usr/share/nginx/html/data
```

---

## 性能优化

### 1. 构建缓存

```bash
# 使用构建缓存加速构建
docker build --cache-from data-analysis-platform:latest .
```

### 2. 镜像大小优化

- 使用多阶段构建
- 使用 .dockerignore 排除不必要文件
- 使用 alpine 基础镜像

### 3. 启动速度优化

- 使用健康检查避免过早流量
- 优化 nginx 配置
- 减少不必要的初始化操作

---

## 常见命令参考

```bash
# 构建镜像
docker build -t data-analysis-platform:latest .

# 运行容器
docker run -d -p 8080:80 --name app data-analysis-platform:latest

# 查看容器
docker ps
docker ps -a

# 查看日志
docker logs -f app

# 停止容器
docker stop app

# 删除容器
docker rm app

# 删除镜像
docker rmi data-analysis-platform:latest

# 清理未使用的资源
docker system prune -a

# 使用 docker-compose
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose ps
```

---

## 下一步

- 查看 [部署文档](../README.md) 了解详细配置
- 查看 [故障排查指南](#故障排查) 解决常见问题
- 查看 [最佳实践](#最佳实践) 优化部署

---

## 支持

如遇到问题，请：

1. 查看容器日志：`docker logs <container-id>`
2. 检查健康状态：`curl http://localhost/health`
3. 参考故障排查章节
4. 联系运维团队
