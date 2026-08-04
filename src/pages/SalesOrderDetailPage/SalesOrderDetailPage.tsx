import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Trash2, User, Truck, CircleDollarSign, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import type { OrderStatus } from '@/data/sales';
import { ORDER_STATUS_CONFIG, isInventoryDeducted } from '@/lib/order-status';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function SalesOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getSalesOrderById, confirmSalesOrder, deleteSalesOrder, updateOrderStatus } = useSales();
  const { t } = useI18n();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const order = id ? getSalesOrderById(id) : undefined;

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t('orderDetail.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/sales')}>{t('orderDetail.back')}</Button>
      </div>
    );
  }

  const date = new Date(order.createdAt);

  const handleConfirm = () => {
    confirmSalesOrder(order.id);
    toast.success(t('orderDetail.confirmed'));
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    const toastKeyMap: Record<OrderStatus, string> = {
      draft: 'orderDetail.confirmed',
      confirmed: 'orderDetail.confirmed',
      shipped: 'orderDetail.shipped',
      paid: 'orderDetail.paid',
      cancelled: 'orderDetail.cancelDone',
    };
    toast.success(t(toastKeyMap[newStatus]));
  };

  const handleCancel = () => {
    updateOrderStatus(order.id, 'cancelled');
    toast.success(t('orderDetail.cancelDone'));
    setCancelOpen(false);
  };

  const handleDelete = () => {
    deleteSalesOrder(order.id);
    toast.success(
      isInventoryDeducted(order.status)
        ? t('orderDetail.deleted')
        : t('orderDetail.deletedNoInventory'),
    );
    navigate('/sales');
  };

  return (
    <div className="min-h-screen pb-detail-safe">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/sales" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold">{order.orderNo}</h1>
        </div>
        <Badge
          variant={ORDER_STATUS_CONFIG[order.status].badgeVariant}
          className={ORDER_STATUS_CONFIG[order.status].className}
        >
          {t(ORDER_STATUS_CONFIG[order.status].labelKey)}
        </Badge>
      </div>

      <div className="space-y-4 p-4">
        {/* 客户信息 */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{t('orderDetail.customer')}</p>
              <p className="font-medium">
                {order.customerName ?? t('orderDetail.noCustomer')}
              </p>
            </div>
            {order.customerId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/customers/${order.customerId}`)}
              >
                {t('orderDetail.view')}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 产品明细 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('orderDetail.items')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.productName}</span>
                  <span className="font-bold">¥{item.subtotal.toLocaleString('zh-CN')}</span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{t('orderDetail.unitPrice')} ¥{item.unitPrice}</span>
                  <span>× {item.quantity}</span>
                  {item.costPrice && (
                    <span className="text-green-600">
                      {t('orderDetail.profit')} ¥{(item.subtotal - item.costPrice * item.quantity).toLocaleString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 金额汇总 */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('orderDetail.summary')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t('orderDetail.totalQuantity')}</p>
              <p className="text-xl font-bold tabular-nums">{order.totalQuantity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('orderDetail.totalAmount')}</p>
              <p className="text-xl font-bold tabular-nums text-primary">
                ¥{order.totalAmount.toLocaleString('zh-CN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('orderDetail.totalCost')}</p>
              <p className="text-xl font-bold tabular-nums">
                ¥{order.totalCost.toLocaleString('zh-CN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('orderDetail.totalProfit')}</p>
              <p className="text-xl font-bold tabular-nums text-green-600">
                ¥{order.totalProfit.toLocaleString('zh-CN')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 备注 */}
        {order.remark && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{t('orderDetail.remark')}</p>
              <p className="mt-1 text-sm">{order.remark}</p>
            </CardContent>
          </Card>
        )}

        {/* 创建时间 */}
        <p className="text-center text-xs text-muted-foreground">
          {t('orderDetail.createdDate', { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() })}
        </p>

        {/* 操作按钮 */}
        <div className="space-y-2">
          {order.status === 'draft' && (
            <Button className="w-full" onClick={handleConfirm} size="lg">
              <Check className="size-4" />
              {t('orderDetail.confirm')}
            </Button>
          )}
          {order.status === 'confirmed' && (
            <Button className="w-full" onClick={() => handleStatusChange('shipped')} size="lg">
              <Truck className="size-4" />
              {t('orderDetail.ship')}
            </Button>
          )}
          {order.status === 'shipped' && (
            <Button className="w-full" onClick={() => handleStatusChange('paid')} size="lg">
              <CircleDollarSign className="size-4" />
              {t('orderDetail.pay')}
            </Button>
          )}
          {(order.status === 'confirmed' || order.status === 'shipped') && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => setCancelOpen(true)}
            >
              <X className="size-4" />
              {t('orderDetail.cancel')}
            </Button>
          )}
          {order.status === 'cancelled' && (
            <p className="text-center text-sm text-muted-foreground">{t('orderDetail.cancelled')}</p>
          )}
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {t('orderDetail.delete')}
          </Button>
        </div>
      </div>

      {/* 删除确认 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('orderDetail.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('orderDetail.deleteWarning')}
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

      {/* 取消确认 */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('orderDetail.cancelConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('orderDetail.cancelWarning')}
              {isInventoryDeducted(order.status) ? t('orderDetail.cancelInventory') : ''}。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('orderDetail.thinkAgain')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              {t('orderDetail.cancelAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
