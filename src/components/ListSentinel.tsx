import { type RefObject } from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface ListSentinelProps {
  sentinelRef: RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  visibleCount: number;
  totalCount: number;
}

export default function ListSentinel({
  sentinelRef,
  hasMore,
  visibleCount,
  totalCount,
}: ListSentinelProps) {
  const { t } = useI18n();

  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="flex items-center justify-center gap-2 py-4"
    >
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {t('common.loadingMore', { loaded: visibleCount, total: totalCount })}
      </span>
    </div>
  );
}
