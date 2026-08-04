// EXPORTS: ICustomer, IGroup, IReminder, DEFAULT_GROUPS, DEFAULT_TAGS, DEFAULT_COMPANIES, MOCK_CUSTOMERS, MOCK_REMINDERS

export interface ICustomer {
  /** 客户唯一标识 */
  id: string;
  /** 用户姓名（必填） */
  name: string;
  /** 性别：男/女 */
  gender: 'male' | 'female';
  /** 星标：标记重要客户 */
  isStarred: boolean;
  /** 客户简要说明 */
  description?: string;
  /** 自定义标签数组 */
  tags?: string[];
  /** 公司名称（使用者自定义） */
  company?: string;
  /** 手机号（必填） */
  phone: string;
  /** 公司地址 */
  companyAddress?: string;
  /** 所属分组ID */
  groupId: string;
  /** 意向产品 */
  intendedProduct?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
}

export interface IGroup {
  /** 分组唯一标识 */
  id: string;
  /** 分组名称 */
  name: string;
  /** 是否为默认分组（"我的客户"不可删除/重命名） */
  isDefault: boolean;
  /** 创建时间戳 */
  createdAt: number;
}

export interface IReminder {
  /** 提醒唯一标识 */
  id: string;
  /** 关联客户ID */
  customerId: string;
  /** 客户姓名（冗余存储） */
  customerName: string;
  /** 提醒时间戳 */
  remindAt: number;
  /** 备注 */
  note?: string;
  /** 状态：待跟进 / 已完成 */
  status: 'pending' | 'done';
  /** 是否已同步日历 */
  calendarSynced: boolean;
  /** 创建时间戳 */
  createdAt: number;
}

export const DEFAULT_GROUPS: IGroup[] = [
  { id: 'group_default', name: '我的客户', isDefault: true, createdAt: 1700000000000 },
];

export const DEFAULT_TAGS: string[] = ['高意向', '老客户', '待跟进', '已签约', 'VIP'];

export const DEFAULT_COMPANIES: string[] = ['腾讯科技', '阿里巴巴', '字节跳动'];

export const MOCK_CUSTOMERS: ICustomer[] = [
  {
    id: 'cust_1',
    name: '张伟',
    gender: 'male',
    isStarred: true,
    description: '采购负责人，对SaaS方案感兴趣',
    tags: ['高意向', 'VIP'],
    company: '腾讯科技',
    phone: '13800138001',
    companyAddress: '深圳市南山区科技园',
    groupId: 'group_default',
    intendedProduct: '企业版CRM',
    remark: '周五下午有空，可约线下',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'cust_2',
    name: '李娜',
    gender: 'female',
    isStarred: false,
    description: '市场总监，关注数据分析',
    tags: ['待跟进'],
    company: '阿里巴巴',
    phone: '13900139002',
    companyAddress: '杭州市余杭区文一西路',
    groupId: 'group_default',
    intendedProduct: '数据看板',
    remark: '',
    createdAt: 1700100000000,
    updatedAt: 1700100000000,
  },
  {
    id: 'cust_3',
    name: '王强',
    gender: 'male',
    isStarred: false,
    description: '技术总监，关心系统集成',
    tags: ['老客户'],
    company: '字节跳动',
    phone: '13700137003',
    companyAddress: '北京市海淀区中关村',
    groupId: 'group_default',
    intendedProduct: 'API对接',
    remark: '已有竞品，需差异化',
    createdAt: 1700200000000,
    updatedAt: 1700200000000,
  },
];

const _now = Date.now();
const _DAY = 86400000;

export const MOCK_REMINDERS: IReminder[] = [
  {
    id: 'rem_1',
    customerId: 'cust_1',
    customerName: '张伟',
    remindAt: _now + _DAY,
    note: '二次拜访，带上方案PPT',
    status: 'pending',
    calendarSynced: false,
    createdAt: _now,
  },
  {
    id: 'rem_2',
    customerId: 'cust_2',
    customerName: '李娜',
    remindAt: _now - _DAY,
    note: '电话回访，确认需求',
    status: 'pending',
    calendarSynced: false,
    createdAt: _now - 2 * _DAY,
  },
  {
    id: 'rem_3',
    customerId: 'cust_3',
    customerName: '王强',
    remindAt: _now - 3 * _DAY,
    note: '发送报价单',
    status: 'done',
    calendarSynced: true,
    createdAt: _now - 5 * _DAY,
  },
];
