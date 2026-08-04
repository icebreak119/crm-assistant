import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, Download, Star, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';
import { downloadCSV } from '@/lib/csv';
import CustomerCard from '@/components/CustomerCard';
import ListSentinel from '@/components/ListSentinel';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { springEntrance } from '@/lib/motion';

export default function CustomersPage() {
  const { customers, groups } = useCrm();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [keyword, setKeyword] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

  const filtered = useMemo(() => {
    let result = customers;
    if (activeGroup !== 'all') {
      result = result.filter((c) => c.groupId === activeGroup);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(kw) ||
          (c.company?.toLowerCase().includes(kw) ?? false) ||
          c.phone.includes(kw),
      );
    }
    return [...result].sort((a, b) => {
      if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  }, [customers, activeGroup, keyword]);

  const { visibleItems, hasMore, sentinelRef, visibleCount, totalCount: listTotalCount } = useInfiniteList(filtered);
  const totalCount = customers.length;
  const starredCount = customers.filter((c) => c.isStarred).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayNewCount = customers.filter((c) => c.createdAt >= todayStart.getTime()).length;

  const handleExport = () => {
    const headers = [
      t('csv.name'),
      t('csv.gender'),
      t('csv.phone'),
      t('csv.company'),
      t('csv.companyAddress'),
      t('csv.intendedProduct'),
      t('csv.tags'),
      t('csv.group'),
      t('csv.starred'),
      t('csv.description'),
      t('csv.remark'),
      t('csv.createdAt'),
    ];
    const groupName = (gid: string) => groups.find((g) => g.id === gid)?.name ?? '';
    const exportRows = filtered.map((c) => [
      c.name,
      c.gender === 'female' ? t('common.female') : t('common.male'),
      c.phone,
      c.company ?? '',
      c.companyAddress ?? '',
      c.intendedProduct ?? '',
      (c.tags ?? []).join('; '),
      groupName(c.groupId),
      c.isStarred ? t('common.yes') : t('common.no'),
      c.description ?? '',
      c.remark ?? '',
      format(new Date(c.createdAt), 'yyyy-MM-dd'),
    ]);
    downloadCSV(`${t('customers.exportName')}_${format(new Date(), 'yyyyMMdd')}.csv`, headers, exportRows);
    toast.success(t('customers.exported', { count: filtered.length }));
  };

  return (
    <div className="min-h-screen">
      {/* 渐变头部：标题 + 统计胶囊（随内容滚走，不固定） */}
      <div className="bg-gradient-to-br from-primary to-primary/85 px-4 pt-4 pb-3 shadow-lg shadow-primary/20">
        {/* 标题 */}
        <h1 className="mb-3 text-xl font-bold text-white">{t('customers.title')}</h1>

        {/* 统计概览胶囊 */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
            <Users className="size-3.5 text-white/70" />
            <span className="text-xs font-semibold text-white tabular-nums">{totalCount}</span>
            <span className="text-xs text-white/60">{t('customers.stats.total')}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
            <Star className="size-3.5 fill-amber-300 text-amber-300" />
            <span className="text-xs font-semibold text-white tabular-nums">{starredCount}</span>
            <span className="text-xs text-white/60">{t('customers.stats.starred')}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-sm">
            <CalendarPlus className="size-3.5 text-white/70" />
            <span className="text-xs font-semibold text-white tabular-nums">{todayNewCount}</span>
            <span className="text-xs text-white/60">{t('customers.stats.todayNew')}</span>
          </div>
        </div>
      </div>

      {/* sticky 紧凑区：搜索框 + 分组 Tab（保持固定） */}
      <div className="sticky top-0 z-40 bg-primary pb-2 shadow-lg shadow-primary/20">
        {/* 搜索框 */}
        <div className="flex gap-2 px-4 pb-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('customers.search')}
              className="border-white/20 bg-white/15 pl-9 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-white/20 bg-white/15 text-white hover:bg-white/25 hover:text-white"
            onClick={handleExport}
            aria-label={t('common.export')}
          >
            <Download className="size-4" />
          </Button>
        </div>

        {/* 分组 Tab */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setActiveGroup('all')}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm transition-all',
              activeGroup === 'all'
                ? 'bg-white text-primary font-semibold shadow-sm'
                : 'border border-white/20 bg-white/10 text-white/70',
            )}
          >
            {t('common.all')} ({totalCount})
          </button>
          {groups.map((g) => {
            const count = customers.filter((c) => c.groupId === g.id).length;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm transition-all',
                  activeGroup === g.id
                    ? 'bg-white text-primary font-semibold shadow-sm'
                    : 'border border-white/20 bg-white/10 text-white/70',
                )}
              >
                {g.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 客户列表 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="space-y-3 p-4"
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              {/* 装饰性空状态 */}
              <div className="relative mb-4">
                <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-amber-400/10">
                  <Users className="size-9 text-primary/40" />
                </div>
                {/* 装饰小圆点 */}
                <span className="absolute -left-1 top-1 size-2 rounded-full bg-primary/20" />
                <span className="absolute -right-1 top-3 size-2 rounded-full bg-amber-400/30" />
                <span className="absolute bottom-0 -right-2 size-1.5 rounded-full bg-rose-400/30" />
              </div>
              <p className="mb-1 text-muted-foreground">
                {keyword || activeGroup !== 'all'
                  ? t('customers.empty.noMatch')
                  : t('customers.empty.noData')}
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('customers.empty.addFirst')}
              </p>
              <Button
                onClick={() => navigate('/customers/new')}
                className="bg-gradient-to-r from-primary to-primary/90 shadow-md shadow-primary/20"
              >
                <Plus className="size-4" />
                {t('customers.add')}
              </Button>
            </div>
          ) : (
            <>
              {visibleItems.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springEntrance, delay: Math.min(i * 0.03, 0.3) }}
                >
                  <CustomerCard customer={c} />
                </motion.div>
              ))}
              <ListSentinel sentinelRef={sentinelRef} hasMore={hasMore} visibleCount={visibleCount} totalCount={listTotalCount} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
