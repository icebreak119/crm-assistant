import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useImage } from '@/hooks/useImage';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProductById, getProductGroupName, deleteProduct, getInventoryByProductId } = useSales();
  const { t } = useI18n();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const product = id ? getProductById(id) : undefined;
  const resolvedImage = useImage(product?.image);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t('productDetail.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/sales')}>{t('productDetail.back')}</Button>
      </div>
    );
  }

  const inv = getInventoryByProductId(product.id);

  const handleDelete = () => {
    deleteProduct(product.id);
    toast.success(t('productDetail.deleted'));
    navigate('/sales');
  };

  const infoRows = [
    { label: t('productDetail.code'), value: product.code },
    { label: t('productDetail.group'), value: getProductGroupName(product.groupId) },
    { label: t('productDetail.model'), value: product.model || '—' },
    { label: t('productDetail.spec'), value: product.spec || '—' },
    { label: t('productDetail.manufacturer'), value: product.manufacturer || '—' },
    { label: t('productDetail.expiryDate'), value: product.expiryDate || '—' },
  ];

  return (
    <div className="min-h-screen pb-detail-safe">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/products" />
        <h1 className="flex-1 truncate text-lg font-bold">{product.name}</h1>
        <button onClick={() => navigate(`/products/${product.id}/edit`)}>
          <Pencil className="size-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* 产品图片 */}
        {resolvedImage ? (
          <div
            className="aspect-[4/3] w-full rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${resolvedImage})` }}
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted">
            <Package className="size-12 text-muted-foreground/50" />
          </div>
        )}

        {/* 价格信息 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('productDetail.priceInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t('productDetail.unitPrice')}</p>
              <p className="text-2xl font-bold text-primary">
                ¥{product.unitPrice.toLocaleString('zh-CN')}
                <span className="text-sm text-muted-foreground"> / {product.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('productDetail.costPrice')}</p>
              <p className="text-2xl font-bold">
                {product.costPrice ? `¥${product.costPrice.toLocaleString('zh-CN')}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('productDetail.profit')}</p>
              <p className="text-lg font-bold text-green-600">
                {product.costPrice
                  ? `¥${(product.unitPrice - product.costPrice).toLocaleString('zh-CN')}`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('productDetail.inventory')}</p>
              <p className="text-lg font-bold">
                {inv ? `${inv.quantity} ${product.unit}` : t('productDetail.notStocked')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 基础信息 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('productDetail.basic')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 备注 */}
        {product.remark && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('productDetail.remark')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{product.remark}</p>
            </CardContent>
          </Card>
        )}

        {/* 删除按钮 */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          {t('productDetail.deleteProduct')}
        </Button>
      </div>

      {/* 删除确认 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('productDetail.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('productDetail.deleteWarning')}
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
