/**
 * 主题切换 Composable
 */
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';

export function useTheme() {
  const appStore = useAppStore();

  const theme = computed(() => appStore.theme);
  const isDark = computed(() => appStore.theme === 'dark');

  const toggleTheme = () => {
    appStore.toggleTheme();
  };

  const setTheme = (theme: 'light' | 'dark') => {
    appStore.setTheme(theme);
  };

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
  };
}
