import { useState } from 'react';
import { Plus, Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { toast } from 'sonner';
import { useSales } from '@/hooks/useSales';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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

export default function ProductGroupsPage() {
  const { productGroups, addProductGroup, renameProductGroup, deleteProductGroup, getProductCountByGroup } = useSales();
  const { t } = useI18n();
  const [listRef] = useAutoAnimate({ duration: 200 });

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error(t('productGroups.nameRequired'));
      return;
    }
    addProductGroup(newName.trim());
    toast.success(t('productGroups.created'));
    setNewName('');
    setAddOpen(false);
  };

  const handleRename = () => {
    if (!renameTarget) return;
    if (!renameName.trim()) {
      toast.error(t('productGroups.nameRequired'));
      return;
    }
    renameProductGroup(renameTarget.id, renameName.trim());
    toast.success(t('productGroups.renamed'));
    setRenameTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProductGroup(deleteTarget.id);
    toast.success(t('productGroups.deleted'));
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen pb-detail-safe">
      {/* 顶部 */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/products" />
        <h1 className="flex-1 text-lg font-bold">{t('productGroups.title')}</h1>
        <button onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="size-5" />
        </button>
      </div>

      {/* 分组列表 */}
      <div ref={listRef} className="space-y-2 p-4">
        {productGroups.map((group) => (
          <Card key={group.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Folder className="size-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{group.name}</span>
                  {group.isDefault && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {t('common.default')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('productGroups.productCount', { count: getProductCountByGroup(group.id) })}
                </p>
              </div>
              {!group.isDefault && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setRenameTarget({ id: group.id, name: group.name });
                        setRenameName(group.name);
                      }}
                    >
                      <Pencil className="mr-2 size-4" />
                      {t('common.rename')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() =>
                        setDeleteTarget({ id: group.id, name: group.name })
                      }
                    >
                      <Trash2 className="mr-2 size-4" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 新增分组 Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('productGroups.newGroup')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>{t('productGroups.groupName')}</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('productGroups.groupNamePlaceholder')}
              className="h-10"
              autoFocus
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={handleAdd}>{t('common.create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重命名 Dialog */}
      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('productGroups.renameDialog')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>{t('productGroups.groupName')}</Label>
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>
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
            <AlertDialogTitle>{t('productGroups.deleteConfirm', { name: deleteTarget?.name ?? '' })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('productGroups.deleteWarning')}
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
