import { Download, FileArchive, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Vite 通过 ?url 后缀将 zip 文件作为模块资产导入，绕过 publicDir 不提供静态文件的限制
import zipUrl from "@/assets/crm-android-project.zip?url";
import { UniversalLink } from '@lark-apaas/client-toolkit-lite';

export default function DownloadPage() {
  const [status, setStatus] = useState<"idle" | "downloading" | "done">("idle");

  // 页面加载后自动触发下载
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("downloading");
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = "crm-android-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatus("done");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-sm border border-border p-8 space-y-6">
        {/* 图标 */}
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileArchive className="size-8 text-primary" />
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-foreground">Android 工程下载</h1>
          <p className="text-sm text-muted-foreground">
            含预生成的 Android 原生项目 + Web 资源 + 完整源码，共 1.7MB
          </p>
        </div>

        {/* 状态指示 */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {status === "idle" && (
            <>
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">准备下载…</span>
            </>
          )}
          {status === "downloading" && (
            <>
              <Loader2 className="size-4 animate-spin text-primary" />
              <span className="text-primary">正在下载…</span>
            </>
          )}
          {status === "done" && (
            <>
              <CheckCircle2 className="size-4 text-success" />
              <span className="text-success">下载已触发</span>
            </>
          )}
        </div>

        {/* 手动下载按钮 */}
        <UniversalLink
          to={zipUrl}
          download="crm-android-project.zip"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="size-4" />
          手动下载 crm-android-project.zip
        </UniversalLink>

        {/* 操作步骤 */}
        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-xs font-medium text-foreground">下载后操作步骤：</p>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>解压到本地任意目录</li>
            <li>用 Android Studio 打开 <code className="text-foreground">android/</code> 文件夹</li>
            <li>等待 Gradle sync 完成（首次需联网下载依赖）</li>
            <li>菜单 <code className="text-foreground">Build → Build APK(s)</code></li>
            <li>
              APK 输出路径：
              <code className="block text-foreground mt-1 break-all">
                android/app/build/outputs/apk/debug/app-debug.apk
              </code>
            </li>
          </ol>
        </div>

        {/* 返回应用 */}
        <UniversalLink
          to="/"
          className="flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
        >
          <Smartphone className="size-3.5" />
          返回客户管理应用
        </UniversalLink>
      </div>
    </div>
  );
}
