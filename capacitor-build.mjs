/**
 * Capacitor 构建脚本
 * 用法：node capacitor-build.mjs
 *
 * 作用：
 * 1. 用 vite.config.capacitor.ts 构建静态资源到 dist/
 * 2. 将 dist/index.capacitor.html 重命名为 dist/index.html（Capacitor 要求）
 *
 * 后续步骤（在本地执行）：
 *   npx cap add android      # 创建 Android 原生项目
 *   npx cap sync              # 同步 Web 资源
 *   npx cap open android      # 用 Android Studio 打开
 *   # Android Studio → Build > Build Bundle(s) / APK(s) > Build APK(s)
 */
import { build } from 'vite';
import { renameSync, existsSync } from 'fs';
import { resolve } from 'path';

console.log('📦 开始 Capacitor 构建...\n');

try {
  await build({
    configFile: './vite.config.capacitor.ts',
  });

  // Vite 用输入文件名作为输出文件名，需要重命名为 index.html
  const distDir = resolve(process.cwd(), 'dist');
  const from = resolve(distDir, 'index.capacitor.html');
  const to = resolve(distDir, 'index.html');

  if (existsSync(from)) {
    renameSync(from, to);
    console.log('✅ 已重命名 index.capacitor.html → index.html');
  }

  console.log('\n✅ 构建完成！静态资源已输出到 dist/\n');
  console.log('📋 后续步骤：');
  console.log('   1. npx cap add android     （创建 Android 项目，只需执行一次）');
  console.log('   2. npx cap sync             （同步 Web 资源到 Android 项目）');
  console.log('   3. npx cap open android     （用 Android Studio 打开）');
  console.log('   4. Android Studio → Build > Build Bundle(s) / APK(s) > Build APK(s)');
} catch (err) {
  console.error('\n❌ 构建失败:', err);
  process.exit(1);
}
