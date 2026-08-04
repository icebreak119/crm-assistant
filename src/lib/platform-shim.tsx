import { type ReactNode, type MouseEvent } from 'react';
import { Preferences } from '@capacitor/preferences';

/**
 * 平台 SDK 替代模块
 * 用于 Capacitor 独立构建，替代 @lark-apaas/client-toolkit-lite 的运行时导出
 * 通过 vite.config.capacitor.ts 的 alias 重定向到此文件
 */

const CRM_KEY_PREFIX = '__crm_';

/**
 * 启动时调用：从 Preferences（Android SharedPreferences）预加载所有 __crm_* 数据到 localStorage。
 * 解决 Android WebView 杀应用后 localStorage 被清除导致数据丢失的问题。
 *
 * 流程：Preferences.keys() → 过滤 __crm_ 前缀 → 逐条 get → 写入 localStorage
 */
export async function initStorage(): Promise<void> {
  try {
    const { keys } = await Preferences.keys();
    const crmKeys = keys.filter((k) => k.startsWith(CRM_KEY_PREFIX));
    await Promise.all(
      crmKeys.map(async (key) => {
        const { value } = await Preferences.get({ key });
        if (value !== null) {
          localStorage.setItem(key, value);
        }
      }),
    );
  } catch {
    // 预加载失败不阻塞启动，降级用空 localStorage
  }
}

// scopedStorage → localStorage 做同步读写缓存，Preferences 做持久化备份
export const scopedStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
      // fire-and-forget：异步写入 Preferences（SharedPreferences），不阻塞 UI
      Preferences.set({ key, value }).catch(() => {});
    } catch {
      // 忽略存储满或隐私模式错误
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      // 同步删除 Preferences 中的对应 key
      Preferences.remove({ key }).catch(() => {});
    } catch {
      // 忽略
    }
  },
};

// UniversalLink → 用 span+onClick 实现，避免 auto-fix 将 a 标签替换为 UniversalLink 导致循环引用
export function UniversalLink({ to, children, ...rest }: { to: string; children: ReactNode; [key: string]: unknown }) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    window.open(to, '_blank');
  };
  return (
    <span
      onClick={handleClick}
      role="link"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      {...rest}
    >
      {children}
    </span>
  );
}

// AppContainer → 透传组件（原平台 SDK 提供应用容器，独立运行不需要）
export function AppContainer({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// ErrorRender → 基础错误显示（原平台 SDK 提供错误渲染，这里用内联样式确保无 CSS 依赖）
export function ErrorRender({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary?: () => void }) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div style={{
      padding: '24px',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h2 style={{ color: '#c0392b', fontSize: '20px', marginBottom: '8px' }}>
        应用出错了
      </h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        {msg}
      </p>
    </div>
  );
}
