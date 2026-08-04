import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { ICustomer } from '@/data/crm';
import { useCrm } from '@/hooks/useCrm';
import { useI18n } from '@/hooks/useI18n';
import CustomerFormContent from '@/components/CustomerFormContent';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';

export default function CustomerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomerById, updateCustomer } = useCrm();
  const { t } = useI18n();

  const customer = id ? getCustomerById(id) : undefined;

  if (!customer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">{t('form.edit.notFound')}</p>
        <Button onClick={() => navigate('/')}>{t('form.edit.back')}</Button>
      </div>
    );
  }

  const handleSubmit = (
    data: Omit<ICustomer, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    updateCustomer(customer.id, data);
    toast.success(t('form.edit.saved'));
    navigate(`/customers/${customer.id}`);
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <BackButton fallbackTo={`/customers/${customer.id}`} />
        <h1 className="text-lg font-semibold">{t('form.edit.title')}</h1>
      </div>
      <CustomerFormContent
        initialData={customer}
        onSubmit={handleSubmit}
        submitLabel={t('form.edit.submit')}
      />
    </div>
  );
}
