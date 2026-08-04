import { useState, useMemo } from 'react';
import { Search, Receipt, Download } from 'lucide-react';
import { toast } from 'sonner';
import { startOfWeek, startOfMonth, subMonths, format } from 'date-fns';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import { isEffective } from '@/lib/order-status';
import { downloadCSV } from '@/lib/csv';
import { Card, CardContent } from '@/components/ui/card';
import ListSentinel from '@/components/ListSentinel';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DetailRow {
  orderId: string;
  orderNo: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  costPrice: number;
  profit: number;
  date: number;
}

type TimeRange = 'all' | 'week' | 'month' | 'lastMonth';

const TIME_TABS: { value: TimeRange; labelKey: string }[] = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'week', labelKey: 'details.time.week' },
  { value: 'month', labelKey: 'details.time.month' },
  { value: 'lastMonth', labelKey: 'details.time.lastMonth' },
];

export default function DetailsSection() {
  const { salesOrders } = useSales();
  const { t } = useI18n();
  const [keyword, setKeyword] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const rows = useMemo<DetailRow[]>(() => {
    return salesOrders
      .filter((o) => isEffective(o.status))
      .flatMap((o) =>
        o.items.map((item) => ({
          orderId: o.id,
          orderNo: o.orderNo,
          customerName: o.customerName ?? t('details.noCustomer'),
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          costPrice: item.costPrice ?? 0,
          profit: item.subtotal - (item.costPrice ?? 0) * item.quantity,
          date: o.createdAt,
        })),
      )
      .sort((a, b) => b.date - a.date);
  }, [salesOrders, t]);

  const filtered = useMemo(() => {
    let result = rows;
    // 时间筛选
    if (timeRange !== 'all') {
      const now = new Date();
      let start: number;
      let end: number = now.getTime();
      if (timeRange === 'week') {
        start = startOfWeek(now, { weekStartsOn: 1 }).getTime();
      } else if (timeRange === 'month') {
        start = startOfMonth(now).getTime();
      } else {
        start = startOfMonth(subMonths(now, 1)).getTime();
        end = startOfMonth(now).getTime();
      }
      result = result.filter((r) => r.date >= start && r.date < end);
    }
    // 关键词筛选
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.productName.toLowerCase().includes(kw) ||
          r.customerName.toLowerCase().includes(kw) ||
          r.orderNo.toLowerCase().includes(kw),
      );
    }
    return result;
  }, [rows, keyword, timeRange]);

  const { visibleItems, hasMore, sentinelRef, visibleCount, totalCount } = useInfiniteList(filtered);

  const handleExport = () => {
    const headers = [
      t('csv.date'),
      t('csv.orderNo'),
      t('csv.customer'),
      t('csv.product'),
      t('csv.quantity'),
      t('csv.unitPrice'),
      t('csv.subtotal'),
      t('csv.cost'),
      t('csv.profit'),
    ];
    const exportRows = filtered.map((r) => [
      format(new Date(r.date), 'yyyy-MM-dd'),
      r.orderNo,
      r.customerName,
      r.productName,
      r.quantity,
      r.unitPrice,
      r.subtotal,
      r.costPrice,
      r.profit,
    ]);
    downloadCSV(`${t('details.exportName')}_${format(new Date(), 'yyyyMMdd')}.csv`, headers, exportRows);
    toast.success(t('details.exported', { count: filtered.length }));
  };

  const summary = useMemo(() => {
    const totalQty = filtered.reduce((s, r) => s + r.quantity, 0);
    const totalAmount = filtered.reduce((s, r) => s + r.subtotal, 0);
    const totalProfit = filtered.reduce((s, r) => s + r.profit, 0);
    return { totalQty, totalAmount, totalProfit };
  }, [filtered]);

  return (
    <div className="space-y-3">
      {/* 搜索 + 导出 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('details.search')}
            className="bg-background pl-9"
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0" onClick={handleExport} aria-label={t('common.export')}>
          <Download className="size-4" />
        </Button>
      </div>

      {/* 时间筛选 */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {TIME_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTimeRange(tab.value)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
              timeRange === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-muted-foreground',
            )}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* 明细列表 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('details.empty')}</p>
        </div>
      ) : (
        <>
        {visibleItems.map((row, idx) => {
          const date = new Date(row.date);
          return (
            <Card key={`${row.orderId}-${idx}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('common.monthDay', { month: date.getMonth() + 1, day: date.getDate() })}</span>
                  <span>{row.orderNo}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-medium">{row.productName}</span>
                  <span className="text-sm text-muted-foreground">{row.customerName}</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {t('csv.quantity')} <span className="font-medium text-foreground">{row.quantity}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {t('csv.unitPrice')} <span className="font-medium text-foreground">¥{row.unitPrice}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {t('csv.subtotal')} <span className="font-medium text-foreground">¥{row.subtotal.toLocaleString('zh-CN')}</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    {t('csv.cost')} ¥{row.costPrice.toLocaleString('zh-CN')}
                  </span>
                  <span className="text-green-600">
                    {t('csv.profit')} ¥{row.profit.toLocaleString('zh-CN')}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <ListSentinel sentinelRef={sentinelRef} hasMore={hasMore} visibleCount={visibleCount} totalCount={totalCount} />
        </>
      )}

      {/* 底部汇总 */}
      {filtered.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('details.summary.count', { count: filtered.length })}</p>
              <p className="text-sm font-medium">
                {t('details.summary.quantity')} {summary.totalQty} · {t('details.summary.amount')} ¥{summary.totalAmount.toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t('details.summary.profit')}</p>
              <p className="text-lg font-bold text-green-600">
                ¥{summary.totalProfit.toLocaleString('zh-CN')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
