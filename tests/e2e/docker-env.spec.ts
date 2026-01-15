/**
 * Docker 环境变量 E2E 测试
 *
 * 测试环境变量的注入和配置
 * 运行：pnpm exec playwright test tests/e2e/docker-env.spec.ts
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Docker 环境变量', () => {
  const imageName = 'data-analysis-platform:test-env';
  const containerName = 'data-analysis-platform-test-env';
  const port = 8081;

  test.beforeAll(async () => {
    // 清理旧容器
    try {
      await execAsync(`docker stop ${containerName} 2>&1 || true`);
      await execAsync(`docker rm ${containerName} 2>&1 || true`);
      await execAsync(`docker rmi ${imageName} 2>&1 || true`);
    } catch (error) {
      // 忽略清理错误
    }

    // 使用自定义环境变量构建镜像
    const testApiUrl = 'http://test-api.example.com';
    await execAsync(
      `docker build --build-arg VITE_API_BASE_URL=${testApiUrl} -t ${imageName} .`,
      { timeout: 300000 },
    );
  });

  test.afterAll(async () => {
    // 清理容器和镜像
    try {
      await execAsync(`docker stop ${containerName} 2>&1 || true`);
      await execAsync(`docker rm ${containerName} 2>&1 || true`);
      await execAsync(`docker rmi ${imageName} 2>&1 || true`);
    } catch (error) {
      // 忽略清理错误
    }
  });

  test('应该支持通过构建参数设置环境变量', async () => {
    // 验证镜像已构建
    const { stdout } = await execAsync(
      `docker images ${imageName} --format "{{.Repository}}:{{.Tag}}"`,
    );
    expect(stdout.trim()).toBe(imageName);
  });

  test('docker-compose.yml 应该支持环境变量配置', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const composePath = path.resolve(process.cwd(), 'docker-compose.yml');
    const composeContent = fs.readFileSync(composePath, 'utf-8');

    // 验证包含环境变量配置
    expect(composeContent).toContain('VITE_API_BASE_URL');
    expect(composeContent).toContain('${VITE_API_BASE_URL');
  });

  test('.env.example 文件应该包含所有必需的环境变量', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const envExamplePath = path.resolve(process.cwd(), '.env.example');

    // 验证文件存在
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');

    // 验证包含必需的环境变量
    expect(envExampleContent).toContain('VITE_API_BASE_URL');
    expect(envExampleContent).toContain('VITE_SENTRY_DSN');
    expect(envExampleContent).toContain('VITE_APP_TITLE');
  });
});
