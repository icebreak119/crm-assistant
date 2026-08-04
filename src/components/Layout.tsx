import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CrmProvider } from '@/hooks/useCrm';
import { SalesProvider } from '@/hooks/useSales';
import { I18nProvider } from '@/hooks/useI18n';
import BottomNav from '@/components/BottomNav';
import ApkDownloadButton from '@/components/ApkDownloadButton';
import { Toaster } from '@/components/ui/sonner';
import { pageTransition } from '@/lib/motion';
import '@/mobile.css';

export const Layout = () => {
  const { pathname } = useLocation();
  return (
    <I18nProvider>
      <CrmProvider>
        <SalesProvider>
          <div className="min-h-screen bg-background">
            <ApkDownloadButton />
            <main className="mx-auto max-w-md pb-nav-safe">
              <motion.div key={pathname} {...pageTransition}>
                <Outlet />
              </motion.div>
            </main>
            <BottomNav />
            <Toaster position="top-center" />
          </div>
        </SalesProvider>
      </CrmProvider>
    </I18nProvider>
  );
};
