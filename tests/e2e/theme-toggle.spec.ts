/**
 * 主题切换 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('主题切换', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够切换到暗色主题', async ({ page }) => {
    // 查找并点击主题切换按钮
    await page.click('[aria-label="主题切换"], button:has-text("主题")');

    // 验证暗色主题类已添加
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('应该能够切换回亮色主题', async ({ page }) => {
    // 先切换到暗色
    await page.click('[aria-label="主题切换"], button:has-text("主题")');
    await page.waitForTimeout(300);

    // 再切换回亮色
    await page.click('[aria-label="主题切换"], button:has-text("主题")');

    // 验证暗色主题类已移除
    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('主题设置应该持久化', async ({ page }) => {
    // 切换到暗色主题
    await page.click('[aria-label="主题切换"], button:has-text("主题")');
    await page.waitForTimeout(300);

    // 刷新页面
    await page.reload();

    // 验证暗色主题仍然生效
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
  });
});
