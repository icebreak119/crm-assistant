import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

/**
 * 通用无限滚动 hook（IntersectionObserver 驱动，零依赖）
 *
 * @param items    已经过筛选/排序的完整数组
 * @param pageSize 每页渲染条数，默认 20
 */
export function useInfiniteList<T>(items: T[], pageSize = 20) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 源数组变化（筛选/搜索/数据增删）时重置为第一页
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + pageSize);
  }, [pageSize]);

  // IntersectionObserver 自动触发加载
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return {
    visibleItems,
    hasMore,
    sentinelRef,
    totalCount: items.length,
    visibleCount,
  };
}
