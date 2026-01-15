/**
 * 检测是否在 iframe 中运行的 Composable
 */
/* eslint-disable no-console */
import { ref, onMounted } from 'vue';

/**
 * 检测当前页面是否在 iframe 中运行
 * @returns 返回一个响应式的布尔值，表示是否在 iframe 中
 */
export function useIframe() {
  const isInIframe = ref(false);

  /**
   * 打印从上层 iframe 能获取的信息
   */
  const logIframeInfo = () => {
    console.group('🔍 从上层 iframe 获取的信息');

    // 1. 基本 iframe 检测
    console.log('=== 基本 iframe 检测 ===');
    try {
      const isInIframeValue = window.self !== window.top;
      console.log('✅ 是否在 iframe 中:', isInIframeValue);
      console.log('window.self === window.top:', window.self === window.top);
    } catch (e) {
      console.log('❌ 无法检测 iframe 状态（可能跨域）:', e);
    }

    // 2. Cookie 信息
    console.log('\n=== Cookie 信息 ===');
    try {
      const cookies = document.cookie;
      if (cookies) {
        console.log('✅ 当前页面的 Cookie:', cookies);
        const cookieList = cookies.split(';').map((c) => c.trim());
        console.log('Cookie 列表:', cookieList);
      } else {
        console.log('⚠️ 当前页面没有 Cookie');
      }
    } catch (e) {
      console.log('❌ 无法访问 Cookie:', e);
    }

    // 3. localStorage 信息
    console.log('\n=== localStorage 信息 ===');
    try {
      const localStorageKeys = Object.keys(localStorage);
      if (localStorageKeys.length > 0) {
        console.log('✅ localStorage 键列表:', localStorageKeys);
        const localStorageData: Record<string, string> = {};
        localStorageKeys.forEach((key) => {
          try {
            localStorageData[key] = localStorage.getItem(key) || '';
          } catch {
            localStorageData[key] = '[无法读取]';
          }
        });
        console.log('localStorage 数据:', localStorageData);
      } else {
        console.log('⚠️ localStorage 为空');
      }
    } catch (e) {
      console.log('❌ 无法访问 localStorage:', e);
    }

    // 4. sessionStorage 信息
    console.log('\n=== sessionStorage 信息 ===');
    try {
      const sessionStorageKeys = Object.keys(sessionStorage);
      if (sessionStorageKeys.length > 0) {
        console.log('✅ sessionStorage 键列表:', sessionStorageKeys);
        const sessionStorageData: Record<string, string> = {};
        sessionStorageKeys.forEach((key) => {
          try {
            sessionStorageData[key] = sessionStorage.getItem(key) || '';
          } catch {
            sessionStorageData[key] = '[无法读取]';
          }
        });
        console.log('sessionStorage 数据:', sessionStorageData);
      } else {
        console.log('⚠️ sessionStorage 为空');
      }
    } catch (e) {
      console.log('❌ 无法访问 sessionStorage:', e);
    }

    // 5. 上层窗口信息（window.parent）
    console.log('\n=== 上层窗口信息 (window.parent) ===');
    try {
      if (window.parent && window.parent !== window.self) {
        console.log('✅ 可以访问 window.parent');
        try {
          console.log('parent.location.href:', window.parent.location.href);
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          console.log('❌ 无法访问 parent.location.href (跨域限制):', error);
        }
        try {
          console.log('parent.location.origin:', window.parent.location.origin);
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          console.log('❌ 无法访问 parent.location.origin (跨域限制):', error);
        }
        try {
          console.log(
            'parent.document:',
            window.parent.document ? '可访问' : '不可访问',
          );
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          console.log('❌ 无法访问 parent.document (跨域限制):', error);
        }
      } else {
        console.log('⚠️ window.parent 不可用或与当前窗口相同');
      }
    } catch (e) {
      console.log('❌ 无法访问 window.parent:', e);
    }

    // 6. 顶层窗口信息（window.top）
    console.log('\n=== 顶层窗口信息 (window.top) ===');
    try {
      if (window.top && window.top !== window.self) {
        console.log('✅ 可以访问 window.top');
        try {
          console.log('top.location.href:', window.top.location.href);
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          console.log('❌ 无法访问 top.location.href (跨域限制):', error);
        }
        try {
          console.log('top.location.origin:', window.top.location.origin);
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          console.log('❌ 无法访问 top.location.origin (跨域限制):', error);
        }
        try {
          console.log(
            'top.document:',
            window.top.document ? '可访问' : '不可访问',
          );
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          console.log('❌ 无法访问 top.document (跨域限制):', error);
        }
      } else {
        console.log('⚠️ window.top 不可用或与当前窗口相同');
      }
    } catch (e) {
      console.log('❌ 无法访问 window.top:', e);
    }

    // 7. 当前窗口信息
    console.log('\n=== 当前窗口信息 ===');
    console.log('当前 URL:', window.location.href);
    console.log('当前 Origin:', window.location.origin);
    console.log('当前 Host:', window.location.host);
    console.log('当前 Pathname:', window.location.pathname);
    console.log('当前 Search:', window.location.search);
    console.log('当前 Hash:', window.location.hash);

    // 8. Referrer 信息
    console.log('\n=== Referrer 信息 ===');
    try {
      const referrer = document.referrer;
      if (referrer) {
        console.log('✅ Referrer:', referrer);
      } else {
        console.log('⚠️ 没有 Referrer 信息');
      }
    } catch (e) {
      console.log('❌ 无法访问 Referrer:', e);
    }

    // 9. PostMessage 通信能力检测
    console.log('\n=== PostMessage 通信能力 ===');
    try {
      if (window.parent && window.parent !== window.self) {
        console.log('✅ 可以使用 window.parent.postMessage 与上层通信');
        console.log('示例: window.parent.postMessage({type: "test"}, "*")');
      } else {
        console.log('⚠️ 无法使用 postMessage（不在 iframe 中）');
      }
    } catch (e) {
      console.log('❌ PostMessage 检测失败:', e);
    }

    // 10. IndexedDB 信息（如果存在）
    console.log('\n=== IndexedDB 信息 ===');
    try {
      if ('indexedDB' in window) {
        console.log('✅ 支持 IndexedDB');
        // 注意：IndexedDB 的数据库列表需要异步获取，这里只做基本检测
      } else {
        console.log('⚠️ 不支持 IndexedDB');
      }
    } catch (e) {
      console.log('❌ IndexedDB 检测失败:', e);
    }

    console.groupEnd();
  };

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

    // 打印详细信息
    logIframeInfo();
  };

  onMounted(() => {
    checkIframe();
  });

  return {
    isInIframe,
    logIframeInfo, // 导出函数以便手动调用
  };
}
