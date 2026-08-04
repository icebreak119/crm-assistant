import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import { ORDER_STATUS_CONFIG } from '@/lib/order-status';
import { downloadCSV } from '@/lib/csv';
import { Card, CardContent } from '@/components/ui/card';
import ListSentinel from '@/components/ListSentinel';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'draft' | 'confirmed' | 'shipped' | 'paid' | 'cancelled';

const TABS: { value: FilterType; labelKey: string }[] = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'draft', labelKey: 'orders.filter.draft' },
  { value: 'confirmed', labelKey: 'orders.filter.confirmed' },
  { value: 'shipped', labelKey: 'orders.filter.shipped' },
  { value: 'paid', labelKey: 'orders.filter.paid' },
  { value: 'cancelled', labelKey: 'orders.filter.cancelled' },
];

export default function OrdersSection() {
  const { salesOrders } = useSales();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    let result = salesOrders;
    if (filter !== 'all') {
      result = salesOrders.filter((o) => o.status === filter);
    }
    return [...result].sort((a, b) => b.createdAt - a.createdAt);
  }, [salesOrders, filter]);

  const { visibleItems, hasMore, sentinelRef, visibleCount, totalCount } = useInfiniteList(filtered);

  const handleExport = () => {
    const headers = [
      t('csv.orderNo'),
      t('csv.customer'),
      t('csv.status'),
      t('csv.totalQuantity'),
      t('csv.totalAmount'),
      t('csv.totalCost'),
      t('csv.totalProfit'),
      t('csv.createdAt'),
    ];
    const exportRows = filtered.map((o) => [
      o.orderNo,
      o.customerName ?? t('orders.noCustomer'),
      t(ORDER_STATUS_CONFIG[o.status].labelKey),
      o.totalQuantity,
      o.totalAmount,
      o.totalCost,
      o.totalProfit,
      format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm'),
    ]);
    downloadCSV(`${t('orders.exportName')}_${format(new Date(), 'yyyyMMdd')}.csv`, headers, exportRows);
    toast.success(t('orders.exported', { count: filtered.length }));
  };

  return (
    <div className="space-y-3">
      {/* 筛选 Tab + 导出 */}
      <div className="flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
          {TABS.map((tab) => {
            const count = tab.value === 'all'
              ? salesOrders.length
              : salesOrders.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
                  filter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-muted-foreground',
                )}
              >
                {t(tab.labelKey)}
                <span className="ml-1 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={handleExport}>
          <Download className="size-4" />
          {t('common.export')}
        </Button>
      </div>

      {/* 订单列表 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('orders.empty')}</p>
        </div>
      ) : (
        <>
        {visibleItems.map((order) => {
          const date = new Date(order.createdAt);
          return (
            <Card
              key={order.id}
              className="cursor-pointer transition-colors active:bg-accent/50"
              onClick={() => navigate(`/sales-orders/${order.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {order.orderNo}
                      </span>
                      <Badge
                        variant={ORDER_STATUS_CONFIG[order.status].badgeVariant}
                        className={cn(ORDER_STATUS_CONFIG[order.status].className)}
                      >
                        {t(ORDER_STATUS_CONFIG[order.status].labelKey)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.customerName ?? t('orders.noCustomer')}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t('orders.monthDayCount', { month: date.getMonth() + 1, day: date.getDate(), count: order.totalQuantity })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-lg font-bold tabular-nums">
                      ¥{order.totalAmount.toLocaleString('zh-CN')}
                    </span>
                    <span className="text-xs text-green-600">
                      {t('orders.profit')} ¥{order.totalProfit.toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 self-center text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
        <ListSentinel sentinelRef={sentinelRef} hasMore={hasMore} visibleCount={visibleCount} totalCount={totalCount} />
        </>
      )}
    </div>
  );
}
