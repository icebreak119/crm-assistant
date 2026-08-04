import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ListSentinel from '@/components/ListSentinel';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { IReminder } from '@/data/crm';

type FilterType = 'all' | 'pending' | 'overdue' | 'done';

const TABS: { value: FilterType; labelKey: string }[] = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'pending', labelKey: 'reminders.pending' },
  { value: 'overdue', labelKey: 'reminders.overdue' },
  { value: 'done', labelKey: 'reminders.completed' },
];

export default function RemindersPage() {
  const { reminders, completeReminder, deleteReminder } = useCrm();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterType>('all');
  const [deleteTarget, setDeleteTarget] = useState<IReminder | null>(null);

  const now = Date.now();

  const filtered = useMemo(() => {
    const enriched = reminders.map((r) => ({
      ...r,
      isOverdue: r.status === 'pending' && r.remindAt < now,
    }));

    let result = enriched;
    switch (filter) {
      case 'pending':
        result = enriched.filter((r) => r.status === 'pending' && !r.isOverdue);
        break;
      case 'overdue':
        result = enriched.filter((r) => r.isOverdue);
        break;
      case 'done':
        result = enriched.filter((r) => r.status === 'done');
        break;
    }

    return result.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.remindAt - b.remindAt;
    });
  }, [reminders, filter, now]);

  const { visibleItems, hasMore, sentinelRef, visibleCount, totalCount } = useInfiniteList(filtered);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteReminder(deleteTarget.id);
    setDeleteTarget(null);
    toast.success(t('reminders.deleted'));
  };

  return (
    <div className="min-h-screen">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold">{t('reminders.title')}</h1>
        </div>
        {/* 筛选 Tab */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm transition-colors',
                filter === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-muted-foreground',
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* 提醒列表 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="space-y-3 p-4"
        >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <Bell className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t('reminders.empty')}</p>
          </div>
        ) : (
          <>
          {visibleItems.map((r, i) => {
            const date = new Date(r.remindAt);
            return (
              <>
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3), ease: 'easeOut' }}
                >
                <Card
                  className={cn(
                    'cursor-pointer transition-colors active:bg-accent/50',
                    r.isOverdue && 'border-destructive/30',
                  )}
                  onClick={() => navigate(`/customers/${r.customerId}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {r.customerName}
                          </span>
                          {r.isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              {t('reminders.overdue')}
                            </Badge>
                          )}
                          {r.status === 'done' && (
                            <Badge variant="secondary" className="text-xs">
                              {t('reminders.completed')}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {t('reminders.dateTime', {
                            month: date.getMonth() + 1,
                            day: date.getDate(),
                            time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
                          })}
                        </p>
                        {r.note && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {r.note}
                          </p>
                        )}
                        {r.calendarSynced && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="size-3" />
                            {t('reminders.calendarSynced')}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        {r.status === 'pending' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              completeReminder(r.id);
                            }}
                            aria-label={t('reminders.complete')}
                          >
                            <Check className="size-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-9"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(r);
                          }}
                          aria-label={t('common.delete')}
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              </>
            );
          })}
          <ListSentinel sentinelRef={sentinelRef} hasMore={hasMore} visibleCount={visibleCount} totalCount={totalCount} />
          </>
        )}
        </motion.div>
      </AnimatePresence>

      {/* 删除确认 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reminders.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reminders.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
