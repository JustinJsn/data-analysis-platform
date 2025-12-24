/**
 * DataCard 组件测试
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DataCard from '@/components/business/DataCard.vue';
import { User } from '@element-plus/icons-vue';

describe('DataCard Component', () => {
  it('应该正确渲染标题和数值', () => {
    const wrapper = mount(DataCard, {
      props: {
        title: '员工总数',
        value: 1234,
        icon: User,
      },
    });

    expect(wrapper.text()).toContain('员工总数');
    expect(wrapper.text()).toContain('1,234');
  });

  it('应该格式化数字值', () => {
    const wrapper = mount(DataCard, {
      props: {
        title: '测试',
        value: 1234567,
        icon: User,
      },
    });

    expect(wrapper.text()).toContain('1,234,567');
  });

  it('应该显示字符串值', () => {
    const wrapper = mount(DataCard, {
      props: {
        title: '测试',
        value: '自定义文本',
        icon: User,
      },
    });

    expect(wrapper.text()).toContain('自定义文本');
  });

  it('当有 trend 时应该显示趋势信息', () => {
    const wrapper = mount(DataCard, {
      props: {
        title: '员工总数',
        value: 100,
        icon: User,
        trend: 10,
      },
    });

    expect(wrapper.find('.trend').exists()).toBe(true);
    expect(wrapper.text()).toContain('10%');
    expect(wrapper.text()).toContain('较上次');
  });

  it('应该根据 trend 显示正确的样式类', () => {
    // 上升趋势
    const wrapperUp = mount(DataCard, {
      props: {
        title: '测试',
        value: 100,
        icon: User,
        trend: 10,
      },
    });
    expect(wrapperUp.find('.trend.up').exists()).toBe(true);

    // 下降趋势
    const wrapperDown = mount(DataCard, {
      props: {
        title: '测试',
        value: 100,
        icon: User,
        trend: -5,
      },
    });
    expect(wrapperDown.find('.trend.down').exists()).toBe(true);

    // 无变化
    const wrapperNeutral = mount(DataCard, {
      props: {
        title: '测试',
        value: 100,
        icon: User,
        trend: 0,
      },
    });
    expect(wrapperNeutral.find('.trend.neutral').exists()).toBe(true);
  });

  it('应该应用自定义图标背景', () => {
    const customBg = 'linear-gradient(135deg, #ff0000 0%, #0000ff 100%)';
    const wrapper = mount(DataCard, {
      props: {
        title: '测试',
        value: 100,
        icon: User,
        iconBg: customBg,
      },
    });

    const iconElement = wrapper.find('.card-icon');
    expect(iconElement.attributes('style')).toContain(customBg);
  });
});
