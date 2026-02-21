import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MyAccountLayout from '@/components/account/MyAccountLayout';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CUSTOMER } from '@/queries/account';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Package, Award } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: async () => {
      const response = await gqlClient.request(GET_CUSTOMER);
      return response.customer;
    }
  });

  if (isLoading) {
    return (
      <MyAccountLayout currentPage="dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0272BA]"></div>
        </div>
      </MyAccountLayout>
    );
  }

  if (error || !data) {
    return (
      <MyAccountLayout currentPage="dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {t('common.errorTryAgain')}
        </div>
      </MyAccountLayout>
    );
  }

  const customer = data;
  const customerName = customer.firstname;
  const customerPhone = customer.custom_attributes?.find(
    (attr: any) => attr.attribute_code === 'company_user_phone_number'
  )?.value || '';

  const defaultAddress = customer.addresses?.find((addr: any) => addr.default_shipping);
  const streetRows = defaultAddress?.street?.join(', ') || '';
  const district = defaultAddress?.custom_attributes?.find(
    (attr: any) => attr.attribute_code === 'district'
  )?.value || '';
  const ward = defaultAddress?.custom_attributes?.find(
    (attr: any) => attr.attribute_code === 'ward'
  )?.value || '';
  const city = defaultAddress?.city || '';

  const additionalAddressString = `${ward ? ', ' + ward : ''}${district ? ', ' + district : ''}${city ? ', ' + city : ''}`;
  const defaultAddressString = defaultAddress ? `${streetRows}${additionalAddressString}` : '';

  const totalOrders = customer.orders?.total_count || 0;
  const loyaltyPoints = customer.loyalty_points || 0;

  return (
    <MyAccountLayout currentPage="dashboard">
      {isMobile && (
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <button
            onClick={() => {}}
            className="text-gray-600 hover:text-gray-900"
          >
            &lt;
          </button>
          <span>{t('account.dashboard')}</span>
        </h2>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Customer Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <p className="text-xl font-semibold mb-2">{customerName}</p>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">{t('common.phone')}:</span>{' '}
                <span>{customerPhone}</span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">{t('common.email')}:</span>{' '}
                <span>{customer.email}</span>
              </p>
            </div>
          </div>
          <Link
            to="/account/information"
            className="text-[#0272BA] hover:underline text-sm font-medium"
          >
            {t('common.update')}
          </Link>
        </div>

        {/* Default Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">{t('account.shippingAddress')}</p>
              {defaultAddress && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {t('common.default')}
                </span>
              )}
            </div>
            {defaultAddressString ? (
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t('common.address')}:</span>{' '}
                <span>{defaultAddressString}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {t('account.noDefaultAddress')}
              </p>
            )}
          </div>
          <Link
            to="/account/addresses"
            className="text-[#0272BA] hover:underline text-sm font-medium"
          >
            {t('common.edit')}
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('account.totalOrders')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalOrders} {totalOrders === 1 ? t('account.order') : t('account.orders')}
              </p>
            </div>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('account.totalPoints')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loyaltyPoints} {loyaltyPoints === 1 ? t('account.point') : t('account.points')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {customer.orders?.items && customer.orders.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{t('account.recentOrders')}</h3>
          <div className="space-y-4">
            {customer.orders.items.slice(0, 3).map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">#{order.number}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {order.total.grand_total.value.toLocaleString()} {order.total.grand_total.currency}
                  </p>
                  <p className="text-sm text-gray-600">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/account/orders"
            className="block mt-4 text-center text-[#0272BA] hover:underline text-sm font-medium"
          >
            {t('account.viewAllOrders')}
          </Link>
        </div>
      )}
    </MyAccountLayout>
  );
}
