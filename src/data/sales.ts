// EXPORTS: IProduct, IProductGroup, ISalesOrderItem, ISalesOrder, IInventory, OrderStatus, DEFAULT_PRODUCT_GROUPS, MOCK_PRODUCTS, MOCK_SALES_ORDERS, MOCK_INVENTORY

export interface IProduct {
  /** 产品唯一标识 */
  id: string;
  /** 产品名称 */
  name: string;
  /** 编码 */
  code: string;
  /** 产品分组ID */
  groupId: string;
  /** 型号 */
  model?: string;
  /** 规格 */
  spec?: string;
  /** 厂家 */
  manufacturer?: string;
  /** 单价 */
  unitPrice: number;
  /** 成本价 */
  costPrice?: number;
  /** 单位 */
  unit: string;
  /** 到期日期 YYYY-MM-DD */
  expiryDate?: string;
  /** 备注 */
  remark?: string;
  /** 产品图片 base64 */
  image?: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
}

export interface IProductGroup {
  /** 分组唯一标识 */
  id: string;
  /** 分组名称 */
  name: string;
  /** 是否为默认分组 */
  isDefault: boolean;
  /** 创建时间戳 */
  createdAt: number;
}

export interface ISalesOrderItem {
  /** 产品ID */
  productId: string;
  /** 产品名称 */
  productName: string;
  /** 单价 */
  unitPrice: number;
  /** 成本价 */
  costPrice?: number;
  /** 数量 */
  quantity: number;
  /** 小计 */
  subtotal: number;
}

export type OrderStatus = 'draft' | 'confirmed' | 'shipped' | 'paid' | 'cancelled';

export interface ISalesOrder {
  /** 订单唯一标识 */
  id: string;
  /** 单号 */
  orderNo: string;
  /** 关联客户ID */
  customerId?: string;
  /** 客户名 */
  customerName?: string;
  /** 产品明细 */
  items: ISalesOrderItem[];
  /** 总金额 */
  totalAmount: number;
  /** 总成本 */
  totalCost: number;
  /** 总盈利 */
  totalProfit: number;
  /** 总数量 */
  totalQuantity: number;
  /** 状态 */
  status: OrderStatus;
  /** 备注 */
  remark?: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
}

export interface IInventory {
  /** 库存记录唯一标识 */
  id: string;
  /** 产品ID */
  productId: string;
  /** 产品名称 */
  productName: string;
  /** 产品编码 */
  productCode: string;
  /** 库存数量 */
  quantity: number;
  /** 单位 */
  unit: string;
  /** 备注 */
  remark?: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
}

export const DEFAULT_PRODUCT_GROUPS: IProductGroup[] = [
  { id: 'pgroup_default', name: '全部产品', isDefault: true, createdAt: 1700000000000 },
];

const _now = Date.now();
const _DAY = 86400000;

export const MOCK_PRODUCTS: IProduct[] = [
  {
    id: 'prod_1',
    name: '无人机桨叶',
    code: 'P001',
    groupId: 'pgroup_default',
    model: 'PRO-4K',
    spec: '24寸碳纤维',
    manufacturer: '飞行科技',
    unitPrice: 299,
    costPrice: 180,
    unit: '对',
    expiryDate: '2027-06-30',
    remark: '适配PRO系列无人机',
    createdAt: _now - 10 * _DAY,
    updatedAt: _now - 10 * _DAY,
  },
  {
    id: 'prod_2',
    name: '航拍相机',
    code: 'P002',
    groupId: 'pgroup_default',
    model: 'CAM-4K',
    spec: '4K/60fps',
    manufacturer: '索尼',
    unitPrice: 3599,
    costPrice: 2200,
    unit: '台',
    expiryDate: '2028-01-15',
    remark: '含稳定云台',
    createdAt: _now - 8 * _DAY,
    updatedAt: _now - 8 * _DAY,
  },
  {
    id: 'prod_3',
    name: '备用电池',
    code: 'P003',
    groupId: 'pgroup_default',
    model: 'BAT-5000',
    spec: '5000mAh',
    manufacturer: '飞行科技',
    unitPrice: 199,
    costPrice: 80,
    unit: '块',
    expiryDate: '2026-12-31',
    createdAt: _now - 5 * _DAY,
    updatedAt: _now - 5 * _DAY,
  },
  {
    id: 'prod_4',
    name: '遥控器',
    code: 'P004',
    groupId: 'pgroup_default',
    model: 'RC-PRO',
    spec: 'OLED屏',
    manufacturer: '飞行科技',
    unitPrice: 899,
    costPrice: 450,
    unit: '个',
    expiryDate: '2027-03-20',
    createdAt: _now - 3 * _DAY,
    updatedAt: _now - 3 * _DAY,
  },
];

export const MOCK_SALES_ORDERS: ISalesOrder[] = [
  {
    id: 'so_1',
    orderNo: 'SO-20260728-001',
    customerId: 'cust_1',
    customerName: '张伟',
    items: [
      {
        productId: 'prod_1',
        productName: '无人机桨叶',
        unitPrice: 299,
        costPrice: 180,
        quantity: 2,
        subtotal: 598,
      },
      {
        productId: 'prod_3',
        productName: '备用电池',
        unitPrice: 199,
        costPrice: 80,
        quantity: 1,
        subtotal: 199,
      },
    ],
    totalAmount: 797,
    totalCost: 440,
    totalProfit: 357,
    totalQuantity: 3,
    status: 'paid',
    remark: '客户自提',
    createdAt: _now - 3 * _DAY,
    updatedAt: _now - 3 * _DAY,
  },
  {
    id: 'so_2',
    orderNo: 'SO-20260729-002',
    customerId: 'cust_2',
    customerName: '李娜',
    items: [
      {
        productId: 'prod_2',
        productName: '航拍相机',
        unitPrice: 3599,
        costPrice: 2200,
        quantity: 1,
        subtotal: 3599,
      },
    ],
    totalAmount: 3599,
    totalCost: 2200,
    totalProfit: 1399,
    totalQuantity: 1,
    status: 'shipped',
    remark: '',
    createdAt: _now - 2 * _DAY,
    updatedAt: _now - 2 * _DAY,
  },
  {
    id: 'so_3',
    orderNo: 'SO-20260730-003',
    customerId: 'cust_3',
    customerName: '王强',
    items: [
      {
        productId: 'prod_4',
        productName: '遥控器',
        unitPrice: 899,
        costPrice: 450,
        quantity: 1,
        subtotal: 899,
      },
      {
        productId: 'prod_1',
        productName: '无人机桨叶',
        unitPrice: 299,
        costPrice: 180,
        quantity: 1,
        subtotal: 299,
      },
    ],
    totalAmount: 1198,
    totalCost: 630,
    totalProfit: 568,
    totalQuantity: 2,
    status: 'draft',
    remark: '等待客户确认',
    createdAt: _now - 1 * _DAY,
    updatedAt: _now - 1 * _DAY,
  },
];

export const MOCK_INVENTORY: IInventory[] = [
  {
    id: 'inv_1',
    productId: 'prod_1',
    productName: '无人机桨叶',
    productCode: 'P001',
    quantity: 48,
    unit: '对',
    createdAt: _now - 10 * _DAY,
    updatedAt: _now - 3 * _DAY,
  },
  {
    id: 'inv_2',
    productId: 'prod_2',
    productName: '航拍相机',
    productCode: 'P002',
    quantity: 7,
    unit: '台',
    createdAt: _now - 8 * _DAY,
    updatedAt: _now - 2 * _DAY,
  },
  {
    id: 'inv_3',
    productId: 'prod_3',
    productName: '备用电池',
    productCode: 'P003',
    quantity: 4,
    unit: '块',
    remark: '库存不足，需补货',
    createdAt: _now - 5 * _DAY,
    updatedAt: _now - 1 * _DAY,
  },
  {
    id: 'inv_4',
    productId: 'prod_4',
    productName: '遥控器',
    productCode: 'P004',
    quantity: 10,
    unit: '个',
    createdAt: _now - 3 * _DAY,
    updatedAt: _now - 3 * _DAY,
  },
];
