import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { TrendingUp, DollarSign, Coins, Wallet, BarChart3, Package, Boxes } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/lib/chart-colors';
import { isEffective } from '@/lib/order-status';

function formatCurrency(n: number): string {
  return `¥${n.toLocaleString('zh-CN')}`;
}

export default function SummarySection() {
  const { salesOrders, products, inventory } = useSales();
  const { t } = useI18n();
  const navigate = useNavigate();

  const confirmedOrders = useMemo(
    () => salesOrders.filter((o) => isEffective(o.status)),
    [salesOrders],
  );

  const kpis = useMemo(() => {
    const totalQuantity = confirmedOrders.reduce((s, o) => s + o.totalQuantity, 0);
    const totalAmount = confirmedOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalCost = confirmedOrders.reduce((s, o) => s + o.totalCost, 0);
    const totalProfit = confirmedOrders.reduce((s, o) => s + o.totalProfit, 0);
    return { totalQuantity, totalAmount, totalCost, totalProfit };
  }, [confirmedOrders]);

  const trendData = useMemo(() => {
    const days: { date: string; profit: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      const profit = confirmedOrders
        .filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
        .reduce((s, o) => s + o.totalProfit, 0);
      days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, profit });
    }
    return days;
  }, [confirmedOrders]);

  const top5 = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number }>();
    confirmedOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = map.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          map.set(item.productId, { name: item.productName, quantity: item.quantity });
        }
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [confirmedOrders]);

  const lineOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map((d) => d.date),
      boundaryGap: false,
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        data: trendData.map((d) => d.profit),
        smooth: true,
        itemStyle: { color: CHART_COLORS[0] },
        areaStyle: { opacity: 0.1 },
      },
    ],
  };

  const barOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: top5.map((p) => p.name),
      boundaryGap: true,
    },
    series: [
      {
        type: 'bar',
        data: top5.map((p) => p.quantity),
        itemStyle: { color: CHART_COLORS[0] },
      },
    ],
  };

  const kpiCards = [
    { label: t('summary.totalQuantity'), value: String(kpis.totalQuantity), icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: t('summary.totalAmount'), value: formatCurrency(kpis.totalAmount), icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: t('summary.totalCost'), value: formatCurrency(kpis.totalCost), icon: Coins, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: t('summary.totalProfit'), value: formatCurrency(kpis.totalProfit), icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-4">
      {/* KPI 卡片 */}
      <div className="grid grid-cols-2 gap-3">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className={`mb-2 flex size-8 items-center justify-center rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`size-4 ${kpi.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <p className="text-2xl font-bold tabular-nums">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="cursor-pointer transition-colors active:bg-accent/50"
          onClick={() => navigate('/products')}
        >
          <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-4 text-primary" />
            </div>
            <p className="text-sm font-medium">{t('summary.entryProducts')}</p>
            <p className="text-xs text-muted-foreground">{t('summary.productsCount', { n: products.length })}</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-colors active:bg-accent/50"
          onClick={() => navigate('/inventory')}
        >
          <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Boxes className="size-4 text-primary" />
            </div>
            <p className="text-sm font-medium">{t('summary.entryInventory')}</p>
            <p className="text-xs text-muted-foreground">{t('summary.inventoryCount', { n: inventory.length })}</p>
          </CardContent>
        </Card>
      </div>

      {/* 盈利趋势 */}
      <Card className="bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4" />
            {t('summary.profitTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={lineOption} theme="ud" className="h-[220px] w-full" />
        </CardContent>
      </Card>

      {/* 产品销量 TOP5 */}
      <Card className="bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4" />
            {t('summary.top5')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {top5.length > 0 ? (
            <ReactECharts option={barOption} theme="ud" className="h-[220px] w-full" />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">{t('summary.noData')}</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
