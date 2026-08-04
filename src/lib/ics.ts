import type { IReminder } from '@/data/crm';

/** ICS 文本转义 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** 格式化为 ICS 本地时间格式 YYYYMMDDTHHMMSS */
function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/** 生成 iCalendar 格式字符串 */
export function generateICS(reminder: IReminder, title: string): string {
  const start = new Date(reminder.remindAt);
  const end = new Date(reminder.remindAt + 60 * 60 * 1000);

  const summary = `${title} - ${reminder.customerName}`;
  const description = reminder.note ?? '';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CRM App//Reminder//CN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${reminder.id}@crm-app`,
    `DTSTAMP:${formatLocalDateTime(new Date())}`,
    `DTSTART:${formatLocalDateTime(start)}`,
    `DTEND:${formatLocalDateTime(end)}`,
    `SUMMARY:${escapeICS(summary)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(summary)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/** 生成 .ics 文件并触发下载 */
export function downloadICS(reminder: IReminder, title: string): void {
  const icsContent = generateICS(reminder, title);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const d = new Date(reminder.remindAt);
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}_${reminder.customerName}_${dateStr}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
