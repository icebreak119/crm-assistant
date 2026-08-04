import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { useI18n } from '@/hooks/useI18n';
import type {
  IProduct,
  IProductGroup,
  ISalesOrder,
  IInventory,
  OrderStatus,
} from '@/data/sales';
import {
  DEFAULT_PRODUCT_GROUPS,
  MOCK_PRODUCTS,
  MOCK_SALES_ORDERS,
  MOCK_INVENTORY,
} from '@/data/sales';
import { deleteImage } from '@/lib/imageDB';
import { isInventoryDeducted } from '@/lib/order-status';

const STORAGE_KEYS = {
  products: '__crm_products',
  productGroups: '__crm_product_groups',
  salesOrders: '__crm_sales_orders',
  inventory: '__crm_inventory',
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = scopedStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    scopedStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function initProducts(): IProduct[] {
  return readStorage<IProduct[]>(STORAGE_KEYS.products, []);
}

function initProductGroups(): IProductGroup[] {
  const stored = readStorage<IProductGroup[]>(STORAGE_KEYS.productGroups, []);
  if (stored.length === 0) {
    writeStorage(STORAGE_KEYS.productGroups, DEFAULT_PRODUCT_GROUPS);
    return DEFAULT_PRODUCT_GROUPS;
  }
  return stored;
}

function initSalesOrders(): ISalesOrder[] {
  return readStorage<ISalesOrder[]>(STORAGE_KEYS.salesOrders, []);
}

function initInventory(): IInventory[] {
  return readStorage<IInventory[]>(STORAGE_KEYS.inventory, []);
}

function genOrderNo(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `SO-${dateStr}-${random}`;
}

interface SalesContextValue {
  products: IProduct[];
  productGroups: IProductGroup[];
  salesOrders: ISalesOrder[];
  inventory: IInventory[];

  // Product CRUD
  addProduct: (data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, data: Partial<IProduct>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => IProduct | undefined;

  // Product group CRUD
  addProductGroup: (name: string) => IProductGroup;
  renameProductGroup: (id: string, name: string) => void;
  deleteProductGroup: (id: string) => void;
  getProductGroupName: (groupId: string) => string;
  getProductCountByGroup: (groupId: string) => number;

  // Sales order CRUD
  addSalesOrder: (data: Omit<ISalesOrder, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => ISalesOrder;
  deleteSalesOrder: (id: string) => void;
  confirmSalesOrder: (id: string) => void;
  getSalesOrderById: (id: string) => ISalesOrder | undefined;
  getOrdersByCustomerId: (customerId: string) => ISalesOrder[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Inventory CRUD
  addInventory: (data: Omit<IInventory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventory: (id: string, data: Partial<IInventory>) => void;
  getInventoryByProductId: (productId: string) => IInventory | undefined;
}

const SalesContext = createContext<SalesContextValue | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<IProduct[]>(initProducts);
  const [productGroups, setProductGroups] = useState<IProductGroup[]>(initProductGroups);
  const [salesOrders, setSalesOrders] = useState<ISalesOrder[]>(initSalesOrders);
  const [inventory, setInventory] = useState<IInventory[]>(initInventory);
  const { t } = useI18n();

  // Product CRUD
  const addProduct = useCallback(
    (data: Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const newProduct: IProduct = {
        ...data,
        id: genId('prod'),
        createdAt: now,
        updatedAt: now,
      };
      setProducts((prev) => {
        const next = [newProduct, ...prev];
        writeStorage(STORAGE_KEYS.products, next);
        return next;
      });
    },
    [],
  );

  const updateProduct = useCallback((id: string, data: Partial<IProduct>) => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p,
      );
      writeStorage(STORAGE_KEYS.products, next);
      return next;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const product = products.find((p) => p.id === id);
    if (product?.image?.startsWith('idb:')) {
      deleteImage(product.image).catch(() => {});
    }
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      writeStorage(STORAGE_KEYS.products, next);
      return next;
    });
  }, [products]);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  );

  // Product group CRUD
  const addProductGroup = useCallback((name: string) => {
    const newGroup: IProductGroup = {
      id: genId('pgroup'),
      name,
      isDefault: false,
      createdAt: Date.now(),
    };
    setProductGroups((prev) => {
      const next = [...prev, newGroup];
      writeStorage(STORAGE_KEYS.productGroups, next);
      return next;
    });
    return newGroup;
  }, []);

  const renameProductGroup = useCallback((id: string, name: string) => {
    setProductGroups((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, name } : g));
      writeStorage(STORAGE_KEYS.productGroups, next);
      return next;
    });
  }, []);

  const deleteProductGroup = useCallback((id: string) => {
    setProductGroups((prev) => {
      const next = prev.filter((g) => g.id !== id);
      writeStorage(STORAGE_KEYS.productGroups, next);
      return next;
    });
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.groupId === id ? { ...p, groupId: 'pgroup_default' } : p,
      );
      writeStorage(STORAGE_KEYS.products, next);
      return next;
    });
  }, []);

  const getProductGroupName = useCallback(
    (groupId: string) =>
      productGroups.find((g) => g.id === groupId)?.name ?? t('common.noGroup'),
    [productGroups, t],
  );

  const getProductCountByGroup = useCallback(
    (groupId: string) => products.filter((p) => p.groupId === groupId).length,
    [products],
  );

  // Sales order CRUD
  const addSalesOrder = useCallback(
    (data: Omit<ISalesOrder, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const newOrder: ISalesOrder = {
        ...data,
        id: genId('so'),
        orderNo: genOrderNo(),
        createdAt: now,
        updatedAt: now,
      };
      setSalesOrders((prev) => {
        const next = [newOrder, ...prev];
        writeStorage(STORAGE_KEYS.salesOrders, next);
        return next;
      });
      return newOrder;
    },
    [],
  );

  const deleteSalesOrder = useCallback((id: string) => {
    const order = salesOrders.find((o) => o.id === id);

    setSalesOrders((prev) => {
      const next = prev.filter((o) => o.id !== id);
      writeStorage(STORAGE_KEYS.salesOrders, next);
      return next;
    });

    // 已确认订单删除时自动回补库存
    if (order && isInventoryDeducted(order.status)) {
      setInventory((prev) => {
        const next = prev.map((inv) => {
          const orderItem = order.items.find(
            (item) => item.productId === inv.productId,
          );
          if (orderItem) {
            return {
              ...inv,
              quantity: inv.quantity + orderItem.quantity,
              updatedAt: Date.now(),
            };
          }
          return inv;
        });
        writeStorage(STORAGE_KEYS.inventory, next);
        return next;
      });
    }
  }, [salesOrders]);

  const confirmSalesOrder = useCallback((id: string) => {
    const order = salesOrders.find((o) => o.id === id);
    if (!order || order.status !== 'draft') return;

    setSalesOrders((prev) => {
      const next = prev.map((o) =>
        o.id === id
          ? { ...o, status: 'confirmed' as const, updatedAt: Date.now() }
          : o,
      );
      writeStorage(STORAGE_KEYS.salesOrders, next);
      return next;
    });

    // 自动扣减库存
    setInventory((prev) => {
      const next = prev.map((inv) => {
        const orderItem = order.items.find(
          (item) => item.productId === inv.productId,
        );
        if (orderItem) {
          return {
            ...inv,
            quantity: inv.quantity - orderItem.quantity,
            updatedAt: Date.now(),
          };
        }
        return inv;
      });
      writeStorage(STORAGE_KEYS.inventory, next);
      return next;
    });
  }, [salesOrders]);

  const getSalesOrderById = useCallback(
    (id: string) => salesOrders.find((o) => o.id === id),
    [salesOrders],
  );

  const getOrdersByCustomerId = useCallback(
    (customerId: string) =>
      salesOrders.filter((o) => o.customerId === customerId),
    [salesOrders],
  );

  const updateOrderStatus = useCallback(
    (id: string, newStatus: OrderStatus) => {
      const order = salesOrders.find((o) => o.id === id);
      if (!order) return;

      // 取消订单时，若库存已扣减 → 回补
      if (newStatus === 'cancelled' && isInventoryDeducted(order.status)) {
        setInventory((prev) => {
          const next = prev.map((inv) => {
            const orderItem = order.items.find(
              (item) => item.productId === inv.productId,
            );
            if (orderItem) {
              return {
                ...inv,
                quantity: inv.quantity + orderItem.quantity,
                updatedAt: Date.now(),
              };
            }
            return inv;
          });
          writeStorage(STORAGE_KEYS.inventory, next);
          return next;
        });
      }

      setSalesOrders((prev) => {
        const next = prev.map((o) =>
          o.id === id ? { ...o, status: newStatus, updatedAt: Date.now() } : o,
        );
        writeStorage(STORAGE_KEYS.salesOrders, next);
        return next;
      });
    },
    [salesOrders],
  );

  // Inventory CRUD
  const addInventory = useCallback(
    (data: Omit<IInventory, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      setInventory((prev) => {
        const existing = prev.find((i) => i.productId === data.productId);
        if (existing) {
          const next = prev.map((i) =>
            i.productId === data.productId
              ? {
                  ...i,
                  quantity: i.quantity + data.quantity,
                  remark: data.remark || i.remark,
                  updatedAt: now,
                }
              : i,
          );
          writeStorage(STORAGE_KEYS.inventory, next);
          return next;
        }
        const newInv: IInventory = {
          ...data,
          id: genId('inv'),
          createdAt: now,
          updatedAt: now,
        };
        const next = [newInv, ...prev];
        writeStorage(STORAGE_KEYS.inventory, next);
        return next;
      });
    },
    [],
  );

  const updateInventory = useCallback((id: string, data: Partial<IInventory>) => {
    setInventory((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, ...data, updatedAt: Date.now() } : i,
      );
      writeStorage(STORAGE_KEYS.inventory, next);
      return next;
    });
  }, []);

  const getInventoryByProductId = useCallback(
    (productId: string) => inventory.find((i) => i.productId === productId),
    [inventory],
  );

  const value: SalesContextValue = {
    products,
    productGroups,
    salesOrders,
    inventory,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addProductGroup,
    renameProductGroup,
    deleteProductGroup,
    getProductGroupName,
    getProductCountByGroup,
    addSalesOrder,
    deleteSalesOrder,
    confirmSalesOrder,
    getSalesOrderById,
    getOrdersByCustomerId,
    updateOrderStatus,
    addInventory,
    updateInventory,
    getInventoryByProductId,
  };

  return (
    <SalesContext.Provider value={value}>{children}</SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within SalesProvider');
  return ctx;
}
