import type { OrderStatus } from '@/data/sales';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    labelKey: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }
> = {
  draft: { labelKey: 'status.draft', badgeVariant: 'secondary' },
  confirmed: { labelKey: 'status.confirmed', badgeVariant: 'default' },
  shipped: { labelKey: 'status.shipped', badgeVariant: 'outline' },
  paid: {
    labelKey: 'status.paid',
    badgeVariant: 'default',
    className: 'bg-success text-success-foreground',
  },
  cancelled: { labelKey: 'status.cancelled', badgeVariant: 'destructive' },
};

/** 计入统计的状态（排除 draft 和 cancelled） */
export const EFFECTIVE_STATUSES: OrderStatus[] = ['confirmed', 'shipped', 'paid'];

/** 已扣减库存的状态（取消/删除时需回补） */
export const INVENTORY_DEDUCTED_STATUSES: OrderStatus[] = [
  'confirmed',
  'shipped',
  'paid',
];

export function isEffective(status: string): boolean {
  return EFFECTIVE_STATUSES.includes(status as OrderStatus);
}

export function isInventoryDeducted(status: string): boolean {
  return INVENTORY_DEDUCTED_STATUSES.includes(status as OrderStatus);
}
