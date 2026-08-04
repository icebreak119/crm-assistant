import { useI18n } from '@/hooks/useI18n';
import BackButton from '@/components/BackButton';
import ProductsSection from '@/pages/SalesPage/sections/ProductsSection';

export default function ProductsPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/" />
        <h1 className="text-lg font-semibold">{t('products.pageTitle')}</h1>
      </div>
      <div className="p-4">
        <ProductsSection />
      </div>
    </div>
  );
}
