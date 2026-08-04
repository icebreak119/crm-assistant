/**
 * 图表颜色 hex 常量
 * 从 tailwind-theme.css 的 --chart-1..5 HSL 值转换而来
 * ECharts 不解析 CSS var，必须用 hex 字面量
 */

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export const CHART_COLORS = [
  hslToHex(215, 60, 32), // chart-1 深墨蓝
  hslToHex(245, 60, 32), // chart-2
  hslToHex(275, 60, 32), // chart-3
  hslToHex(305, 60, 32), // chart-4
  hslToHex(335, 60, 32), // chart-5
];
