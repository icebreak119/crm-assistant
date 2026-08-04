import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ICustomer } from '@/data/crm';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';
import CustomerFormContent from '@/components/CustomerFormContent';
import BackButton from '@/components/BackButton';

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { addCustomer } = useCrm();
  const { t } = useI18n();

  const handleSubmit = (
    data: Omit<ICustomer, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    addCustomer(data);
    toast.success(t('form.add.saved'));
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo="/" />
        <h1 className="text-lg font-semibold">{t('form.add.title')}</h1>
      </div>
      <CustomerFormContent onSubmit={handleSubmit} submitLabel={t('form.add.submit')} />
    </div>
  );
}
