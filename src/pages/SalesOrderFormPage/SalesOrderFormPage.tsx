import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';
import { useCrm } from '@/hooks/useCrm';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import type { IProduct, ISalesOrderItem } from '@/data/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

export default function SalesOrderFormPage() {
  const navigate = useNavigate();
  const { customers } = useCrm();
  const { products, addSalesOrder } = useSales();
  const { t } = useI18n();

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ISalesOrderItem[]>([]);
  const [remark, setRemark] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          !search.trim() ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.code.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const totals = useMemo(() => {
    const totalAmount = items.reduce((s, i) => s + i.subtotal, 0);
    const totalCost = items.reduce((s, i) => s + (i.costPrice ?? 0) * i.quantity, 0);
    const totalProfit = totalAmount - totalCost;
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    return { totalAmount, totalCost, totalProfit, totalQuantity };
  }, [items]);

  const handleAddProduct = (product: IProduct) => {
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        unitPrice: product.unitPrice,
        costPrice: product.costPrice,
        quantity: 1,
        subtotal: product.unitPrice,
      },
    ]);
    setPickerOpen(false);
    setSearch('');
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity, subtotal: item.unitPrice * quantity }
          : item,
      ),
    );
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (items.length === 0) {
      toast.error(t('orderForm.noItems'));
      return;
    }
    const customer = customers.find((c) => c.id === customerId);
    addSalesOrder({
      customerId: customerId || undefined,
      customerName: customer?.name,
      items,
      totalAmount: totals.totalAmount,
      totalCost: totals.totalCost,
      totalProfit: totals.totalProfit,
      totalQuantity: totals.totalQuantity,
      status: 'draft',
      remark: remark.trim() || undefined,
    });
    toast.success(t('orderForm.saved'));
    navigate('/sales');
  };

  return (
    <div className="min-h-screen pb-4">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/sales" />
        <h1 className="text-lg font-bold">{t('orderForm.title')}</h1>
      </div>

      <div className="space-y-4 p-4">
        {/* 客户选择 */}
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="space-y-1.5">
              <Label>{t('orderForm.customer')}</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t('orderForm.selectCustomer')} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} · {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 产品明细 */}
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <Label>{t('orderForm.items')}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
              >
                <Plus className="size-4" />
                {t('orderForm.addProduct')}
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('orderForm.empty')}
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium">{item.productName}</span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="shrink-0 text-muted-foreground"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        ¥{item.unitPrice}/{item.costPrice ? `${t('csv.cost')}¥${item.costPrice}` : ''}
                      </span>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-muted-foreground">{t('orderForm.quantity')}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(index, Math.max(1, Number(e.target.value) || 1))
                          }
                          className="h-8 w-16"
                        />
                      </div>
                      <span className="ml-auto font-bold">
                        ¥{item.subtotal.toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 汇总 */}
        {items.length > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="grid grid-cols-2 gap-3 p-4">
              <div>
                <p className="text-xs text-muted-foreground">{t('orderForm.totalQuantity')}</p>
                <p className="text-lg font-bold tabular-nums">{totals.totalQuantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('orderForm.totalAmount')}</p>
                <p className="text-lg font-bold tabular-nums text-primary">
                  ¥{totals.totalAmount.toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('orderForm.totalCost')}</p>
                <p className="text-lg font-bold tabular-nums">
                  ¥{totals.totalCost.toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('orderForm.totalProfit')}</p>
                <p className="text-lg font-bold tabular-nums text-green-600">
                  ¥{totals.totalProfit.toLocaleString('zh-CN')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 备注 */}
        <div className="space-y-1.5">
          <Label>{t('orderForm.remark')}</Label>
          <Input
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder={t('orderForm.remarkPlaceholder')}
            className="h-10"
          />
        </div>

        {/* 保存按钮 */}
        <Button className="w-full" onClick={handleSave} size="lg">
          {t('orderForm.create')}
        </Button>
      </div>

      {/* 产品选择 Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('orderForm.selectProduct')}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('orderForm.searchProduct')}
              className="bg-background pl-9"
            />
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('orderForm.noProducts')}</p>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAddProduct(p)}
                  className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left transition-colors active:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{p.code}</span>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-primary">
                    ¥{p.unitPrice}
                  </span>
                </button>
              ))
            )}
          </div>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">{t('common.cancel')}</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
