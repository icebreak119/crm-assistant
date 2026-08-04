import { Link } from "react-router-dom";
import { useI18n } from '@/hooks/useI18n';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-8">{t('notFound.title')}</p>
      <Link to="/" className="text-primary hover:underline">{t('notFound.back')}</Link>
    </div>
  );
}
