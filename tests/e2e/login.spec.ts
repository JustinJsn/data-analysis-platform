/**
 * 登录流程 E2E 测试
 *
 * 注意：此文件需要 Playwright 支持
 * 安装：pnpm add -D @playwright/test
 * 运行：pnpm exec playwright test
 */

import { test, expect } from '@playwright/test';

test.describe('登录流程', () => {
  test('应该能够成功登录', async ({ page }) => {
    // 访问登录页
    await page.goto('/login');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('数据分析平台');

    // 输入用户名和密码
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');

    // 点击登录按钮
    await page.click('button:has-text("登录")');

    // 等待跳转到首页
    await page.waitForURL('/');

    // 验证登录成功
    expect(page.url()).toBe('/');
  });

  test('应该显示错误提示当输入无效凭证', async ({ page }) => {
    await page.goto('/login');

    // 输入无效凭证
    await page.fill('input[placeholder="请输入用户名"]', 'invalid');
    await page.fill('input[placeholder="请输入密码"]', 'invalid');

    // 点击登录按钮
    await page.click('button:has-text("登录")');

    // 验证错误提示
    await expect(page.locator('.el-message--error')).toBeVisible();
  });

  test('应该验证必填字段', async ({ page }) => {
    await page.goto('/login');

    // 不输入任何内容，直接点击登录
    await page.click('button:has-text("登录")');

    // 应该显示验证错误
    await expect(page.locator('.el-form-item__error')).toBeVisible();
  });
});
