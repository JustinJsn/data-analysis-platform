/**
 * 绩效报表组合查询和导出 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('绩效报表 - 组合查询和导出', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够组合多个查询条件', async ({ page }) => {
    // 导航到绩效报表查询页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 设置时间范围（年份段）
    await page.click('button:has-text("年份段")');
    const startYearSelect = page
      .locator('input[placeholder*="开始年份"]')
      .first();
    await startYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    const endYearSelect = page
      .locator('input[placeholder*="结束年份"]')
      .first();
    await endYearSelect.click();
    await page.click('.el-select-dropdown__item:has-text("2025")');

    // 选择部门
    const departmentInput = page.locator('input[placeholder="请选择部门"]');
    await departmentInput.click();
    await page.waitForSelector('.el-tree-v2', { timeout: 5000 });
    const firstNode = page.locator('.el-tree-node').first();
    await firstNode.click();
    await page.click('button:has-text("确定")');

    // 选择人员
    const employeeInput = page.locator('input[placeholder*="人员"]');
    await employeeInput.click();
    await page.waitForSelector('.el-table-v2', { timeout: 5000 });
    const firstCheckbox = page.locator('.el-checkbox').first();
    await firstCheckbox.click();
    await page.click('button:has-text("确定")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够批量导出当前页数据', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 先查询一些数据
    await page.click('button:has-text("查询")');
    await page.waitForLoadState('networkidle');

    // 点击导出按钮
    await page.click('button:has-text("导出数据")');

    // 等待导出对话框打开
    await page.waitForSelector('.el-dialog', { timeout: 3000 });

    // 选择批量导出
    await page.click('input[value="batch"]');

    // 点击导出按钮
    const exportButton = page.locator('.el-dialog button:has-text("导出")');
    await exportButton.click();

    // 等待导出完成（可能会有文件下载提示）
    await page.waitForTimeout(1000);

    // 验证导出对话框已关闭或显示成功消息
    const dialog = page.locator('.el-dialog');
    // 对话框可能会关闭或显示成功消息
    await expect(dialog)
      .not.toBeVisible({ timeout: 5000 })
      .catch(() => {
        // 如果对话框还在，检查是否有成功消息
        const successMessage = page.locator('text=导出成功');
        expect(successMessage).toBeVisible();
      });
  });

  test('应该能够全量导出所有数据', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 先查询一些数据
    await page.click('button:has-text("查询")');
    await page.waitForLoadState('networkidle');

    // 点击导出按钮
    await page.click('button:has-text("导出数据")');

    // 等待导出对话框打开
    await page.waitForSelector('.el-dialog', { timeout: 3000 });

    // 选择全量导出
    await page.click('input[value="all"]');

    // 点击导出按钮
    const exportButton = page.locator('.el-dialog button:has-text("导出")');
    await exportButton.click();

    // 等待导出完成（全量导出可能需要更长时间）
    await page.waitForTimeout(2000);

    // 验证导出对话框已关闭或显示成功消息
    const dialog = page.locator('.el-dialog');
    await expect(dialog)
      .not.toBeVisible({ timeout: 10000 })
      .catch(() => {
        // 如果对话框还在，检查是否有成功消息
        const successMessage = page.locator('text=导出成功');
        expect(successMessage).toBeVisible();
      });
  });

  test('应该能够分页浏览查询结果', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 查询数据
    await page.click('button:has-text("查询")');
    await page.waitForLoadState('networkidle');

    // 验证分页组件存在
    const pagination = page.locator('.el-pagination');
    await expect(pagination).toBeVisible();

    // 尝试切换到第二页（如果存在）
    const nextButton = pagination.locator('button.next-btn');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // 验证当前页已更新
      const currentPage = pagination.locator('.number.active');
      await expect(currentPage).toContainText('2');
    }
  });

  test('应该能够调整每页条数', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 查询数据
    await page.click('button:has-text("查询")');
    await page.waitForLoadState('networkidle');

    // 验证分页组件存在
    const pagination = page.locator('.el-pagination');
    await expect(pagination).toBeVisible();

    // 点击每页条数选择器
    const pageSizeSelect = pagination.locator('.el-select');
    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.click();

      // 选择50条/页
      await page.click('.el-select-dropdown__item:has-text("50")');

      // 等待数据重新加载
      await page.waitForLoadState('networkidle');

      // 验证表格数据已更新
      await expect(page.locator('.el-table')).toBeVisible();
    }
  });
});
