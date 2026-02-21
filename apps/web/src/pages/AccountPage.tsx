import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';

const DashboardPage = lazy(() => import('./account/DashboardPage'));
const AccountInformationPage = lazy(() => import('./account/AccountInformationPage'));
const AddressBookPage = lazy(() => import('./account/AddressBookPage'));
const OrderHistoryPage = lazy(() => import('./account/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./OrderDetailPage'));
const WishlistPage = lazy(() => import('./account/WishlistPage'));
const UpdateEmailPage = lazy(() => import('./account/UpdateEmailPage'));
const UpdatePhonePage = lazy(() => import('./account/UpdatePhonePage'));

export default function AccountPage() {
  return (
    <Routes>
      <Route index element={<Navigate to="/account/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="information" element={<AccountInformationPage />} />
      <Route path="addresses" element={<AddressBookPage />} />
      <Route path="orders" element={<OrderHistoryPage />} />
      <Route path="orders/:orderNumber" element={<OrderDetailPage />} />
      <Route path="wishlist" element={<WishlistPage />} />
      <Route path="email" element={<UpdateEmailPage />} />
      <Route path="phone" element={<UpdatePhonePage />} />
    </Routes>
  );
}
