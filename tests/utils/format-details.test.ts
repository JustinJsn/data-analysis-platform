/**
 * formatDetails 工具函数测试
 */
import { describe, it, expect } from 'vitest';

/**
 * 格式化详情信息（从SyncBatchDetailPage.vue提取）
 */
const formatDetails = (
  details: string | Record<string, any> | undefined,
): string => {
  if (!details) return '-';

  // 如果是字符串，尝试解析JSON并提取关键信息
  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      // 提取关键字段用于表格显示
      const keyFields: string[] = [];
      if (parsed.code) keyFields.push(`code: ${parsed.code}`);
      if (parsed.name) keyFields.push(`name: ${parsed.name}`);
      if (parsed.oId) keyFields.push(`oId: ${parsed.oId}`);

      // 如果有关键字段，显示关键字段；否则显示完整JSON（单行）
      return keyFields.length > 0
        ? keyFields.join(', ')
        : JSON.stringify(parsed);
    } catch {
      return details;
    }
  }

  // 如果是对象，提取关键信息
  const keyFields: string[] = [];
  if (details.code) keyFields.push(`code: ${details.code}`);
  if (details.name) keyFields.push(`name: ${details.name}`);
  if (details.oId) keyFields.push(`oId: ${details.oId}`);

  return keyFields.length > 0 ? keyFields.join(', ') : JSON.stringify(details);
};

describe('formatDetails', () => {
  it('应该处理空值', () => {
    expect(formatDetails(undefined)).toBe('-');
    expect(formatDetails(null as any)).toBe('-');
  });

  it('应该提取JSON字符串中的关键字段', () => {
    const jsonStr =
      '{"oId": 1725925, "code": "12105057", "name": "集团部门", "status": 1}';
    const result = formatDetails(jsonStr);
    expect(result).toBe('code: 12105057, name: 集团部门, oId: 1725925');
  });

  it('应该处理只有部分关键字段的JSON', () => {
    const jsonStr = '{"oId": 900612450, "status": 1}';
    const result = formatDetails(jsonStr);
    expect(result).toBe('oId: 900612450');
  });

  it('应该处理没有关键字段的JSON', () => {
    const jsonStr = '{"status": 1, "other": "value"}';
    const result = formatDetails(jsonStr);
    expect(result).toBe('{"status":1,"other":"value"}');
  });

  it('应该处理无效的JSON字符串', () => {
    const invalidJson = 'not a json string';
    expect(formatDetails(invalidJson)).toBe('not a json string');
  });

  it('应该处理对象输入', () => {
    const obj = {
      oId: 1725925,
      code: '12105057',
      name: '集团部门',
      status: 1,
    };
    const result = formatDetails(obj);
    expect(result).toBe('code: 12105057, name: 集团部门, oId: 1725925');
  });

  it('应该处理没有关键字段的对象', () => {
    const obj = { status: 1, other: 'value' };
    const result = formatDetails(obj);
    expect(result).toBe('{"status":1,"other":"value"}');
  });

  it('应该按顺序显示关键字段（code, name, oId）', () => {
    const jsonStr =
      '{"name": "测试", "oId": 123, "code": "TEST", "other": "ignored"}';
    const result = formatDetails(jsonStr);
    expect(result).toBe('code: TEST, name: 测试, oId: 123');
  });
});
