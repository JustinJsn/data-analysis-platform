/**
 * 绩效报表年份段查询 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('绩效报表 - 年份段查询', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够按年份段查询绩效数据', async ({ page }) => {
    // 导航到绩效报表查询页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page.locator('h2:has-text("绩效数据报表")')).toBeVisible();

    // 选择年份段模式
    await page.click('button:has-text("年份段")');

    // 选择开始年份
    const startYearSelect = page
      .locator('input[placeholder*="开始年份"]')
      .first();
    await startYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    // 选择结束年份
    const endYearSelect = page
      .locator('input[placeholder*="结束年份"]')
      .first();
    await endYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();

    // 验证查询结果（至少应该有一些数据或显示空状态）
    const tableBody = page.locator('.el-table__body');
    await expect(tableBody).toBeVisible();
  });

  test('应该能够查询多年份范围', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 选择年份段模式
    await page.click('button:has-text("年份段")');

    // 选择开始年份 2023
    const startYearSelect = page
      .locator('input[placeholder*="开始年份"]')
      .first();
    await startYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2023")');

    // 选择结束年份 2025
    const endYearSelect = page
      .locator('input[placeholder*="结束年份"]')
      .first();
    await endYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够重置查询条件', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 选择年份段并设置查询条件
    await page.click('button:has-text("年份段")');
    const startYearSelect = page
      .locator('input[placeholder*="开始年份"]')
      .first();
    await startYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    // 点击重置按钮
    await page.click('button:has-text("重置")');

    // 等待重置完成
    await page.waitForLoadState('networkidle');

    // 验证查询条件已清空（年份选择器应该为空）
    const yearInput = page.locator('input[placeholder*="开始年份"]').first();
    await expect(yearInput).toHaveValue('');
  });
});
