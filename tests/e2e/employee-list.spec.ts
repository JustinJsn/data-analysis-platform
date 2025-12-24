/**
 * 员工列表 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('员工列表', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');

    // 导航到员工列表
    await page.goto('/employees');
  });

  test('应该显示员工列表', async ({ page }) => {
    // 等待表格加载
    await expect(page.locator('.el-table')).toBeVisible();

    // 验证表格列
    await expect(page.locator('th:has-text("员工编号")')).toBeVisible();
    await expect(page.locator('th:has-text("姓名")')).toBeVisible();
    await expect(page.locator('th:has-text("手机号")')).toBeVisible();
  });

  test('应该能够搜索员工', async ({ page }) => {
    // 输入搜索关键词
    await page.fill('input[placeholder="输入姓名进行搜索"]', '张三');

    // 点击搜索按钮
    await page.click('button:has-text("搜索")');

    // 等待表格更新
    await page.waitForTimeout(500);

    // 验证搜索结果
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够切换分页', async ({ page }) => {
    // 等待表格加载
    await expect(page.locator('.el-table')).toBeVisible();

    // 点击下一页
    await page.click('.el-pagination .btn-next');

    // 等待表格更新
    await page.waitForTimeout(500);

    // 验证分页器更新
    await expect(page.locator('.el-pagination .is-active')).toContainText('2');
  });

  test('应该能够查看员工详情', async ({ page }) => {
    // 等待表格加载
    await expect(page.locator('.el-table')).toBeVisible();

    // 点击第一个查看详情按钮
    await page.click('button:has-text("查看详情")').first();

    // 验证跳转到详情页
    await expect(page).toHaveURL(/\/employees\/\w+/);

    // 验证详情页内容
    await expect(page.locator('.el-descriptions')).toBeVisible();
  });
});
