import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { useI18n } from '@/hooks/useI18n';
import type { ICustomer, IGroup, IReminder } from '@/data/crm';
import {
  DEFAULT_GROUPS,
  DEFAULT_TAGS,
  DEFAULT_COMPANIES,
  MOCK_CUSTOMERS,
  MOCK_REMINDERS,
} from '@/data/crm';

const STORAGE_KEYS = {
  customers: '__crm_customers',
  groups: '__crm_groups',
  tags: '__crm_tags',
  companies: '__crm_companies',
  reminders: '__crm_reminders',
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

function initCustomers(): ICustomer[] {
  return readStorage<ICustomer[]>(STORAGE_KEYS.customers, []);
}

function initGroups(): IGroup[] {
  const stored = readStorage<IGroup[]>(STORAGE_KEYS.groups, []);
  if (stored.length === 0) {
    writeStorage(STORAGE_KEYS.groups, DEFAULT_GROUPS);
    return DEFAULT_GROUPS;
  }
  return stored;
}

function initTags(): string[] {
  return readStorage<string[]>(STORAGE_KEYS.tags, []);
}

function initCompanies(): string[] {
  return readStorage<string[]>(STORAGE_KEYS.companies, []);
}

function initReminders(): IReminder[] {
  return readStorage<IReminder[]>(STORAGE_KEYS.reminders, []);
}

interface CrmContextValue {
  customers: ICustomer[];
  groups: IGroup[];
  tags: string[];
  companies: string[];
  addCustomer: (data: Omit<ICustomer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, data: Partial<ICustomer>) => void;
  deleteCustomer: (id: string) => void;
  toggleStar: (id: string) => void;
  addGroup: (name: string) => IGroup;
  renameGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  addTag: (tag: string) => void;
  addCompany: (company: string) => void;
  getCustomerById: (id: string) => ICustomer | undefined;
  getGroupName: (groupId: string) => string;
  getCustomerCountByGroup: (groupId: string) => number;
  reminders: IReminder[];
  addReminder: (data: Omit<IReminder, 'id' | 'createdAt'>) => IReminder;
  completeReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
}

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<ICustomer[]>(initCustomers);
  const [groups, setGroups] = useState<IGroup[]>(initGroups);
  const [tags, setTags] = useState<string[]>(initTags);
  const [companies, setCompanies] = useState<string[]>(initCompanies);
  const [reminders, setReminders] = useState<IReminder[]>(initReminders);
  const { t } = useI18n();

  const addCustomer = useCallback(
    (data: Omit<ICustomer, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Date.now();
      const newCustomer: ICustomer = {
        ...data,
        id: genId('cust'),
        createdAt: now,
        updatedAt: now,
      };
      setCustomers((prev) => {
        const next = [newCustomer, ...prev];
        writeStorage(STORAGE_KEYS.customers, next);
        return next;
      });
    },
    [],
  );

  const updateCustomer = useCallback((id: string, data: Partial<ICustomer>) => {
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: Date.now() } : c,
      );
      writeStorage(STORAGE_KEYS.customers, next);
      return next;
    });
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      writeStorage(STORAGE_KEYS.customers, next);
      return next;
    });
  }, []);

  const toggleStar = useCallback((id: string) => {
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? { ...c, isStarred: !c.isStarred, updatedAt: Date.now() }
          : c,
      );
      writeStorage(STORAGE_KEYS.customers, next);
      return next;
    });
  }, []);

  const addGroup = useCallback((name: string) => {
    const newGroup: IGroup = {
      id: genId('group'),
      name,
      isDefault: false,
      createdAt: Date.now(),
    };
    setGroups((prev) => {
      const next = [...prev, newGroup];
      writeStorage(STORAGE_KEYS.groups, next);
      return next;
    });
    return newGroup;
  }, []);

  const renameGroup = useCallback((id: string, name: string) => {
    setGroups((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, name } : g));
      writeStorage(STORAGE_KEYS.groups, next);
      return next;
    });
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setGroups((prev) => {
      const next = prev.filter((g) => g.id !== id);
      writeStorage(STORAGE_KEYS.groups, next);
      return next;
    });
    setCustomers((prev) => {
      const next = prev.map((c) =>
        c.groupId === id ? { ...c, groupId: 'group_default' } : c,
      );
      writeStorage(STORAGE_KEYS.customers, next);
      return next;
    });
  }, []);

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setTags((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      writeStorage(STORAGE_KEYS.tags, next);
      return next;
    });
  }, []);

  const addCompany = useCallback((company: string) => {
    const trimmed = company.trim();
    if (!trimmed) return;
    setCompanies((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      writeStorage(STORAGE_KEYS.companies, next);
      return next;
    });
  }, []);

  const getCustomerById = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers],
  );

  const getGroupName = useCallback(
    (groupId: string) =>
      groups.find((g) => g.id === groupId)?.name ?? t('common.noGroup'),
    [groups, t],
  );

  const getCustomerCountByGroup = useCallback(
    (groupId: string) => customers.filter((c) => c.groupId === groupId).length,
    [customers],
  );

  const addReminder = useCallback(
    (data: Omit<IReminder, 'id' | 'createdAt'>) => {
      const newReminder: IReminder = {
        ...data,
        id: genId('rem'),
        createdAt: Date.now(),
      };
      setReminders((prev) => {
        const next = [newReminder, ...prev];
        writeStorage(STORAGE_KEYS.reminders, next);
        return next;
      });
      return newReminder;
    },
    [],
  );

  const completeReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: 'done' as const } : r,
      );
      writeStorage(STORAGE_KEYS.reminders, next);
      return next;
    });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeStorage(STORAGE_KEYS.reminders, next);
      return next;
    });
  }, []);

  const value: CrmContextValue = {
    customers,
    groups,
    tags,
    companies,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleStar,
    addGroup,
    renameGroup,
    deleteGroup,
    addTag,
    addCompany,
    getCustomerById,
    getGroupName,
    getCustomerCountByGroup,
    reminders,
    addReminder,
    completeReminder,
    deleteReminder,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used within CrmProvider');
  return ctx;
}
