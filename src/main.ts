import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
// 导入 Element Plus 暗黑模式样式
import 'element-plus/theme-chalk/dark/css-vars.css';
import App from './App.vue';
import router from './router';

// 导入全局样式
import './style.css';
import './assets/styles/theme.css';
import './assets/styles/components.css';

// 创建应用实例
const app = createApp(App);
const pinia = createPinia();

// 配置 Element Plus（包含中文语言包）
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
  locale: zhCn,
});

// 注册插件
app.use(pinia);
app.use(router);

// 初始化主题（在挂载前设置，避免闪烁）
import { useAppStore } from '@/stores/app';
const appStore = useAppStore();
appStore.initTheme();

// 挂载应用
app.mount('#app');
