/**
 * 同步任务触发 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('同步任务触发', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够触发员工同步', async ({ page }) => {
    // 点击同步员工数据按钮
    await page.click('button:has-text("同步员工数据")');

    // 等待成功提示
    await expect(page.locator('.el-message--success')).toBeVisible();
    await expect(page.locator('.el-message--success')).toContainText(
      '员工同步已触发',
    );
  });

  test('应该能够触发组织同步', async ({ page }) => {
    // 点击同步组织数据按钮
    await page.click('button:has-text("同步组织数据")');

    // 等待成功提示
    await expect(page.locator('.el-message--success')).toBeVisible();
    await expect(page.locator('.el-message--success')).toContainText(
      '组织同步已触发',
    );
  });

  test('应该能够触发完整同步', async ({ page }) => {
    // 点击完整同步按钮
    await page.click('button:has-text("完整同步")');

    // 等待成功提示
    await expect(page.locator('.el-message--success')).toBeVisible();
    await expect(page.locator('.el-message--success')).toContainText(
      '完整同步已触发',
    );
  });

  test('应该显示最近批次列表', async ({ page }) => {
    // 验证批次表格存在
    await expect(page.locator('.el-table')).toBeVisible();

    // 验证表格列
    await expect(page.locator('th:has-text("批次ID")')).toBeVisible();
    await expect(page.locator('th:has-text("同步类型")')).toBeVisible();
    await expect(page.locator('th:has-text("状态")')).toBeVisible();
  });
});
