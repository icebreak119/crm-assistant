import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Capacitor 独立构建配置
 * 用法：npx vite build --config vite.config.capacitor.ts
 *
 * 与平台构建的区别：
 * - 使用标准 vite defineConfig（不依赖 @lark-apaas/coding-preset-vite-react）
 * - base 设为 './'（Capacitor 需要相对路径加载资源）
 * - alias 将 @lark-apaas/client-toolkit-lite 重定向到 src/lib/platform-shim.tsx
 * - 入口 HTML 指向 index.capacitor.html（使用 HashRouter）
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: {
    alias: [
      { find: '@shared', replacement: path.resolve(__dirname, 'shared') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      // 正则 $ 精确匹配包名，不匹配子路径（如 /styles.css 仍从 node_modules 解析）
      { find: /^@lark-apaas\/client-toolkit-lite$/, replacement: path.resolve(__dirname, 'src/lib/platform-shim.tsx') },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.capacitor.html'),
    },
  },
});
