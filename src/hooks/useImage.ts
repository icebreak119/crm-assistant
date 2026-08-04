/**
 * 图片引用解析 Hook
 *
 * 根据 src 前缀自动选择解析方式：
 * - `data:` 开头（旧 base64）→ 直接透传
 * - `idb:` 开头（IndexedDB 引用键）→ 异步从 IndexedDB 加载，内存缓存
 * - 其他（外部 URL）→ 直接透传
 * - undefined → 返回 undefined
 */

import { useState, useEffect } from 'react';
import { getImage } from '@/lib/imageDB';

const cache = new Map<string, string>();

export function useImage(src: string | undefined): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(() => {
    if (!src) return undefined;
    if (src.startsWith('data:')) return src;
    if (src.startsWith('idb:')) return cache.get(src);
    return src;
  });

  useEffect(() => {
    if (!src) {
      setResolved(undefined);
      return;
    }

    // base64 旧数据 → 直接透传
    if (src.startsWith('data:')) {
      setResolved(src);
      return;
    }

    // IndexedDB 引用键 → 异步加载
    if (src.startsWith('idb:')) {
      const cached = cache.get(src);
      if (cached) {
        setResolved(cached);
        return;
      }

      let cancelled = false;
      getImage(src)
        .then((data) => {
          if (cancelled) return;
          if (data) {
            cache.set(src, data);
            setResolved(data);
          } else {
            setResolved(undefined);
          }
        })
        .catch(() => {
          if (!cancelled) setResolved(undefined);
        });

      return () => {
        cancelled = true;
      };
    }

    // 外部 URL → 直接透传
    setResolved(src);
  }, [src]);

  return resolved;
}
