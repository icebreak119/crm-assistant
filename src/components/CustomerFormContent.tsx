import { useState, useEffect, useRef, type FormEvent, type ChangeEvent, type KeyboardEvent } from 'react';
import { Star, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import type { ICustomer } from '@/data/crm';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

interface CustomerFormContentProps {
  initialData?: ICustomer;
  onSubmit: (data: Omit<ICustomer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  submitLabel?: string;
}

export default function CustomerFormContent({
  initialData,
  onSubmit,
  submitLabel,
}: CustomerFormContentProps) {
  const { groups, tags, companies, addGroup, addTag, addCompany } = useCrm();
  const { t } = useI18n();

  const defaultGroupId =
    groups.find((g) => g.isDefault)?.id ?? groups[0]?.id ?? '';

  const [name, setName] = useState(initialData?.name ?? '');
  const [gender, setGender] = useState<'male' | 'female'>(
    initialData?.gender ?? 'male',
  );
  const [isStarred, setIsStarred] = useState(initialData?.isStarred ?? false);
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [company, setCompany] = useState(initialData?.company ?? '');
  const [companyAddress, setCompanyAddress] = useState(
    initialData?.companyAddress ?? '',
  );
  const [intendedProduct, setIntendedProduct] = useState(
    initialData?.intendedProduct ?? '',
  );
  const [groupId, setGroupId] = useState(
    initialData?.groupId ?? defaultGroupId,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags ?? [],
  );
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState(
    initialData?.description ?? '',
  );
  const [remark, setRemark] = useState(initialData?.remark ?? '');
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  // 草稿暂存
  const DRAFT_KEY = initialData
    ? `__crm_draft_edit_${initialData.id}`
    : '__crm_draft_new';
  const draftChecked = useRef(false);

  // 挂载时恢复草稿
  useEffect(() => {
    if (draftChecked.current) return;
    draftChecked.current = true;
    try {
      const raw = scopedStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Record<string, unknown>;
        if (typeof draft.name === 'string') setName(draft.name);
        if (draft.gender === 'male' || draft.gender === 'female') setGender(draft.gender);
        if (typeof draft.isStarred === 'boolean') setIsStarred(draft.isStarred);
        if (typeof draft.phone === 'string') setPhone(draft.phone);
        if (typeof draft.company === 'string') setCompany(draft.company);
        if (typeof draft.companyAddress === 'string') setCompanyAddress(draft.companyAddress);
        if (typeof draft.intendedProduct === 'string') setIntendedProduct(draft.intendedProduct);
        if (typeof draft.groupId === 'string') setGroupId(draft.groupId);
        if (Array.isArray(draft.selectedTags)) setSelectedTags(draft.selectedTags as string[]);
        if (typeof draft.description === 'string') setDescription(draft.description);
        if (typeof draft.remark === 'string') setRemark(draft.remark);
        toast.info(t('form.draftRestored'));
      }
    } catch {
      // ignore
    }
  }, []);

  // 自动暂存草稿 (800ms debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!name.trim() && !phone.trim()) {
        scopedStorage.removeItem(DRAFT_KEY);
        return;
      }
      try {
        scopedStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            name, gender, isStarred, phone, company, companyAddress,
            intendedProduct, groupId, selectedTags, description, remark,
          }),
        );
      } catch {
        // ignore
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [name, gender, isStarred, phone, company, companyAddress, intendedProduct, groupId, selectedTags, description, remark, DRAFT_KEY]);

  // 标签操作
  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    if (!tags.includes(trimmed)) {
      addTag(trimmed);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput);
      }
    }
  };

  // 公司操作
  const handleCompanyBlur = () => {
    const trimmed = company.trim();
    if (trimmed && !companies.includes(trimmed)) {
      addCompany(trimmed);
    }
  };

  // 新建分组
  const handleCreateGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      toast.error(t('form.groupNameRequired'));
      return;
    }
    const newGroup = addGroup(trimmed);
    setGroupId(newGroup.id);
    setNewGroupName('');
    setNewGroupOpen(false);
    toast.success(t('form.groupCreated'));
  };

  // 校验
  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) {
      newErrors.name = t('form.nameRequired');
    }
    if (!phone.trim()) {
      newErrors.phone = t('form.phoneRequired');
    } else if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone = t('form.phoneInvalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error(t('form.checkForm'));
      return;
    }
    scopedStorage.removeItem(DRAFT_KEY);
    onSubmit({
      name: name.trim(),
      gender,
      isStarred,
      phone: phone.trim(),
      company: company.trim() || undefined,
      companyAddress: companyAddress.trim() || undefined,
      intendedProduct: intendedProduct.trim() || undefined,
      groupId,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      description: description.trim() || undefined,
      remark: remark.trim() || undefined,
    });
  };

  const availableTags = tags.filter((t) => !selectedTags.includes(t));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 pb-24">
      {/* 基础信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('form.basic')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 姓名 */}
          <div className="space-y-1.5">
            <Label>
              {t('form.name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder={t('form.namePlaceholder')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* 性别 */}
          <div className="space-y-1.5">
            <Label>{t('form.gender')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors active:scale-95',
                  gender === 'male'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground',
                )}
              >
                {t('common.male')}
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={cn(
                  'flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors active:scale-95',
                  gender === 'female'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground',
                )}
              >
                {t('common.female')}
              </button>
            </div>
          </div>

          {/* 手机号 */}
          <div className="space-y-1.5">
            <Label>
              {t('form.phone')} <span className="text-destructive">*</span>
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
              placeholder={t('form.phonePlaceholder')}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* 星标 */}
          <div className="flex items-center justify-between">
            <Label>{t('form.starred')}</Label>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStarred(!isStarred)}
              className={cn(
                'h-9 gap-1.5',
                isStarred && 'border-amber-400 text-amber-500',
              )}
            >
              <Star
                className={cn(
                  'size-4',
                  isStarred && 'fill-amber-400 text-amber-400',
                )}
              />
              {isStarred ? t('form.starredOn') : t('form.starredOff')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 业务信息 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('form.business')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 公司 */}
          <div className="space-y-1.5">
            <Label>{t('form.company')}</Label>
            <Input
              value={company}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCompany(e.target.value)
              }
              onBlur={handleCompanyBlur}
              placeholder={t('form.companyPlaceholder')}
              list="company-suggestions"
            />
            <datalist id="company-suggestions">
              {companies.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* 公司地址 */}
          <div className="space-y-1.5">
            <Label>{t('form.companyAddress')}</Label>
            <Input
              value={companyAddress}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCompanyAddress(e.target.value)
              }
              placeholder={t('form.companyAddressPlaceholder')}
            />
          </div>

          {/* 意向产品 */}
          <div className="space-y-1.5">
            <Label>{t('form.intendedProduct')}</Label>
            <Input
              value={intendedProduct}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setIntendedProduct(e.target.value)
              }
              placeholder={t('form.intendedProductPlaceholder')}
            />
          </div>

          {/* 分组 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>{t('form.group')}</Label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setNewGroupOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="size-4" />
                {t('form.newGroup')}
              </Button>
            </div>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectGroup')} />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label>{t('form.tags')}</Label>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="-mr-1 flex size-5 items-center justify-center rounded-full"
                      aria-label={t('form.removeTag')}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTagInput(e.target.value)
                }
                onKeyDown={handleTagKeyDown}
                placeholder={t('form.tagPlaceholder')}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (tagInput.trim()) handleAddTag(tagInput);
                }}
                disabled={!tagInput.trim()}
                className="shrink-0"
              >
                <Plus className="size-4" />
                {t('form.addTag')}
              </Button>
            </div>
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="active:scale-95"
                  >
                    <Badge variant="outline" className="cursor-pointer py-1.5">
                      + {tag}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 说明与备注 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('form.notes')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t('form.description')}</Label>
            <Textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder={t('form.descriptionPlaceholder')}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('form.remark')}</Label>
            <Textarea
              value={remark}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setRemark(e.target.value)
              }
              placeholder={t('form.remarkPlaceholder')}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* 提交 */}
      <Button type="submit" className="w-full" size="lg">
        {submitLabel || t('form.save')}
      </Button>

      {/* 新建分组弹窗 */}
      <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('form.newGroupDialog')}</DialogTitle>
          </DialogHeader>
          <Input
            value={newGroupName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewGroupName(e.target.value)
            }
            placeholder={t('form.groupNamePlaceholder')}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateGroup();
              }
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleCreateGroup}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
