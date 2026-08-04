import { NavLink } from 'react-router-dom';
import { Users, Plus, Folder, Bell, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';

export default function BottomNav() {
  const { reminders } = useCrm();
  const { t } = useI18n();
  const hasOverdue = reminders.some(
    (r) => r.status === 'pending' && r.remindAt < Date.now(),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-safe">
      <div className="mx-auto flex h-16 max-w-md items-end justify-around px-2">
        {/* 客户 */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-2 transition-all duration-200',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex items-center justify-center rounded-lg px-4 py-0.5 transition-all duration-200',
                  isActive && 'bg-primary/10',
                )}
              >
                <Users className="size-5" />
              </span>
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  isActive && 'font-semibold',
                )}
              >
                {t('nav.customers')}
              </span>
            </>
          )}
        </NavLink>

        {/* 销售 */}
        <NavLink
          to="/sales"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-2 transition-all duration-200',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex items-center justify-center rounded-lg px-4 py-0.5 transition-all duration-200',
                  isActive && 'bg-primary/10',
                )}
              >
                <ShoppingCart className="size-5" />
              </span>
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  isActive && 'font-semibold',
                )}
              >
                {t('nav.sales')}
              </span>
            </>
          )}
        </NavLink>

        {/* 新增 - 中间凸起 */}
        <NavLink to="/customers/new" className="flex flex-col items-center -mt-6">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/10 transition-transform active:scale-95">
            <Plus className="size-7" />
          </div>
          <span className="mt-0.5 text-xs font-medium text-primary">{t('nav.add')}</span>
        </NavLink>

        {/* 提醒 */}
        <NavLink
          to="/reminders"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-2 transition-all duration-200',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'relative flex items-center justify-center rounded-lg px-4 py-0.5 transition-all duration-200',
                  isActive && 'bg-primary/10',
                )}
              >
                <Bell className="size-5" />
                {hasOverdue && (
                  <span className="absolute right-1 top-0 size-2 rounded-full bg-destructive" />
                )}
              </span>
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  isActive && 'font-semibold',
                )}
              >
                {t('nav.reminders')}
              </span>
            </>
          )}
        </NavLink>

        {/* 分组 */}
        <NavLink
          to="/groups"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-2 transition-all duration-200',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex items-center justify-center rounded-lg px-4 py-0.5 transition-all duration-200',
                  isActive && 'bg-primary/10',
                )}
              >
                <Folder className="size-5" />
              </span>
              <span
                className={cn(
                  'text-xs transition-all duration-200',
                  isActive && 'font-semibold',
                )}
              >
                {t('nav.groups')}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
