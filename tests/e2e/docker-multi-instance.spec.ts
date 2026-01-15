/**
 * Docker 多实例 E2E 测试
 *
 * 测试多实例运行
 * 运行：pnpm exec playwright test tests/e2e/docker-multi-instance.spec.ts
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

test.describe('Docker 多实例', () => {
  const imageName = 'data-analysis-platform:test';
  const containerPrefix = 'data-analysis-platform-multi-test';
  const ports = [8090, 8091, 8092];

  test.beforeAll(async () => {
    // 清理旧容器
    for (const port of ports) {
      const containerName = `${containerPrefix}-${port}`;
      try {
        await execAsync(`docker stop ${containerName} 2>&1 || true`);
        await execAsync(`docker rm ${containerName} 2>&1 || true`);
      } catch (error) {
        // 忽略清理错误
      }
    }
  });

  test.afterAll(async () => {
    // 清理所有测试容器
    for (const port of ports) {
      const containerName = `${containerPrefix}-${port}`;
      try {
        await execAsync(`docker stop ${containerName} 2>&1 || true`);
        await execAsync(`docker rm ${containerName} 2>&1 || true`);
      } catch (error) {
        // 忽略清理错误
      }
    }
  });

  test('docker-compose.prod.yml 应该包含多实例配置', async () => {
    const composeProdPath = path.resolve(
      process.cwd(),
      'docker-compose.prod.yml',
    );

    // 验证文件存在
    expect(fs.existsSync(composeProdPath)).toBe(true);

    const composeContent = fs.readFileSync(composeProdPath, 'utf-8');

    // 验证包含多个服务实例
    expect(composeContent).toContain('app1:');
    expect(composeContent).toContain('app2:');
    expect(composeContent).toContain('app3:');

    // 验证每个实例使用不同的端口
    expect(composeContent).toContain('8080:80');
    expect(composeContent).toContain('8081:80');
    expect(composeContent).toContain('8082:80');
  });

  test('应该能够同时运行多个容器实例', async () => {
    // 启动多个容器实例
    for (const port of ports) {
      const containerName = `${containerPrefix}-${port}`;
      await execAsync(
        `docker run -d --name ${containerName} -p ${port}:80 ${imageName}`,
      );
    }

    // 等待所有容器启动
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 验证所有容器都在运行
    for (const port of ports) {
      const containerName = `${containerPrefix}-${port}`;
      const { stdout } = await execAsync(
        `docker inspect --format='{{.State.Running}}' ${containerName}`,
      );
      expect(stdout.trim()).toBe('true');
    }
  });

  test('多个实例应该可以独立访问', async ({ request }) => {
    // 等待服务就绪
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 验证每个实例的健康检查端点都可以访问
    for (const port of ports) {
      const baseURL = `http://localhost:${port}`;
      let retries = 30;
      let response;

      while (retries > 0) {
        try {
          response = await request.get(`${baseURL}/health`);
          if (response.ok()) {
            break;
          }
        } catch (error) {
          // 继续重试
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries--;
      }

      expect(response).toBeDefined();
      expect(response?.status()).toBe(200);
    }
  });

  test('实例之间应该无端口冲突', async () => {
    // 检查所有容器的端口映射
    for (const port of ports) {
      const containerName = `${containerPrefix}-${port}`;
      const { stdout } = await execAsync(`docker port ${containerName}`);

      // 验证端口映射正确
      expect(stdout).toContain(`${port}->80/tcp`);
    }
  });
});
