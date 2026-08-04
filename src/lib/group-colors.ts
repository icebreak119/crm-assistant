/**
 * 分组色彩工具
 * 6 色循环色板，用于分组图标渐变、客户卡片色条等
 */

interface GroupColor {
  /** 渐变背景 class，用于图标圆圈 */
  gradient: string;
  /** 文字色 class */
  text: string;
  /** 浅底色 class，用于 Badge / 统计 */
  bg: string;
  /** 外环色 class */
  ring: string;
}

const PALETTE: GroupColor[] = [
  {
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    text: 'text-blue-600',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
  },
  {
    gradient: 'bg-gradient-to-br from-rose-400 to-pink-500',
    text: 'text-rose-600',
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-500/20',
  },
  {
    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    text: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
  },
  {
    gradient: 'bg-gradient-to-br from-amber-400 to-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
  },
  {
    gradient: 'bg-gradient-to-br from-violet-500 to-violet-600',
    text: 'text-violet-600',
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/20',
  },
  {
    gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    text: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/20',
  },
];

/** 按 index 取色，循环 6 色 */
export function getGroupColor(index: number): GroupColor {
  return PALETTE[index % PALETTE.length];
}

/** 头像渐变背景 */
export function getAvatarGradient(gender: 'male' | 'female'): string {
  return gender === 'female'
    ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white'
    : 'bg-gradient-to-br from-primary to-primary/60 text-white';
}

/** 标签彩色循环（3 色） */
const TAG_COLORS = [
  'bg-primary/10 text-primary border-0',
  'bg-amber-500/10 text-amber-700 border-0',
  'bg-emerald-500/10 text-emerald-700 border-0',
];

export function getTagColor(index: number): string {
  return TAG_COLORS[index % TAG_COLORS.length];
}
