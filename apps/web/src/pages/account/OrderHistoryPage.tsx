import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Package, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import MyAccountLayout from '@/components/account/MyAccountLayout';
import { gqlClient } from '@/lib/graphql-client';
import { GET_CUSTOMER_ORDERS, GET_AVAILABLE_STATUS } from '@/queries/account';

export default function OrderHistoryPage() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const pageSize = 10;

  // Fetch available statuses for filter
  const { data: statusData } = useQuery({
    queryKey: ['availableOrderStatus'],
    queryFn: async () => {
      const result: any = await gqlClient.request(GET_AVAILABLE_STATUS);
      return result.availableStatus as Array<{ status: string; label: string }>;
    },
    staleTime: 600000,
  });

  // Fetch orders
  const { data, isLoading } = useQuery({
    queryKey: ['customerOrders', currentPage, selectedStatus],
    queryFn: async () => {
      const variables: any = { currentPage, pageSize };
      if (selectedStatus) variables.filter = { status: { eq: selectedStatus } };
      const result = await gqlClient.request(GET_CUSTOMER_ORDERS, variables);
      return result.customer.orders;
    },
  });

  const orders = data?.items || [];
  const totalCount = data?.total_count || 0;
  const totalPages = data?.page_info?.total_pages || 1;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode?.toLowerCase()) {
      case 'complete':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-[#0272BA] bg-blue-50';
      case 'pending':
      case 'pending_payment':
        return 'text-yellow-600 bg-yellow-50';
      case 'canceled':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'holded':
        return 'text-orange-600 bg-orange-50';
      case 'closed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <MyAccountLayout currentPage="orders">
        <h2 className="text-2xl font-bold mb-6">{t('account.orderHistory')}</h2>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006341]"></div>
        </div>
      </MyAccountLayout>
    );
  }

  return (
    <MyAccountLayout currentPage="orders">
      <Helmet><title>Lịch sử đơn hàng | MM Mega Market</title></Helmet>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold">
          {t('account.orderHistory')} ({totalCount})
        </h2>
        {statusData && statusData.length > 0 && (
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341] focus:ring-1 focus:ring-[#006341] bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            {statusData.map((s) => (
              <option key={s.status} value={s.status}>{s.label}</option>
            ))}
          </select>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">{t('account.noOrders')}</p>
          <Link
            to="/"
            className="inline-block bg-[#006341] text-white px-6 py-2 rounded-lg hover:bg-[#004d33]"
          >
            {t('account.startShopping')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-[#006341] transition-colors"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">
                      {t('account.orderNumber')}: {order.number}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        order.status_code || order.state || order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('account.orderDate')}: {formatDate(order.order_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {order.total.grand_total.value.toLocaleString('vi-VN')}{' '}
                    {order.total.grand_total.currency}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items.length} {t('account.items')}
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="space-y-2 mb-4">
                {order.items.slice(0, 2).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {item.product?.thumbnail?.url ? (
                        <img
                          src={item.product.thumbnail.url}
                          alt={item.product.ecom_name || item.product_name}
                          className="w-full h-full object-contain"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {item.product?.ecom_name || item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('account.quantity')}: {item.quantity_ordered}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.product_sale_price.value.toLocaleString('vi-VN')}{' '}
                      {item.product_sale_price.currency}
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-500 pl-15">
                    +{order.items.length - 2} {t('account.moreItems')}
                  </p>
                )}
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium text-gray-700 mb-1">
                    {t('account.shippingAddress')}:
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.firstname}{' '}
                    {order.shipping_address.lastname}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.street.join(', ')}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.city}, {order.shipping_address.region}{' '}
                    {order.shipping_address.postcode}
                  </p>
                  <p className="text-gray-600">
                    {t('account.phone')}: {order.shipping_address.telephone}
                  </p>
                </div>
              )}

              {/* View Details Button */}
              <Link
                to={`/account/orders/${order.number}`}
                className="flex items-center justify-center gap-2 w-full py-2 border border-[#006341] text-[#006341] rounded-lg hover:bg-[#006341] hover:text-white transition-colors"
              >
                <span>{t('account.viewOrderDetails')}</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${currentPage === page ? 'bg-[#006341] text-white' : 'hover:bg-gray-100'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </MyAccountLayout>
  );
}
