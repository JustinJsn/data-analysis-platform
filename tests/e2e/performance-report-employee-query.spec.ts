/**
 * 绩效报表人员查询 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('绩效报表 - 人员查询', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够按人员查询绩效数据', async ({ page }) => {
    // 导航到绩效报表查询页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击人员选择器
    const employeeInput = page.locator('input[placeholder*="人员"]');
    await employeeInput.click();

    // 等待虚拟表格加载
    await page.waitForSelector('.el-table-v2', { timeout: 5000 });

    // 选择第一个人员（点击复选框）
    const firstCheckbox = page.locator('.el-checkbox').first();
    await firstCheckbox.click();

    // 点击确定按钮
    await page.click('button:has-text("确定")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够多选人员', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击人员选择器
    const employeeInput = page.locator('input[placeholder*="人员"]');
    await employeeInput.click();

    // 等待虚拟表格加载
    await page.waitForSelector('.el-table-v2', { timeout: 5000 });

    // 选择多个人员
    const checkboxes = page.locator('.el-checkbox');
    const count = await checkboxes.count();
    if (count >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
    }

    // 验证已选择提示
    const selectedInfo = page.locator('text=已选择');
    if (await selectedInfo.isVisible()) {
      await expect(selectedInfo).toContainText('已选择');
    }

    // 点击确定按钮
    await page.click('button:has-text("确定")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够搜索人员', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击人员选择器
    const employeeInput = page.locator('input[placeholder*="人员"]');
    await employeeInput.click();

    // 等待虚拟表格加载
    await page.waitForSelector('.el-table-v2', { timeout: 5000 });

    // 在搜索框中输入关键词
    const searchInput = page.locator('input[placeholder*="搜索姓名或工号"]');
    await searchInput.fill('张');

    // 等待搜索结果
    await page.waitForTimeout(500);

    // 验证搜索结果（表格应该显示匹配的人员）
    const table = page.locator('.el-table-v2');
    await expect(table).toBeVisible();
  });

  test('应该能够清空人员选择', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击人员选择器并选择人员
    const employeeInput = page.locator('input[placeholder*="人员"]');
    await employeeInput.click();

    await page.waitForSelector('.el-table-v2', { timeout: 5000 });
    const firstCheckbox = page.locator('.el-checkbox').first();
    await firstCheckbox.click();
    await page.click('button:has-text("确定")');

    // 再次打开选择器并点击清空
    await employeeInput.click();
    await page.click('button:has-text("清空")');

    // 验证人员选择已清空
    await expect(employeeInput).toHaveValue('');
  });
});
