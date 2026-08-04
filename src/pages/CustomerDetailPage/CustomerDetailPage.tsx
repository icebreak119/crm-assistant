import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Phone,
  Edit,
  Trash2,
  Bell,
  MapPin,
  Building2,
  Package,
  Tag,
  FileText,
  StickyNote,
  ShoppingBag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';
import { useCrm } from '@/hooks/useCrm';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import { format } from 'date-fns';
import { ORDER_STATUS_CONFIG, isEffective } from '@/lib/order-status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import ReminderDialog from '@/components/ReminderDialog';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, starWhileTap } from '@/lib/motion';
import { getAvatarGradient } from '@/lib/group-colors';

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, getGroupName, toggleStar, deleteCustomer } = useCrm();
  const { getOrdersByCustomerId } = useSales();
  const { t } = useI18n();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const customer = id ? getCustomerById(id) : undefined;

  if (!customer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">{t('detail.notFound')}</p>
        <Button onClick={() => navigate('/')}>{t('detail.back')}</Button>
      </div>
    );
  }

  const customerOrders = getOrdersByCustomerId(customer.id);
  const confirmedOrders = customerOrders.filter((o) => isEffective(o.status));
  const totalSpent = confirmedOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalProfit = confirmedOrders.reduce((s, o) => s + o.totalProfit, 0);

  const handleDelete = () => {
    deleteCustomer(customer.id);
    setDeleteOpen(false);
    toast.success(t('detail.deleted'));
    navigate('/');
  };

  const handleCall = () => {
    const link = document.createElement('a');
    link.href = `tel:${customer.phone}`;
    link.click();
  };

  return (
    <div className="min-h-screen pb-detail-safe">
      {/* 顶部操作栏 */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/" />
        <h1 className="flex-1 truncate text-lg font-semibold">{t('detail.title')}</h1>
        <motion.div whileTap={starWhileTap} className="inline-flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleStar(customer.id)}
          >
            <Star
              className={cn(
                'size-5',
                customer.isStarred
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground',
              )}
            />
          </Button>
        </motion.div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 p-4">
        {/* 头部信息 - Hero 渐变背景 */}
        <div className="-mx-4 -mt-4 rounded-b-3xl bg-gradient-to-b from-primary/10 to-transparent px-4 pb-4 pt-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarFallback
              className={cn('text-xl font-medium', getAvatarGradient(customer.gender))}
            >
              {customer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{customer.name}</h2>
              {customer.isStarred && (
                <Star className="size-5 fill-amber-400 text-amber-400" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.gender === 'female' ? t('common.female') : t('common.male')} ·{' '}
              {getGroupName(customer.groupId)}
            </p>
          </div>
        </div>
        </div>

        {/* 拨打电话 */}
        <Button onClick={handleCall} className="w-full bg-gradient-to-r from-primary to-primary/90 shadow-md shadow-primary/20" size="lg">
          <Phone className="size-4" />
          {t('detail.call')} {customer.phone}
        </Button>

        {/* 基础信息 */}
        <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('detail.basic')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={Building2}
              label={t('detail.company')}
              value={customer.company}
            />
            <InfoRow
              icon={MapPin}
              label={t('detail.companyAddress')}
              value={customer.companyAddress}
            />
            <InfoRow
              icon={Package}
              label={t('detail.intendedProduct')}
              value={customer.intendedProduct}
            />
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">{t('detail.tags')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* 购买记录 */}
        <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('detail.purchaseHistory')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 汇总统计 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-xl font-bold tabular-nums text-primary">{confirmedOrders.length}</p>
                <p className="text-xs text-muted-foreground">{t('detail.orders')}</p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                <p className="text-xl font-bold tabular-nums text-emerald-600">¥{totalSpent}</p>
                <p className="text-xs text-muted-foreground">{t('detail.totalSpent')}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3 text-center">
                <p className="text-xl font-bold tabular-nums text-amber-600">¥{totalProfit}</p>
                <p className="text-xs text-muted-foreground">{t('detail.totalProfit')}</p>
              </div>
            </div>

            {/* 订单列表 */}
            {customerOrders.length > 0 ? (
              <div className="space-y-2">
                {customerOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/sales-orders/${order.id}`)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors active:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{order.orderNo}</span>
                        <Badge
                          variant={ORDER_STATUS_CONFIG[order.status].badgeVariant}
                          className={cn('text-xs', ORDER_STATUS_CONFIG[order.status].className)}
                        >
                          {t(ORDER_STATUS_CONFIG[order.status].labelKey)}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {order.items.map((item) => `${item.productName}×${item.quantity}`).join('、')}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), 'MM-dd HH:mm')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">¥{order.totalAmount}</p>
                      {isEffective(order.status) && (
                        <p className="text-xs text-muted-foreground">{t('detail.profit')} ¥{order.totalProfit}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ShoppingBag className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">{t('detail.noOrders')}</p>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* 说明与备注 */}
        {(customer.description || customer.remark) && (
          <motion.div variants={staggerItem}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('detail.notes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.description && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('detail.description')}</p>
                    <p className="text-sm">{customer.description}</p>
                  </div>
                </div>
              )}
              {customer.remark && (
                <div className="flex items-start gap-3">
                  <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('detail.remark')}</p>
                    <p className="text-sm">{customer.remark}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}
      </motion.div>

      {/* 底部操作栏 - 在底部导航上方 */}
      <div className="fixed bottom-nav-safe left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-md gap-3 p-3">
          <Button
            className="flex-1"
            size="lg"
            onClick={() => setReminderOpen(true)}
          >
            <Bell className="size-4" />
            {t('detail.remind')}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={() => navigate(`/customers/${customer.id}/edit`)}
          >
            <Edit className="size-4" />
            {t('detail.edit')}
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            size="lg"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {t('detail.delete')}
          </Button>
        </div>
      </div>

      {/* 删除确认 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('detail.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('detail.deleteWarning', { name: customer.name })}
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

      {/* 设提醒弹窗 */}
      <ReminderDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        customer={customer}
      />
    </div>
  );
}
