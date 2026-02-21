import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Navigation from '@/components/navigation/Navigation';
import MiniCart from '@/components/cart/MiniCart';
import { AuthModal } from '@/components/auth/AuthModal';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import OrganizationStructuredData from '@/components/seo/OrganizationStructuredData';
import WebSiteStructuredData from '@/components/seo/WebSiteStructuredData';
import AdvancedPopup from '@/components/common/AdvancedPopup';
import PWAInstallBanner from '@/components/common/PWAInstallBanner';
import ScrollToTop from '@/components/common/ScrollToTop';
import OfflineBanner from '@/components/common/OfflineBanner';
import { analytics } from '@/lib/analytics';

export default function MainLayout() {
  const { isAuthModalOpen, closeAuthModal, authModalView } = useUIStore();
  const { initCart } = useCartStore();
  const location = useLocation();

  useEffect(() => {
    initCart();
  }, []);

  // Track page views
  useEffect(() => {
    analytics.pageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* SEO: Organization & Website structured data */}
      <OrganizationStructuredData />
      <WebSiteStructuredData />

      <Header />
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MiniCart />
      <AdvancedPopup />
      <PWAInstallBanner />
      <ScrollToTop />
      <OfflineBanner />
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md relative">
            <AuthModal
              initialView={
                authModalView === 'createAccount'
                  ? 'CREATE_ACCOUNT'
                  : authModalView === 'forgotPassword'
                  ? 'FORGOT_PASSWORD'
                  : 'SIGN_IN'
              }
              onClose={closeAuthModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
