import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { useAuthStore } from '@/stores/authStore';

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
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const GuestOrderPage = lazy(() => import('@/pages/GuestOrderPage'));
const StoreLocatorPage = lazy(() => import('@/pages/StoreLocatorPage'));
const CmsPage = lazy(() => import('@/pages/CmsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth on app mount
    initializeAuth();
  }, [initializeAuth]);

  return (
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
          <Route path="blog/:urlKey" element={<BlogDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="guest-order" element={<GuestOrderPage />} />
          <Route path="store-locator" element={<StoreLocatorPage />} />
          <Route path=":urlKey" element={<CmsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
