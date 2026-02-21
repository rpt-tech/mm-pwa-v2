import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { GET_ORDER_DETAILS } from '@/queries/account';

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string) {
  const statusMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    complete: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
    closed: 'bg-gray-100 text-gray-800',
  };
  return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['orderDetails', orderNumber],
    queryFn: () => gqlClient.request(GET_ORDER_DETAILS, { orderNumber }),
    enabled: !!orderNumber,
  });

  const order = data?.customer?.orders?.items?.[0];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('order.notFound', 'Order not found')}
          </h2>
          <Link to="/account/orders" className="text-[#0272BA] hover:underline">
            {t('order.backToOrders', 'Back to Orders')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/account/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          {t('common.back', 'Back')}
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {t('order.orderNumber', 'Order')} #{order.number}
            </h1>
            <p className="text-gray-600 mt-1">{formatDate(order.order_date)}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-[#006341]" />
              <h2 className="text-xl font-semibold">{t('order.items', 'Order Items')}</h2>
            </div>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product_url_key}`}
                      className="font-medium text-gray-800 hover:text-[#0272BA]"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">SKU: {item.product_sku}</p>
                    {item.selected_options && item.selected_options.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {item.selected_options.map((opt: any, idx: number) => (
                          <span key={idx}>
                            {opt.label}: {opt.value}
                            {idx < item.selected_options.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-4 text-sm text-gray-600 mt-2">
                      <span>{t('order.qty', 'Qty')}: {item.quantity_ordered}</span>
                      {item.quantity_shipped > 0 && (
                        <span className="text-green-600">
                          {t('order.shipped', 'Shipped')}: {item.quantity_shipped}
                        </span>
                      )}
                      {item.quantity_canceled > 0 && (
                        <span className="text-red-600">
                          {t('order.canceled', 'Canceled')}: {item.quantity_canceled}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {formatPrice(item.product_sale_price.value, item.product_sale_price.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">{t('order.summary', 'Order Summary')}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order.subtotal', 'Subtotal')}</span>
                <span className="font-medium">
                  {formatPrice(order.total.subtotal.value, order.total.subtotal.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order.shipping', 'Shipping')}</span>
                <span className="font-medium">
                  {formatPrice(order.total.total_shipping.value, order.total.total_shipping.currency)}
                </span>
              </div>
              {order.total.total_tax.value > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('order.tax', 'Tax')}</span>
                  <span className="font-medium">
                    {formatPrice(order.total.total_tax.value, order.total.total_tax.currency)}
                  </span>
                </div>
              )}
              {order.total.discounts && order.total.discounts.length > 0 && (
                <>
                  {order.total.discounts.map((discount: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-red-600">
                      <span>{discount.label}</span>
                      <span>-{formatPrice(discount.amount.value, discount.amount.currency)}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="flex justify-between pt-2 border-t text-lg font-bold">
                <span>{t('order.total', 'Total')}</span>
                <span className="text-[#006341]">
                  {formatPrice(order.total.grand_total.value, order.total.grand_total.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-[#006341]" />
                <h2 className="text-lg font-semibold">{t('order.shippingAddress', 'Shipping Address')}</h2>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">
                  {order.shipping_address.firstname} {order.shipping_address.lastname}
                </p>
                <p>{order.shipping_address.street.join(', ')}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.region}
                </p>
                <p>{order.shipping_address.postcode}</p>
                <p>{order.shipping_address.telephone}</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {order.payment_methods && order.payment_methods.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-[#006341]" />
                <h2 className="text-lg font-semibold">{t('order.paymentMethod', 'Payment Method')}</h2>
              </div>
              <p className="text-sm text-gray-700">{order.payment_methods[0].name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
