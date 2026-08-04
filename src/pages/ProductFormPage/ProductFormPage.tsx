import { useState, useRef, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, X, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useBack } from '@/hooks/useBack';
import BackButton from '@/components/BackButton';
import { useSales } from '@/hooks/useSales';
import { useI18n } from '@/hooks/useI18n';
import { compressImage } from '@/lib/image';
import { saveImage, deleteImage } from '@/lib/imageDB';
import { useImage } from '@/hooks/useImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

export default function ProductFormPage() {
  const { id } = useParams();
  const goBack = useBack(id ? `/products/${id}` : '/products');
  const { products, productGroups, addProduct, updateProduct, addProductGroup } = useSales();
  const { t } = useI18n();
  const editingProduct = id ? products.find((p) => p.id === id) : undefined;

  const [name, setName] = useState(editingProduct?.name ?? '');
  const [code, setCode] = useState(editingProduct?.code ?? '');
  const [groupId, setGroupId] = useState(editingProduct?.groupId ?? 'pgroup_default');
  const [model, setModel] = useState(editingProduct?.model ?? '');
  const [spec, setSpec] = useState(editingProduct?.spec ?? '');
  const [manufacturer, setManufacturer] = useState(editingProduct?.manufacturer ?? '');
  const [unitPrice, setUnitPrice] = useState(editingProduct ? String(editingProduct.unitPrice) : '');
  const [costPrice, setCostPrice] = useState(
    editingProduct?.costPrice ? String(editingProduct.costPrice) : '',
  );
  const [unit, setUnit] = useState(editingProduct?.unit ?? '');
  const [expiryDate, setExpiryDate] = useState(editingProduct?.expiryDate ?? '');
  const [remark, setRemark] = useState(editingProduct?.remark ?? '');
  const [image, setImage] = useState<string | undefined>(editingProduct?.image);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const imagePreview = useImage(image);
  const [newGroupName, setNewGroupName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch {
      toast.error(t('productForm.imageError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error(t('productGroups.nameRequired'));
      return;
    }
    const newGroup = addProductGroup(newGroupName.trim());
    setGroupId(newGroup.id);
    setNewGroupName('');
    setNewGroupOpen(false);
    toast.success(t('productForm.groupCreated'));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error(t('productForm.nameRequired')); return; }
    if (!code.trim()) { toast.error(t('productForm.codeRequired')); return; }
    if (!unitPrice || Number(unitPrice) <= 0) { toast.error(t('productForm.priceInvalid')); return; }
    if (!unit.trim()) { toast.error(t('productForm.unitRequired')); return; }

    setSaving(true);

    let imageRef = image;

    // 新图（base64）→ 存入 IndexedDB
    if (image && image.startsWith('data:')) {
      const key = `idb:img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      try {
        await saveImage(key, image);
        imageRef = key;
      } catch {
        toast.error(t('productForm.imageSaveError'));
        setSaving(false);
        return;
      }
    }

    // 旧图被替换或删除时清理 IndexedDB
    const oldImage = editingProduct?.image;
    if (oldImage?.startsWith('idb:') && oldImage !== imageRef) {
      deleteImage(oldImage).catch(() => {});
    }

    const data = {
      name: name.trim(),
      code: code.trim(),
      groupId,
      model: model.trim() || undefined,
      spec: spec.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
      unitPrice: Number(unitPrice),
      costPrice: costPrice ? Number(costPrice) : undefined,
      unit: unit.trim(),
      expiryDate: expiryDate || undefined,
      remark: remark.trim() || undefined,
      image: imageRef,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      toast.success(t('productForm.updated'));
    } else {
      addProduct(data);
      toast.success(t('productForm.added'));
    }
    setSaving(false);
    goBack();
  };

  return (
    <div className="min-h-screen pb-4">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo={id ? `/products/${id}` : '/products'} />
        <h1 className="text-lg font-bold">{editingProduct ? t('productForm.editTitle') : t('productForm.addTitle')}</h1>
      </div>

      <div className="space-y-4 p-4">
        {/* 基础信息 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('productForm.basic')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>{t('productForm.name')} <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('productForm.namePlaceholder')} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>{t('productForm.code')} <span className="text-destructive">*</span></Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('productForm.codePlaceholder')} className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>{t('productForm.group')}</Label>
              <div className="flex gap-2">
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger className="h-10 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setNewGroupOpen(true)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('productForm.model')}</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder={t('productForm.modelPlaceholder')} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('productForm.spec')}</Label>
                <Input value={spec} onChange={(e) => setSpec(e.target.value)} placeholder={t('productForm.specPlaceholder')} className="h-10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('productForm.manufacturer')}</Label>
              <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder={t('productForm.manufacturerPlaceholder')} className="h-10" />
            </div>
          </CardContent>
        </Card>

        {/* 价格与单位 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('productForm.priceInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('productForm.unitPrice')} <span className="text-destructive">*</span></Label>
                <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('productForm.costPrice')}</Label>
                <Input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0" className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('productForm.unit')} <span className="text-destructive">*</span></Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={t('productForm.unitPlaceholder')} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>{t('productForm.expiryDate')}</Label>
                <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 产品图片 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('productForm.image')}</CardTitle>
          </CardHeader>
          <CardContent>
            {image ? (
              <div className="relative">
                {imagePreview ? (
                  <div
                    className="aspect-square w-full max-w-[200px] rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${imagePreview})` }}
                  />
                ) : (
                  <div className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-lg bg-muted">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                <Button
                  size="icon"
                  variant="secondary"
                  className="!absolute right-2 top-2 z-20 size-7 rounded-full shadow-sm"
                  onClick={() => setImage(undefined)}
                  aria-label={t('productForm.removeImage')}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square w-full max-w-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border"
              >
                {uploading ? (
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Camera className="size-6 text-muted-foreground" />
                    <span className="mt-1 text-xs text-muted-foreground">{t('productForm.camera')}</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </CardContent>
        </Card>

        {/* 备注 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('productDetail.remark')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder={t('productForm.remarkPlaceholder')} className="h-10" />
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <Button className="w-full" onClick={handleSave} size="lg" disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : t('productForm.save')}
        </Button>
      </div>

      {/* 新建分组 Dialog */}
      <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('productForm.newGroup')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>{t('productForm.groupName')}</Label>
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder={t('productForm.groupNamePlaceholder')}
              className="h-10"
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleCreateGroup}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
