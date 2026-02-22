import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { useAuthStore } from '@/stores/authStore';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import CompareBar from '@/components/catalog/CompareBar';

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const SignInPage = lazy(() => import('@/pages/SignInPage'));
const CreateAccountPage = lazy(() => import('@/pages/CreateAccountPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ConfirmPasswordPage = lazy(() => import('@/pages/ConfirmPasswordPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const BlogListPage = lazy(() => import('@/pages/BlogListPage'));
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage'));
const BlogSearchPage = lazy(() => import('@/pages/BlogSearchPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const GuestOrderPage = lazy(() => import('@/pages/GuestOrderPage'));
const StoreLocatorPage = lazy(() => import('@/pages/StoreLocatorPage'));
const QuickOrderPage = lazy(() => import('@/pages/QuickOrderPage'));
const CmsPage = lazy(() => import('@/pages/CmsPage'));
const TrackOrderPage = lazy(() => import('@/pages/TrackOrderPage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth on app mount
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="category/*" element={<CategoryPage />} />
            <Route path="product/*" element={<ProductPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="checkout/confirmation" element={<OrderConfirmationPage />} />
            <Route path="sign-in" element={<SignInPage />} />
            <Route path="create-account" element={<CreateAccountPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="confirm-password" element={<ConfirmPasswordPage />} />
            <Route path="account/*" element={<AccountPage />} />
            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/search" element={<BlogSearchPage />} />
            <Route path="blog/:urlKey" element={<BlogDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="guest-order" element={<GuestOrderPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />
            <Route path="store-locator" element={<StoreLocatorPage />} />
            <Route path="quick-order" element={<QuickOrderPage />} />
            <Route path="compare" element={<ComparePage />} />
            {/* Single-segment CMS pages */}
            <Route path=":urlKey" element={<CmsPage />} />
            {/* Multi-segment CMS pages (e.g. /some/cms/page) — URL resolver handles routing */}
            <Route path="*" element={<CmsPage />} />
          </Route>
        </Routes>
      </Suspense>
      <CompareBar />
    </ErrorBoundary>
  );
}
