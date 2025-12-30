/**
 * 绩效数据列表 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('绩效数据列表', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够加载绩效数据列表', async ({ page }) => {
    // 导航到绩效数据列表页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page.locator('h2:has-text("绩效数据列表")')).toBeVisible();

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();

    // 验证表格列
    await expect(page.locator('th:has-text("员工姓名")')).toBeVisible();
    await expect(page.locator('th:has-text("员工ID")')).toBeVisible();
    await expect(page.locator('th:has-text("年份")')).toBeVisible();
    await expect(page.locator('th:has-text("季度")')).toBeVisible();
    await expect(page.locator('th:has-text("组织")')).toBeVisible();
    await expect(page.locator('th:has-text("绩效评级")')).toBeVisible();
  });

  test('应该能够按年份筛选', async ({ page }) => {
    // 导航到绩效数据列表页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 输入年份
    const yearInput = page.locator('input[placeholder="年份"]');
    await yearInput.fill('2024');
    await yearInput.press('Enter');

    // 点击搜索按钮
    await page.click('button:has-text("搜索")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');
  });

  test('应该能够按季度筛选', async ({ page }) => {
    // 导航到绩效数据列表页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 选择季度
    await page.click('.el-select:has-text("季度")');
    await page.click('.el-select-dropdown__item:has-text("Q1")');

    // 点击搜索按钮
    await page.click('button:has-text("搜索")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');
  });

  test('应该能够按员工姓名搜索', async ({ page }) => {
    // 导航到绩效数据列表页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 输入员工姓名
    const nameInput = page.locator('input[placeholder="员工姓名"]');
    await nameInput.fill('张三');
    await nameInput.press('Enter');

    // 点击搜索按钮
    await page.click('button:has-text("搜索")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');
  });

  test('应该能够重置筛选条件', async ({ page }) => {
    // 导航到绩效数据列表页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 输入筛选条件
    const yearInput = page.locator('input[placeholder="年份"]');
    await yearInput.fill('2024');

    // 点击重置按钮
    await page.click('button:has-text("重置")');

    // 验证输入框已清空
    await expect(yearInput).toHaveValue('');
  });

  test('应该能够切换分页', async ({ page }) => {
    // 导航到绩效数据列表页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 验证分页组件存在
    const pagination = page.locator('.el-pagination');
    await expect(pagination).toBeVisible();

    // 如果有多页，尝试点击下一页
    const nextButton = pagination.locator('button.next-btn');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('应该能够切换每页条数', async ({ page }) => {
    // 导航到绩效数据列表页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击每页条数选择器
    const pageSizeSelect = page.locator('.el-pagination .el-select');
    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.click();
      await page.click('.el-select-dropdown__item:has-text("20")');
      await page.waitForLoadState('networkidle');
    }
  });
});
