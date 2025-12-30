/**
 * Docker 镜像构建 E2E 测试
 *
 * 测试 Docker 镜像的构建过程
 * 运行：pnpm exec playwright test tests/e2e/docker-build.spec.ts
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

test.describe('Docker 镜像构建', () => {
  const imageName = 'data-analysis-platform:test';
  const dockerfilePath = path.resolve(process.cwd(), 'Dockerfile');

  test.beforeAll(async () => {
    // 验证 Dockerfile 存在
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  test.afterAll(async () => {
    // 清理测试镜像
    try {
      await execAsync(`docker rmi ${imageName} 2>&1 || true`);
    } catch (error) {
      // 忽略清理错误
    }
  });

  test('应该能够成功构建 Docker 镜像', async () => {
    // 构建镜像
    const { stdout, stderr } = await execAsync(
      `docker build -t ${imageName} .`,
      {
        cwd: process.cwd(),
        timeout: 300000, // 5 分钟超时
      },
    );

    // 验证构建成功（没有错误输出）
    expect(stderr).not.toContain('ERROR');
    expect(stdout).toContain('Successfully tagged');
  });

  test('镜像大小应该小于 500MB', async () => {
    // 获取镜像大小
    const { stdout } = await execAsync(
      `docker images ${imageName} --format "{{.Size}}"`,
    );
    const sizeStr = stdout.trim();

    // 解析大小（例如：450MB 或 0.45GB）
    const sizeMatch = sizeStr.match(/([\d.]+)(MB|GB)/);
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2];

      if (unit === 'GB') {
        // 转换为 MB
        const sizeMB = size * 1024;
        expect(sizeMB).toBeLessThan(500);
      } else {
        // 已经是 MB
        expect(size).toBeLessThan(500);
      }
    }
  });

  test('Dockerfile 应该使用多阶段构建', async () => {
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');

    // 验证包含构建阶段
    expect(dockerfileContent).toContain('AS builder');
    // 验证包含运行阶段
    expect(dockerfileContent).toContain('FROM nginx:alpine');
    // 验证包含复制构建产物的步骤
    expect(dockerfileContent).toContain('COPY --from=builder');
  });

  test('应该包含必要的配置文件', async () => {
    // 验证 .dockerignore 存在
    const dockerignorePath = path.resolve(process.cwd(), '.dockerignore');
    expect(fs.existsSync(dockerignorePath)).toBe(true);

    // 验证 nginx 配置文件存在
    const nginxConfPath = path.resolve(
      process.cwd(),
      'docker/nginx/nginx.conf',
    );
    expect(fs.existsSync(nginxConfPath)).toBe(true);
  });
});
