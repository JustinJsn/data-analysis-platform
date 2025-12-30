/**
 * 绩效报表季度查询 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('绩效报表 - 季度查询', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够按季度查询绩效数据', async ({ page }) => {
    // 导航到绩效报表查询页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 选择季度模式
    await page.click('button:has-text("季度")');

    // 选择开始时间
    const startYearSelect = page.locator('input[placeholder="年份"]').first();
    await startYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    const startQuarterSelect = page
      .locator('input[placeholder="季度"]')
      .first();
    await startQuarterSelect.click();
    await page.click('.el-select-dropdown__item:has-text("Q1")');

    // 选择结束时间
    const endYearSelect = page.locator('input[placeholder="年份"]').nth(1);
    await endYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    const endQuarterSelect = page.locator('input[placeholder="季度"]').nth(1);
    await endQuarterSelect.click();
    await page.click('.el-select-dropdown__item:has-text("Q4")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够使用智能推算功能', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 选择季度模式
    await page.click('button:has-text("季度")');

    // 选择开始时间
    const startYearSelect = page.locator('input[placeholder="年份"]').first();
    await startYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    const startQuarterSelect = page
      .locator('input[placeholder="季度"]')
      .first();
    await startQuarterSelect.click();
    await page.click('.el-select-dropdown__item:has-text("Q1")');

    // 勾选自动推算结束时间
    await page.click(
      'input[type="checkbox"] + span:has-text("自动推算结束时间")',
    );

    // 选择查询长度
    const queryLengthSelect = page.locator('input[placeholder="选择年数"]');
    await queryLengthSelect.click();
    await page.click('.el-select-dropdown__item:has-text("3")');

    // 验证结束时间已自动计算（应该被禁用）
    const endYearSelect = page.locator('input[placeholder="年份"]').nth(1);
    await expect(endYearSelect).toBeDisabled();

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够跨年查询季度', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 选择季度模式
    await page.click('button:has-text("季度")');

    // 选择开始时间：2024 Q4
    const startYearSelect = page.locator('input[placeholder="年份"]').first();
    await startYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2024")');

    const startQuarterSelect = page
      .locator('input[placeholder="季度"]')
      .first();
    await startQuarterSelect.click();
    await page.click('.el-select-dropdown__item:has-text("Q4")');

    // 选择结束时间：2025 Q2
    const endYearSelect = page.locator('input[placeholder="年份"]').nth(1);
    await endYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    const endQuarterSelect = page.locator('input[placeholder="季度"]').nth(1);
    await endQuarterSelect.click();
    await page.click('.el-select-dropdown__item:has-text("Q2")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });
});
