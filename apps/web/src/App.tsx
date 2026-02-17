import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LoadingIndicator from '@/components/ui/LoadingIndicator';

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const SignInPage = lazy(() => import('@/pages/SignInPage'));
const CreateAccountPage = lazy(() => import('@/pages/CreateAccountPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const CmsPage = lazy(() => import('@/pages/CmsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
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
          <Route path="sign-in" element={<SignInPage />} />
          <Route path="create-account" element={<CreateAccountPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="account/*" element={<AccountPage />} />
          <Route path=":urlKey" element={<CmsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
