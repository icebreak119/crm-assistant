# 客户管理 APK - 需求拆解文档

## 产品概述

- **产品类型**: 客户关系管理应用（移动端 APK）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 需要移动端随时记录、管理客户信息的销售/业务人员
- **核心价值**: 以最显眼的入口快速录入客户，支持自定义标签、公司、分组，帮助业务人员高效沉淀客户资产
- **界面语言**: 中文
- **主题偏好**: 浅色
- **导航模式**: 路径导航
- **导航布局**: Bottom Navigation（底部导航，移动端应用标准范式，突出"新增客户"入口）

> **技术栈说明**: 用户原话明确要求 "以 java 为技术栈，做一款客户管理的安卓 apk"。当前平台生成的是 Web 前端应用（React + TypeScript），无法直接产出原生 Android APK / Java 代码。本方案按 Web App 形态规划页面与功能，作为产品需求与交互蓝本，后续可由原生开发同学按此蓝本用 Java/Android 实现。

---

## 页面结构总览

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 客户列表 | `CustomersPage.tsx` | `/` | 一级 | 底部导航 |
| 新增客户 | `CustomerFormPage.tsx` | `/customers/new` | 一级 | 底部导航（中间凸起按钮，最显眼位置） |
| 分组管理 | `GroupsPage.tsx` | `/groups` | 一级 | 底部导航 |
| 客户详情 | `CustomerDetailPage.tsx` | `/customers/:id` | 二级 | 客户列表页 → 列表项点击 |
| 编辑客户 | `CustomerEditPage.tsx` | `/customers/:id/edit` | 二级 | 客户详情页 → "编辑"按钮 |

> **页面类型说明**：
> - **一级页面**：出现在底部导航中，用户可直接访问
> - **二级页面**：不在导航中，从一级页面跳转进入

---

## 页面布局建议

- **客户列表页**: 上下分区布局，顶部为搜索栏 + 分组筛选 Tab，下方为客户卡片列表（星标客户置顶，卡片展示姓名/公司/手机号/标签），视觉重心在列表浏览。初始态为空状态引导。
- **新增客户页**: 单栏表单布局，最显眼位置为顶部标题"新增客户" + 主操作按钮"保存"。表单分区：基础信息（姓名/性别/手机号/星标）、业务信息（公司/公司地址/意向产品/分组/标签）、备注说明（说明/备注）。标签与公司支持自由输入新增。视觉重心在输入与提交。
- **分组管理页**: 列表布局，展示所有分组及组内客户数，支持新增/重命名/删除。视觉重心在分组列表与新增入口。

---

## 导航配置

- **导航布局**: Bottom Navigation（底部固定，移动端标准）
- **导航项**（仅一级页面）:
  | 导航文字 | 路由 | 图标(可选) | 说明 |
  |---------|------|-----------|------|
  | 客户 | `/` | Users | 客户列表 |
  | **新增** | `/customers/new` | Plus / 加号 | **中间凸起圆形按钮，最显眼位置**，满足"新增客户在最显眼地方"的核心诉求 |
  | 分组 | `/groups` | Folder | 分组管理 |

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 客户列表数据 | local-persist | localStorage key=`__crm_customers`，JSON.parse 读取 + 异常兜底 | 初始 3 条 source='mock' 示例客户 |
| 新增客户保存 | local-persist | 表单提交后写入 localStorage `__crm_customers`（追加到数组） | 无 |
| 编辑客户保存 | local-persist | 按 id 更新 localStorage `__crm_customers` 中对应记录 | 无 |
| 删除客户 | local-persist | 按 id 从 localStorage `__crm_customers` 过滤移除 | 无 |
| 分组列表 | local-persist | localStorage key=`__crm_groups`，默认含"我的客户"分组 | 初始含 1 条"我的客户" |
| 新增分组 | local-persist | 追加到 localStorage `__crm_groups` | 无 |
| 自定义标签 | local-persist | localStorage key=`__crm_tags`，用户输入新标签时追加去重 | 初始 5 个常用标签示例 |
| 自定义公司 | local-persist | localStorage key=`__crm_companies`，输入新公司时追加去重 | 初始 3 个示例公司 |
| 星标切换 | local-persist | 更新对应客户 isStarred 字段到 localStorage | 无 |

> 类型选择 + 兜底约束见上方"数据来源声明方法论"段。

---

## 功能列表

- **客户列表页（CustomersPage）**:
  - **页面目标**: 浏览、查找、管理所有客户，快速进入详情或新增
  - **功能点**:
    - **展示客户列表**: 卡片式展示，每张卡片含姓名、公司、手机号、标签；星标客户置顶并带星标图标
    - **搜索客户**: 顶部搜索框，按姓名/公司/手机号模糊匹配实时筛选
    - **按分组筛选**: 顶部 Tab 切换分组（全部 / 我的客户 / 其他自定义组），点击后列表只展示该组客户
    - **快速新增入口**: 页面右下角 FAB 按钮 + 底部导航中间凸起按钮，双重入口直达新增页
    - **进入客户详情**: 点击列表卡片跳转至客户详情页
    - **切换星标**: 列表卡片上点击星标图标快速标记/取消重要客户（变更状态，带 toast 反馈）

- **新增客户页（CustomerFormPage）**:
  - **页面目标**: 高效录入客户完整信息，核心功能模块，最显眼入口
  - **功能点**:
    - **录入基础信息**: 姓名（必填）、性别（男/女二选一 Radio）、手机号（必填，校验格式）
    - **星标标记**: 星标开关/按钮，标记重要客户，选中后高亮
    - **录入业务信息**: 公司（支持自由输入，输入时联想已有公司，可新增）、公司地址、意向产品
    - **选择分组**: 下拉选择分组，默认选中"我的客户"，支持在表单内快速新建分组（弹窗输入组名 → 保存 → 自动选中）
    - **自定义标签**: 标签输入区，支持从已有标签选择 + 自由输入新增标签，多个标签以 Chip 形式展示，可删除
    - **录入说明与备注**: 说明（客户简要说明）、备注（补充信息）
    - **保存客户**: 顶部"保存"按钮，校验必填项后写入 localStorage，成功 toast + 返回列表页
    - **表单校验**: 姓名和手机号必填，手机号格式校验，校验失败行内提示

- **分组管理页（GroupsPage）**:
  - **页面目标**: 管理客户分组，新增、重命名、删除分组
  - **功能点**:
    - **展示分组列表**: 列出所有分组，每项显示分组名称 + 组内客户数量
    - **新增分组**: 顶部"新增分组"按钮，弹出输入框输入组名 → 保存
    - **重命名分组**: 列表项操作菜单 → 重命名 → 弹窗修改 → 保存
    - **删除分组**: 列表项操作菜单 → 删除 → 确认弹窗（若组内有客户则提示"将客户移至'我的客户'"）→ 确认删除
    - **默认分组保护**: "我的客户"分组不可删除/重命名

- **客户详情页（CustomerDetailPage）**:
  - **页面目标**: 查看客户完整信息，进行编辑/删除/星标操作
  - **功能点**:
    - **展示客户信息**: 分区展示基础信息（姓名/性别/星标/手机号）、业务信息（公司/地址/意向产品/分组/标签）、说明与备注
    - **编辑客户**: "编辑"按钮跳转至编辑页
    - **删除客户**: "删除"按钮 → 确认弹窗 → 删除后返回列表页 + toast
    - **拨打电话**: 手机号旁"拨打"按钮，调用 `tel:` 协议直接拨号
    - **切换星标**: 顶部星标按钮快速标记/取消重要客户

- **编辑客户页（CustomerEditPage）**:
  - **页面目标**: 修改已有客户信息
  - **功能点**:
    - **预填表单**: 进入页面后表单预填该客户所有字段
    - **修改并保存**: 同新增页表单，修改后保存覆盖原记录，成功 toast + 返回详情页
    - **表单校验**: 同新增页校验规则

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__crm_customers` | 客户完整信息列表，类型为 `ICustomer[]` | 客户列表页、新增客户页、客户详情页、编辑客户页、分组管理页 |
| `__crm_groups` | 分组列表，类型为 `IGroup[]` | 分组管理页、新增/编辑客户页 |
| `__crm_tags` | 自定义标签集合，类型为 `string[]` | 新增/编辑客户页 |
| `__crm_companies` | 自定义公司集合，类型为 `string[]` | 新增/编辑客户页 |

```ts
interface ICustomer {
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

interface IGroup {
  /** 分组唯一标识 */
  id: string;
  /** 分组名称 */
  name: string;
  /** 是否为默认分组（"我的客户"不可删除/重命名） */
  isDefault: boolean;
  /** 创建时间戳 */
  createdAt: number;
}
```

---

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 无参考材料，从 CRM 业务语义与移动端表单场景自主建立视觉语言
- **核心情绪 / 应用类型**: 移动端客户管理工具，需要专业可信、录入高效、信息层次清晰，让销售在碎片时间里快速完成客户建档
- **独特记忆点**: 深墨蓝主色 + 星标鎏金强调，用"名片夹翻页"式的分组切换隐喻客户关系的分类管理

## 2. Art Direction

- **方向名**: 墨蓝名片夹
- **Design Style**: Material Design 秩序感 + Swiss Minimalist 瑞士极简 —— 适配安卓原生交互习惯，表单密度适中，字段分组清晰，减少录入认知负担
- **DNA 参数**: 圆角中等 `rounded-lg` / 阴影轻 `shadow-sm` / 间距 standard `gap-4 p-6` / 字体方向清晰无衬线 / 装饰手法以分组色条 + 星标金点为主
- **应用类型**: Tool —— 移动端单栏纵向表单，新增客户入口固定在底部导航或 FAB，表单字段按语义分 3-4 个 card 区块

## 3. Color System

**色彩关系**: 深墨蓝主色 + 同色极浅蓝灰反馈底 + 纸白背景 + 鎏金星标强调
**配色设计理由**: primary 深墨蓝承担新建客户主 CTA、分组激活态、导航选中态；bg 纸白保证表单字段高可读；accent 浅蓝灰用于输入框 focus 底和列表 hover；星标用独立金色不抢 primary 主交互位
**主色推导**: 墨蓝取自商务名片与文件夹的经典视觉记忆，传递专业可靠感，区别于通用 SaaS 蓝的轻飘感
**使用比例**: 60% 中性 / 30% 辅助 / 10% primary；严禁主按钮、tab 激活、icon、边框、链接同时使用 primary

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(210 20% 98%) | 页面背景，微蓝纸白 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 表单分组卡片、弹层 |
| text | `--foreground` | `text-foreground` | hsl(215 28% 17%) | 标题和正文，深墨蓝黑 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 14% 45%) | 占位符、说明文字 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(215 60% 32%) | 新建客户 CTA、分组激活 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | primary 上的白色文字 |
| accent | `--accent` | `bg-accent` | hsl(214 30% 94%) | 输入框 focus 底、列表选中浅底 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(215 28% 25%) | accent 上的深色文字 |
| border | `--border` | `border-border` | hsl(214 20% 88%) | 输入框、卡片分隔线 |

**语义色提示**: 星标重要客户 `hsl(42 85% 52%)` 三态：bg `hsl(42 85% 96%)` / border `hsl(42 60% 80%)` / text `hsl(42 70% 35%)`；成功 `hsl(142 50% 38%)`、警告 `hsl(38 80% 48%)`、错误 `hsl(0 70% 48%)` 三态结构同星标；语义色饱和度与 primary 的 60% 对齐在 ±15% 区间

## 4. 字体与节奏

- **font-display**: Noto Sans SC —— 安卓端中文渲染稳定，字重层次清晰适合分组标题
- **font-body**: Noto Sans SC —— 与 display 统一，保证移动端小字号下的可读性
- **字号**: H1 text-2xl；H2(分组标题) text-lg；body text-base；muted text-sm；表单标签 text-sm font-medium
- **圆角**: 中等 `rounded-lg` —— 适配安卓 Material 语言，表单卡片和按钮统一手感

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导，无参考布局
- **Page / Section Order**: 首页(客户列表+分组切换) → 新增客户表单(核心入口) → 客户详情 → 分组管理；新增客户表单按"基本信息 / 联系方式 / 分类备注"三段式 card 排列
- **Standard Content Zone**: 移动端 `max-w-md mx-auto`，表单容器 `px-4 py-6`
- **Shell / Frame Alignment**: 安全区独立网格，底部固定导航 + FAB 新建入口不随内容滚动
- **Padding & Rhythm**: `px-4 py-4` 卡片间距 `gap-4`，字段行间距 `gap-3`，保持 4px 基数
- **Full-bleed Zones**: 底部导航条和 FAB 可全宽固定，表单内容受标准容器约束
- **Local Narrowing**: 标签输入区在卡片内 `flex-wrap`，意向产品用 chip 横向滚动选择
- **Overflow Strategy**: 标签 chip 列表 `overflow-x-auto`；客户长列表 `overflow-y-auto` + 分页加载
- **Flexibility Boundary**: 允许各卡片内边距和字段间距微调；不允许切换主色、圆角语言或卡片阴影层级

## 6. 视觉与动效

- **装饰**: 分组左侧 4px 色条 + 星标金色实心点
- **阴影/边界**: 轻 —— 卡片 `shadow-sm` + `border` 边框，不堆叠重阴影
- **动效**: 精致 —— 输入框 focus 时边框渐变为 primary 色 200ms；星标点击有缩放反馈 150ms；分组切换时列表 `fade-slide` 入场 200ms

## 7. 组件原则

- 新增客户按钮为主 primary FAB，固定右下角，图标 + 文字
- 表单输入框 Default 灰边框 / Focus primary 边框 + accent 浅底 / Error 红边框 + 红色提示文字
- 性别选择用 segmented control 二选一，不用下拉；星标用 toggle icon 开关
- 标签 chip 支持自定义输入，已选 chip 可点击删除；分组下拉支持"新建分组"入口
- 空状态展示插画 + 引导文案，不回退默认 shadcn 灰色占位

## 8. Image Direction

- **Image Role**: 无强制图片需求，优先通过色条分组、星标金点和 chip 标签建立视觉记忆点
- **Image Art Direction**: 无强制图片需求；若后续需要空状态插画，建议用简洁线条 + primary 墨蓝单色绘制"名片夹/文件夹"隐喻图形
- **Image Prompt Keywords**: 无
- **Image Avoidance**: 无

## 9. Anti-patterns

- **Split personality**: 列表页用卡片圆角而表单页用直角；全站卡片统一 `rounded-lg` + `shadow-sm`
- **Default SaaS drift**: 回退到默认蓝紫渐变按钮；用墨蓝 `hsl(215 60% 32%)` 承担所有主交互
- **Form overload**: 把 11 个字段平铺在一个滚动页不分段；按"基本信息/联系方式/分类备注"三段 card 分组
- **Invisible interaction**: 星标和性别选择只做点击没做 focus-visible；每个 toggle 和 chip 都要有键盘可达状态
- **Mono-hue tyranny**: 星标也用 primary 蓝导致和导航激活态混淆；星标独立金色 `hsl(42 85% 52%)` 与 primary 形成对比
- **Status color drift**: 错误红用 `hsl(0 90% 50%)` 饱和度过高；需压到 `hsl(0 70% 48%)` 与 primary 的 60% 饱和度对齐