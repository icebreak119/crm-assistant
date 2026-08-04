import { useState, useMemo } from 'react';
import { Plus, Boxes, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export default function InventorySection() {
  const { inventory, products, addInventory, getInventoryByProductId } = useSales();
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remark, setRemark] = useState('');
  const [listRef] = useAutoAnimate({ duration: 200 });

  const sorted = useMemo(
    () =>
      [...inventory].sort((a, b) => {
        const aLow = a.quantity < 10 ? 0 : 1;
        const bLow = b.quantity < 10 ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return a.quantity - b.quantity;
      }),
    [inventory],
  );

  const availableProducts = useMemo(
    () => products.filter((p) => !getInventoryByProductId(p.id)),
    [products, getInventoryByProductId],
  );

  const handleSave = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast.error(t('inventory.productRequired'));
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      toast.error(t('inventory.quantityInvalid'));
      return;
    }
    addInventory({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      quantity: qty,
      unit: product.unit,
      remark: remark.trim() || undefined,
    });
    toast.success(t('inventory.saved'));
    setDialogOpen(false);
    setSelectedProductId('');
    setQuantity('');
    setRemark('');
  };

  return (
    <div className="space-y-3">
      {/* 录入按钮 */}
      <Button className="w-full" onClick={() => setDialogOpen(true)}>
        <Plus className="size-4" />
        {t('inventory.add')}
      </Button>

      {/* 库存列表 */}
      <div ref={listRef} className="space-y-3">
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Boxes className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t('inventory.empty')}</p>
        </div>
      ) : (
        sorted.map((inv) => (
          <Card key={inv.id} className={cn(inv.quantity < 10 && 'border-destructive/30')}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{inv.productName}</span>
                  {inv.quantity < 10 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="mr-0.5 size-3" />
                      {t('inventory.lowStock')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('csv.code')} {inv.productCode}
                  {inv.remark && ` · ${inv.remark}`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold tabular-nums">{inv.quantity}</p>
                <p className="text-xs text-muted-foreground">{inv.unit}</p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      </div>

      {/* 录入库存 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.dialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('inventory.selectProduct')}</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t('inventory.selectProduct')} />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      {t('inventory.allHaveInventory')}
                    </SelectItem>
                  ) : (
                    availableProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}（{p.code}）
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {availableProducts.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('inventory.hint')}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t('inventory.quantity')}</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t('inventory.quantityPlaceholder')}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('csv.remark')}</Label>
              <Input
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={t('common.optional')}
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
