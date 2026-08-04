import { useState } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import zipUrl from '@/assets/crm-android-project.zip?url';

type Status = 'idle' | 'downloading' | 'done';

export default function ApkDownloadButton() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleDownload() {
    if (status === 'downloading') return;

    setStatus('downloading');
    try {
      // Blob 方式下载，在飞书 webview 中比 <a download> 更可靠
      const res = await fetch(zipUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'crm-android-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 延迟释放，确保下载已触发
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

      setStatus('done');
      toast.success('下载已触发，请在浏览器下载目录查看');
    } catch {
      // 降级：直接打开 URL
      try {
        window.open(zipUrl, '_blank');
        setStatus('done');
        toast.success('已在新窗口打开下载链接');
      } catch {
        setStatus('idle');
        toast.error('下载失败，请复制链接后在浏览器打开');
      }
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={status === 'downloading'}
      className="fixed top-3 right-3 z-[60] flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg transition-all active:scale-95 hover:opacity-90"
    >
      {status === 'downloading' ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : status === 'done' ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <Download className="size-3.5" />
      )}
      <span>
        {status === 'downloading'
          ? '下载中…'
          : status === 'done'
            ? '已下载'
            : 'APK 下载'}
      </span>
    </button>
  );
}
