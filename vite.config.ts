import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';

const pathSrc = path.resolve(__dirname, 'src');

// https://vite.dev/config/
export default defineConfig({
  base: '/italent-report/',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep'],
        }),
        ElementPlusResolver(),
      ],
      dts: path.resolve(pathSrc, 'components.d.ts'),
    }),
    Icons({
      autoInstall: true,
    }),

    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.css'],
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080/italent-report',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    server: {
      deps: {
        inline: ['element-plus'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
      ],
    },
  },
  // 实验性功能：启用原生插件以提升性能
  experimental: {
    // 启用 Rolldown 原生插件（默认为 'v1'）
    enableNativePlugin: 'v1',
  },
  build: {
    rollupOptions: {
      output: {
        // 使用 advancedChunks 替代已废弃的 manualChunks
        // advancedChunks 提供更精细的 chunk 分割控制
        advancedChunks: {
          groups: [
            {
              name: 'vue-core',
              // 将 Vue 相关库分离到单独的 chunk
              test: /[\\/]node_modules[\\/](vue|vue-router|pinia)[\\/]/,
            },
            {
              name: 'element-plus',
              // 将 Element Plus 分离到单独的 chunk
              test: /[\\/]node_modules[\\/](element-plus|@element-plus[\\/]icons-vue)[\\/]/,
            },
            {
              name: 'vendor',
              // 将其他大型依赖分离
              test: /[\\/]node_modules[\\/](axios|nprogress)[\\/]/,
            },
          ],
        },
      },
    },
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 使用 Lightning CSS 进行 CSS 压缩（Rolldown 默认）
    // 使用 Oxc minifier 进行 JS 压缩（Rolldown 默认）
    minify: 'oxc', // 使用 Oxc 压缩器（Rolldown 默认，无需 esbuild）
  },
});
