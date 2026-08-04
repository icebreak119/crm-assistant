import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Plus, Settings, PackageSearch, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import { downloadCSV } from '@/lib/csv';
import { Card, CardContent } from '@/components/ui/card';
import ListSentinel from '@/components/ListSentinel';
import { useInfiniteList } from '@/hooks/useInfiniteList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useImage } from '@/hooks/useImage';
import { motion, AnimatePresence } from 'framer-motion';

function ProductThumb({ src }: { src: string | undefined }) {
  const resolved = useImage(src);
  return resolved ? (
    <div
      className="size-14 shrink-0 rounded-lg bg-cover bg-center"
      style={{ backgroundImage: `url(${resolved})` }}
    />
  ) : (
    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Package className="size-6 text-muted-foreground" />
    </div>
  );
}

export default function ProductsSection() {
  const { products, productGroups, getProductGroupName, getInventoryByProductId } = useSales();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [keyword, setKeyword] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = products;
    if (groupFilter !== 'all') {
      result = result.filter((p) => p.groupId === groupFilter);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.code.toLowerCase().includes(kw) ||
          (p.model ?? '').toLowerCase().includes(kw),
      );
    }
    return result;
  }, [products, keyword, groupFilter]);

  const { visibleItems, hasMore, sentinelRef, visibleCount, totalCount } = useInfiniteList(filtered);

  const handleExport = () => {
    const headers = [
      t('csv.productName'),
      t('csv.code'),
      t('csv.group'),
      t('csv.model'),
      t('csv.spec'),
      t('csv.manufacturer'),
      t('csv.unitPrice'),
      t('csv.costPrice'),
      t('csv.unit'),
      t('csv.expiryDate'),
      t('csv.remark'),
    ];
    const exportRows = filtered.map((p) => [
      p.name,
      p.code,
      getProductGroupName(p.groupId),
      p.model ?? '',
      p.spec ?? '',
      p.manufacturer ?? '',
      p.unitPrice,
      p.costPrice ?? '',
      p.unit,
      p.expiryDate ?? '',
      p.remark ?? '',
    ]);
    downloadCSV(`${t('products.exportName')}_${format(new Date(), 'yyyyMMdd')}.csv`, headers, exportRows);
    toast.success(t('products.exported', { count: filtered.length }));
  };

  return (
    <div className="space-y-3">
      {/* 搜索 + 操作 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('products.search')}
            className="bg-background pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleExport}
          aria-label={t('common.export')}
        >
          <Download className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => navigate('/product-groups')}
          aria-label={t('productGroups.title')}
        >
          <Settings className="size-4" />
        </Button>
      </div>

      {/* 分组筛选 */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button
          onClick={() => setGroupFilter('all')}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
            groupFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-muted-foreground',
          )}
        >
          {t('common.all')}
        </button>
        {productGroups.map((g) => (
          <button
            key={g.id}
            onClick={() => setGroupFilter(g.id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors',
              groupFilter === g.id
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background text-muted-foreground',
            )}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* 新增按钮 */}
      <Button
        className="w-full"
        onClick={() => navigate('/products/new')}
      >
        <Plus className="size-4" />
        {t('products.add')}
      </Button>

      {/* 产品列表 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={groupFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="space-y-3"
        >
        {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PackageSearch className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('products.empty')}</p>
        </div>
      ) : (
        <>
        {visibleItems.map((product, i) => {
          const inv = getInventoryByProductId(product.id);
          return (
            <>
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3), ease: 'easeOut' }}
              >
              <Card
                className="cursor-pointer transition-colors active:bg-accent/50"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  {/* 图片 / 占位 */}
                  <ProductThumb src={product.image} />
                  {/* 信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{product.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {product.code} · {getProductGroupName(product.groupId)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        ¥{product.unitPrice}
                      </span>
                      <span className="text-xs text-muted-foreground">/{product.unit}</span>
                      {inv && (
                        <Badge
                          variant={inv.quantity < 10 ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {t('products.stock')} {inv.quantity}
                        </Badge>
                      )}
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
    </div>
  );
}
