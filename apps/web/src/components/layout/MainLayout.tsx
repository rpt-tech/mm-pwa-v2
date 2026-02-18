import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Navigation from '@/components/navigation/Navigation';
import MiniCart from '@/components/cart/MiniCart';
import { AuthModal } from '@/components/auth/AuthModal';
import { useUIStore } from '@/stores/uiStore';
import OrganizationStructuredData from '@/components/seo/OrganizationStructuredData';
import WebSiteStructuredData from '@/components/seo/WebSiteStructuredData';

export default function MainLayout() {
  const { isAuthModalOpen, closeAuthModal, authModalView } = useUIStore();

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
