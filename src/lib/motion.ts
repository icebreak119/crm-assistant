/**
 * 共享 Framer Motion 动效配置
 * 所有页面统一引用，避免散落硬编码
 */

// 页面切换过渡：fade + slide 200ms（spread 到 motion.div）
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const;

// stagger 容器：子项依次入场，间隔 50ms
export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
} as const;

// stagger 子项：fade + slide-up spring 入场
export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20, mass: 0.8 } },
} as const;

// 星标弹跳：whileTap scale 1.25 spring
export const starWhileTap = {
  scale: 1.25,
  transition: { type: 'spring', stiffness: 300, damping: 15 },
} as const;

// 卡片列表 spring 入场过渡（用于 motion.div transition）
export const springEntrance = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
  mass: 0.8,
};

// 卡片 hover 微浮起
export const cardHover = {
  scale: 1.02,
  transition: { type: 'spring' as const, stiffness: 300, damping: 15 },
};

// 卡片 tap 轻按反馈
export const cardTap = {
  scale: 0.98,
};
