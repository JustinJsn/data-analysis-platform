/**
 * 检测是否在 iframe 中运行的 Composable
 */
import { ref, onMounted } from 'vue';

/**
 * 检测当前页面是否在 iframe 中运行
 * @returns 返回一个响应式的布尔值，表示是否在 iframe 中
 */
export function useIframe() {
  const isInIframe = ref(false);

  const checkIframe = () => {
    try {
      // 方法1: 检查 window.self 和 window.top 是否相同
      // 如果在 iframe 中，window.self !== window.top
      isInIframe.value = window.self !== window.top;
    } catch {
      // 如果跨域导致无法访问 window.top，也会抛出异常
      // 这种情况下也认为是在 iframe 中
      isInIframe.value = true;
    }
  };

  onMounted(() => {
    checkIframe();
  });

  return {
    isInIframe,
  };
}
