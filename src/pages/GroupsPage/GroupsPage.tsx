import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Plus, MoreVertical, Folder, Users, Globe } from 'lucide-react';
import { toast } from 'sonner';
import type { IGroup } from '@/data/crm';
import { useCrm } from '@/hooks/useCrm';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { getGroupColor } from '@/lib/group-colors';

export default function GroupsPage() {
  const { groups, addGroup, renameGroup, deleteGroup, getCustomerCountByGroup } =
    useCrm();
  const { t, locale, setLocale } = useI18n();
  const [listRef] = useAutoAnimate({ duration: 200 });
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameTarget, setRenameTarget] = useState<IGroup | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<IGroup | null>(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error(t('groups.nameRequired'));
      return;
    }
    addGroup(trimmed);
    setNewName('');
    setAddOpen(false);
    toast.success(t('groups.created'));
  };

  const handleRename = () => {
    if (!renameTarget) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      toast.error(t('groups.nameRequired'));
      return;
    }
    renameGroup(renameTarget.id, trimmed);
    setRenameTarget(null);
    setRenameValue('');
    toast.success(t('groups.renamed'));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const count = getCustomerCountByGroup(deleteTarget.id);
    deleteGroup(deleteTarget.id);
    setDeleteTarget(null);
    toast.success(
      count > 0
        ? t('groups.deletedWithCustomers', { count })
        : t('groups.deleted'),
    );
  };

  return (
    <div className="min-h-screen">
      {/* 顶部标题 */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <h1 className="text-lg font-semibold">{t('groups.title')}</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          {t('groups.add')}
        </Button>
      </div>

      {/* 分组列表 */}
      <div ref={listRef} className="space-y-2 p-4">
        {groups.map((g, gIdx) => {
          const count = getCustomerCountByGroup(g.id);
          const color = getGroupColor(gIdx);
          return (
            <Card key={g.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg text-white', color.gradient)}>
                  <Folder className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{g.name}</span>
                    {g.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        {t('common.default')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('groups.customerCount', { count })}
                  </p>
                </div>
                {!g.isDefault && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-9">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameTarget(g);
                          setRenameValue(g.name);
                        }}
                      >
                        {t('common.rename')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteTarget(g)}
                      >
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardContent>
            </Card>
          );
        })}

        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-4">
              <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-amber-400/10">
                <Users className="size-9 text-primary/40" />
              </div>
              <span className="absolute -left-1 top-1 size-2 rounded-full bg-primary/20" />
              <span className="absolute -right-1 top-3 size-2 rounded-full bg-amber-400/30" />
              <span className="absolute bottom-0 -right-2 size-1.5 rounded-full bg-rose-400/30" />
            </div>
            <p className="mb-4 text-muted-foreground">{t('groups.empty')}</p>
            <Button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-primary to-primary/90 shadow-md shadow-primary/20">
              <Plus className="size-4" />
              {t('groups.addNew')}
            </Button>
          </div>
        )}
      </div>

      {/* 通用设置 - 语言切换 */}
      <div className="px-4 pb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t('groups.language')}</p>
              </div>
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  type="button"
                  onClick={() => setLocale('zh')}
                  className={
                    'rounded-md px-3 py-1 text-sm font-medium transition-colors ' +
                    (locale === 'zh'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground')
                  }
                >
                  {t('groups.languageZh')}
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={
                    'rounded-md px-3 py-1 text-sm font-medium transition-colors ' +
                    (locale === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground')
                  }
                >
                  {t('groups.languageEn')}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 新增分组 */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('groups.addDialog')}</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewName(e.target.value)
            }
            placeholder={t('groups.namePlaceholder')}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleAdd}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重命名 */}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('groups.renameDialog')}</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRenameValue(e.target.value)
            }
            placeholder={t('groups.renamePlaceholder')}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRename();
              }
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleRename}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('groups.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && getCustomerCountByGroup(deleteTarget.id) > 0
                ? t('groups.deleteWithCustomers', {
                    count: getCustomerCountByGroup(deleteTarget.id),
                  })
                : t('groups.deleteWarning')}
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
