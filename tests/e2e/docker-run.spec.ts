/**
 * Docker 容器运行 E2E 测试
 *
 * 测试 Docker 容器的启动、健康检查和应用功能
 * 运行：pnpm exec playwright test tests/e2e/docker-run.spec.ts
 */

import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Docker 容器运行', () => {
  const imageName = 'data-analysis-platform:test';
  const containerName = 'data-analysis-platform-test';
  const port = 8080;
  const baseURL = `http://localhost:${port}`;

  test.beforeAll(async () => {
    // 确保容器不存在
    try {
      await execAsync(`docker stop ${containerName} 2>&1 || true`);
      await execAsync(`docker rm ${containerName} 2>&1 || true`);
    } catch (error) {
      // 忽略清理错误
    }

    // 启动容器
    await execAsync(
      `docker run -d --name ${containerName} -p ${port}:80 ${imageName}`,
    );

    // 等待容器启动（最多 30 秒）
    let retries = 30;
    while (retries > 0) {
      try {
        const { stdout } = await execAsync(
          `docker inspect --format='{{.State.Running}}' ${containerName}`,
        );
        if (stdout.trim() === 'true') {
          break;
        }
      } catch (error) {
        // 继续等待
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries--;
    }
  });

  test.afterAll(async () => {
    // 清理容器
    try {
      await execAsync(`docker stop ${containerName} 2>&1 || true`);
      await execAsync(`docker rm ${containerName} 2>&1 || true`);
    } catch (error) {
      // 忽略清理错误
    }
  });

  test('容器应该在 30 秒内启动', async () => {
    // 检查容器状态
    const { stdout } = await execAsync(
      `docker inspect --format='{{.State.Running}}' ${containerName}`,
    );
    expect(stdout.trim()).toBe('true');
  });

  test('健康检查端点应该返回 200', async ({ request }) => {
    // 等待服务就绪（最多 30 秒）
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
    expect(await response?.text()).toContain('healthy');
  });

  test('应用应该能够访问', async ({ page }) => {
    await page.goto(baseURL);

    // 验证页面加载（检查是否有 HTML 内容）
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('容器日志应该正常输出', async () => {
    const { stdout } = await execAsync(`docker logs ${containerName}`);
    // 验证日志不为空
    expect(stdout).toBeTruthy();
    // 验证没有明显的错误
    expect(stdout.toLowerCase()).not.toContain('fatal');
    expect(stdout.toLowerCase()).not.toContain('error');
  });

  test('容器应该以非 root 用户运行 worker 进程', async () => {
    // 检查 nginx worker 进程的用户
    const { stdout } = await execAsync(
      `docker exec ${containerName} ps aux | grep "nginx: worker"`,
    );

    // 验证 worker 进程不是 root 用户
    const lines = stdout
      .split('\n')
      .filter((line) => line.includes('nginx: worker'));
    if (lines.length > 0) {
      const workerLine = lines[0];
      expect(workerLine).not.toContain('root');
      // nginx worker 进程应该以 nginx 用户运行
      expect(workerLine).toMatch(/\snginx\s/);
    }
  });
});
