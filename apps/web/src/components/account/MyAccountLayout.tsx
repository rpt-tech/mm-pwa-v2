import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import AccountSidebar from './AccountSidebar';

interface MyAccountLayoutProps {
  children: ReactNode;
  currentPage: string;
}

export default function MyAccountLayout({ children, currentPage }: MyAccountLayoutProps) {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 text-sm text-gray-600">
        <span>{t('common.home')}</span>
        <span className="mx-2">/</span>
        <span>{t('account.myAccount')}</span>
      </div>

      {!isMobile && (
        <h1 className="text-3xl font-bold mb-6">{t('account.myAccount')}</h1>
      )}

      <div className="flex gap-6">
        <AccountSidebar
          currentPage={currentPage}
          isOpen={isOpenSidebar}
          setIsOpen={setIsOpenSidebar}
        />

        {(!isOpenSidebar || !isMobile) && (
          <div className="flex-1 min-w-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
