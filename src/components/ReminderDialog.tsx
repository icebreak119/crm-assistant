import { useState } from 'react';
import { Check, Bell } from 'lucide-react';
import { toast } from 'sonner';
import type { ICustomer } from '@/data/crm';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';
import { downloadICS } from '@/lib/ics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: ICustomer;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ReminderDialog({
  open,
  onOpenChange,
  customer,
}: ReminderDialogProps) {
  const { addReminder } = useCrm();
  const { t } = useI18n();
  const [date, setDate] = useState(tomorrowStr());
  const [time, setTime] = useState('09:00');
  const [note, setNote] = useState('');
  const [syncCalendar, setSyncCalendar] = useState(true);

  const handleSave = () => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const remindAt = new Date(year, month - 1, day, hours, minutes, 0).getTime();

    const reminder = addReminder({
      customerId: customer.id,
      customerName: customer.name,
      remindAt,
      note: note.trim() || undefined,
      status: 'pending',
      calendarSynced: syncCalendar,
    });

    if (syncCalendar) {
      try {
        downloadICS(reminder, t('reminders.icsTitle'));
        toast.success(t('reminderDialog.savedWithCalendar'));
      } catch {
        toast.success(t('reminderDialog.saved'));
      }
    } else {
      toast.success(t('reminderDialog.saved'));
    }

    setNote('');
    setSyncCalendar(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="size-4" />
            {t('reminderDialog.title')}
          </DialogTitle>
        </DialogHeader>

        {/* 客户名 */}
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <span className="text-sm text-muted-foreground">{t('reminderDialog.customer')}</span>
          <span className="font-medium">{customer.name}</span>
        </div>

        {/* 日期 + 时间 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t('reminderDialog.date')}</Label>
            <Input
              type="date"
              value={date}
              min={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('reminderDialog.time')}</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* 备注 */}
        <div className="space-y-1.5">
          <Label>{t('reminderDialog.note')}</Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('reminderDialog.notePlaceholder')}
            className="h-10"
          />
        </div>

        {/* 同步日历 */}
        <button
          type="button"
          onClick={() => setSyncCalendar(!syncCalendar)}
          className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-transform active:scale-[0.98]"
        >
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
              syncCalendar
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border',
            )}
          >
            {syncCalendar && <Check className="size-3" />}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium">{t('reminderDialog.calendar')}</span>
            <span className="block text-xs text-muted-foreground">
              {t('reminderDialog.calendarDesc')}
            </span>
          </span>
        </button>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <Button onClick={handleSave}>{t('reminderDialog.submit')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
