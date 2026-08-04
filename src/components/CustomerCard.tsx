import { useState, useRef, type TouchEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Phone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ICustomer } from '@/data/crm';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { motion } from 'framer-motion';
import { starWhileTap, cardHover, cardTap } from '@/lib/motion';
import { getAvatarGradient, getTagColor } from '@/lib/group-colors';

const REVEAL_WIDTH = 160;
const THRESHOLD = 40;

interface CustomerCardProps {
  customer: ICustomer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const navigate = useNavigate();
  const { toggleStar, deleteCustomer } = useCrm();
  const { t } = useI18n();

  const [translateX, setTranslateX] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentTranslateRef = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    setIsAnimating(false);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    if (!isSwiping.current) {
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        isSwiping.current = true;
      } else {
        return;
      }
    }

    const baseTranslate = isRevealed ? -REVEAL_WIDTH : 0;
    const newTranslateX = Math.max(-REVEAL_WIDTH, Math.min(0, baseTranslate + deltaX));
    currentTranslateRef.current = newTranslateX;
    setTranslateX(newTranslateX);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    setIsAnimating(true);

    if (currentTranslateRef.current < -THRESHOLD) {
      setTranslateX(-REVEAL_WIDTH);
      setIsRevealed(true);
    } else {
      setTranslateX(0);
      setIsRevealed(false);
    }
    setHasSwiped(true);
  };

  const handleCardClick = () => {
    if (hasSwiped) {
      setHasSwiped(false);
      return;
    }
    if (isRevealed) {
      setTranslateX(0);
      setIsRevealed(false);
      setIsAnimating(true);
      return;
    }
    navigate(`/customers/${customer.id}`);
  };

  const handleStar = (e: MouseEvent) => {
    e.stopPropagation();
    toggleStar(customer.id);
  };

  const handleCall = (e: MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = `tel:${customer.phone}`;
    link.click();
  };

  const handleSwipeStar = (e: MouseEvent) => {
    e.stopPropagation();
    toggleStar(customer.id);
    toast.success(customer.isStarred ? t('card.unstarred') : t('card.starred'));
    setTranslateX(0);
    setIsRevealed(false);
    setIsAnimating(true);
  };

  const handleSwipeDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteCustomer(customer.id);
    setDeleteOpen(false);
    toast.success(t('detail.deleted'));
  };

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-border bg-card',
      customer.isStarred && 'border-l-[3px] border-l-amber-400',
    )}>
      {/* 滑动操作按钮 */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          type="button"
          onClick={handleSwipeStar}
          className="flex w-20 flex-col items-center justify-center gap-1 bg-amber-400 text-white"
          aria-label={t('card.starred')}
        >
          <Star
            className={cn(
              'size-5',
              customer.isStarred && 'fill-white',
            )}
          />
          <span className="text-xs font-medium">
            {customer.isStarred ? t('card.unstar') : t('card.star')}
          </span>
        </button>
        <button
          type="button"
          onClick={handleSwipeDelete}
          className="flex w-20 flex-col items-center justify-center gap-1 bg-destructive text-destructive-foreground"
          aria-label={t('common.delete')}
        >
          <Trash2 className="size-5" />
          <span className="text-xs font-medium">{t('common.delete')}</span>
        </button>
      </div>

      {/* 卡片内容层 */}
      <div
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'relative cursor-pointer transition-colors active:bg-accent/50',
          customer.isStarred
            ? 'bg-gradient-to-r from-amber-50/40 to-transparent'
            : 'bg-card',
        )}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isAnimating ? 'transform 0.2s ease-out' : 'none',
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback
                className={cn('font-medium', getAvatarGradient(customer.gender))}
              >
                {customer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium">{customer.name}</span>
                {customer.isStarred && (
                  <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
                )}
              </div>
              {customer.company && (
                <p className="truncate text-sm text-muted-foreground">
                  {customer.company}
                </p>
              )}
              <p className="text-sm text-muted-foreground tabular-nums">
                {customer.phone}
              </p>
              {customer.tags && customer.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {customer.tags.slice(0, 3).map((tag, tagIdx) => (
                    <Badge key={tag} variant="secondary" className={cn('text-xs', getTagColor(tagIdx))}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-1">
              <motion.div whileTap={starWhileTap} className="inline-flex">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9"
                  onClick={handleStar}
                  aria-label={t('card.starred')}
                >
                  <Star
                    className={cn(
                      'size-4',
                      customer.isStarred
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground',
                    )}
                  />
                </Button>
              </motion.div>
              <Button
                size="icon"
                variant="ghost"
                className="size-9"
                onClick={handleCall}
                aria-label={t('card.call')}
              >
                <Phone className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
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
              onClick={handleDeleteConfirm}
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
