import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';
import SummarySection from './sections/SummarySection';
import OrdersSection from './sections/OrdersSection';
import DetailsSection from './sections/DetailsSection';

type TabValue = 'summary' | 'orders' | 'details';

const TABS: { value: TabValue; labelKey: string }[] = [
  { value: 'summary', labelKey: 'sales.tab.summary' },
  { value: 'orders', labelKey: 'sales.tab.orders' },
  { value: 'details', labelKey: 'sales.tab.details' },
];

export default function SalesPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabValue>('summary');

  return (
    <div className="min-h-screen">
      {/* 顶部标题 + Tab */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold">{t('sales.title')}</h1>
          <button
            onClick={() => navigate('/sales-orders/new')}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground active:scale-95"
          >
            <Plus className="size-3.5" />
            {t('sales.newOrder')}
          </button>
        </div>
        <div className="flex border-b border-border px-4">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-3 pb-2 pt-1 text-sm border-b-2 transition-colors',
                activeTab === tab.value
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground',
              )}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
              <SummarySection />
            </motion.div>
          )}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
              <OrdersSection />
            </motion.div>
          )}
          {activeTab === 'details' && (
            <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
              <DetailsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
