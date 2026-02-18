import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { User, MapPin, ShoppingBag, Heart, LogOut } from 'lucide-react';

interface AccountSidebarProps {
  currentPage: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface NavLink {
  key: string;
  to: string;
  label: string;
  icon: React.ReactNode;
}

export default function AccountSidebar({ currentPage, isOpen, setIsOpen }: AccountSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const handleSignOut = async () => {
    await logout();
    setConfirmingSignOut(false);
    navigate('/');
  };

  const handleClick = (key: string) => {
    if (isMobile || key !== currentPage) {
      setIsOpen(false);
    }
  };

  const links: NavLink[] = [
    { key: 'dashboard', to: '/account/dashboard', label: t('account.dashboard'), icon: <User className="w-5 h-5" /> },
    { key: 'accountInformation', to: '/account/information', label: t('account.accountInformation'), icon: <User className="w-5 h-5" /> },
    { key: 'addressBook', to: '/account/addresses', label: t('account.addressBook'), icon: <MapPin className="w-5 h-5" /> },
    { key: 'orderHistory', to: '/account/orders', label: t('account.orderHistory'), icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'wishlist', to: '/account/wishlist', label: t('account.wishlist'), icon: <Heart className="w-5 h-5" /> }
  ];

  if (!isOpen && isMobile) {
    return null;
  }

  return (
    <>
      <aside className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : 'w-64 flex-shrink-0'}`}>
        {isMobile && (
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">{t('account.myAccount')}</h1>
          </div>
        )}

        <nav className="p-4">
          <ul className="space-y-2">
            {links.map(({ key, to, label, icon }) => (
              <li key={key}>
                <Link
                  to={to}
                  onClick={() => handleClick(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === key
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              </li>
            ))}

            <li className="pt-4 border-t">
              <button
                onClick={() => setConfirmingSignOut(true)}
                className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('account.signOut')}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Sign out confirmation dialog */}
      {confirmingSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">{t('account.confirmSignOut')}</h3>
            <p className="text-gray-600 mb-6">{t('account.confirmSignOutText')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmingSignOut(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('account.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
