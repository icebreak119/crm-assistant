import { useI18n } from '@/hooks/useI18n';
import BackButton from '@/components/BackButton';
import InventorySection from '@/pages/SalesPage/sections/InventorySection';

export default function InventoryPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/" />
        <h1 className="text-lg font-semibold">{t('inventory.pageTitle')}</h1>
      </div>
      <div className="p-4">
        <InventorySection />
      </div>
    </div>
  );
}
