/**
 * 绩效报表部门查询 E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('绩效报表 - 部门查询', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[placeholder="请输入用户名"]', 'admin');
    await page.fill('input[placeholder="请输入密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('/');
  });

  test('应该能够按部门查询绩效数据', async ({ page }) => {
    // 导航到绩效报表查询页
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击部门选择器
    const departmentInput = page.locator('input[placeholder="请选择部门"]');
    await departmentInput.click();

    // 等待部门树加载
    await page.waitForSelector('.el-tree-v2', { timeout: 5000 });

    // 选择第一个部门节点
    const firstNode = page.locator('.el-tree-node').first();
    await firstNode.click();

    // 点击确定按钮
    await page.click('button:has-text("确定")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够选择包含下级部门', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击部门选择器
    const departmentInput = page.locator('input[placeholder="请选择部门"]');
    await departmentInput.click();

    // 等待部门树加载
    await page.waitForSelector('.el-tree-v2', { timeout: 5000 });

    // 选择部门节点
    const firstNode = page.locator('.el-tree-node').first();
    await firstNode.click();

    // 勾选包含下级部门
    await page.click('input[type="checkbox"] + span:has-text("包含下级部门")');

    // 点击确定按钮
    await page.click('button:has-text("确定")');

    // 点击查询按钮
    await page.click('button:has-text("查询")');

    // 等待数据加载
    await page.waitForLoadState('networkidle');

    // 验证表格存在
    await expect(page.locator('.el-table')).toBeVisible();
  });

  test('应该能够搜索部门', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击部门选择器
    const departmentInput = page.locator('input[placeholder="请选择部门"]');
    await departmentInput.click();

    // 等待部门树加载
    await page.waitForSelector('.el-tree-v2', { timeout: 5000 });

    // 在搜索框中输入关键词
    const searchInput = page.locator('input[placeholder="搜索部门"]');
    await searchInput.fill('技术');

    // 等待搜索结果
    await page.waitForTimeout(500);

    // 验证搜索结果（应该显示匹配的部门）
    const treeNodes = page.locator('.el-tree-node');
    await expect(treeNodes.first()).toBeVisible();
  });

  test('应该能够清空部门选择', async ({ page }) => {
    await page.goto('/performance/reports');
    await page.waitForLoadState('networkidle');

    // 点击部门选择器并选择部门
    const departmentInput = page.locator('input[placeholder="请选择部门"]');
    await departmentInput.click();

    await page.waitForSelector('.el-tree-v2', { timeout: 5000 });
    const firstNode = page.locator('.el-tree-node').first();
    await firstNode.click();
    await page.click('button:has-text("确定")');

    // 再次打开选择器并点击清空
    await departmentInput.click();
    await page.click('button:has-text("清空")');

    // 验证部门选择已清空
    await expect(departmentInput).toHaveValue('');
  });
});
