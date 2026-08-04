import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AppContainer, ErrorRender, initStorage } from '@/lib/platform-shim';
import App from './app';
import './index.css';

/**
 * Capacitor 入口文件
 * 与 src/index.tsx 的区别：
 * 1. 使用 HashRouter 替代 BrowserRouter（Capacitor 的 https 协议不支持 HTML5 history API）
 * 2. async bootstrap：启动时先从 Preferences 预加载持久化数据到 localStorage，再渲染 React
 */

async function bootstrap() {
  const rootEl = document.getElementById('root')!;

  // 显示加载状态
  rootEl.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;color:#214A83;font-size:16px;">加载中…</div>';

  // 预加载持久化数据（Android SharedPreferences → localStorage 缓存）
  await initStorage();

  createRoot(rootEl).render(
    <StrictMode>
      <HashRouter>
        <AppContainer>
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <ErrorRender error={error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <App />
          </ErrorBoundary>
        </AppContainer>
      </HashRouter>
    </StrictMode>,
  );
}

bootstrap();
