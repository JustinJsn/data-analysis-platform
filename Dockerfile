# 构建阶段
FROM node:20-alpine AS builder

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@10.26.1 --activate

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml（利用 Docker 层缓存）
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建时环境变量（可以通过 ARG 传入）
ARG VITE_API_BASE_URL=http://localhost:8080
ARG VITE_SENTRY_DSN=
ARG VITE_APP_TITLE=数据分析平台

# 设置构建时环境变量
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_APP_TITLE=$VITE_APP_TITLE

# 构建应用
RUN pnpm build

# 运行阶段
FROM nginx:alpine

# 安装必要的工具（用于健康检查）
RUN apk add --no-cache wget

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# nginx:alpine 已经有一个 nginx 用户（非 root，UID 101）
# 确保所有文件所有权正确
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /etc/nginx/nginx.conf

# nginx 默认架构：master 进程以 root 运行（绑定端口），worker 进程以 nginx 用户运行
# 这是 nginx 的标准安全实践，worker 进程（处理请求）以非 root 用户运行
# 为了完全以非 root 用户运行容器，我们需要使用非特权端口
# 但为了简化，我们保持 nginx 的默认行为，这已经是安全的（worker 进程是 nginx 用户）
# 如果需要完全非 root，可以在 docker-compose 中使用 security_opt 和 user 选项

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

