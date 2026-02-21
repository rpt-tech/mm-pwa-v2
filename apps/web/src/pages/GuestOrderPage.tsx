import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { gql } from '@/lib/gql';
import { gqlClient } from '@/lib/graphql-client';
import { Package, Search, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const GET_GUEST_ORDER = gql`
  query GetGuestOrder($orderNumber: String!, $email: String!) {
    guestOrder(input: { number: $orderNumber, email: $email }) {
      number
      status
      order_date
      total {
        grand_total {
          value
          currency
        }
      }
      items {
        product_name
        product_sku
        quantity_ordered
        product_sale_price {
          value
          currency
        }
      }
      shipping_address {
        firstname
        lastname
        street
        city
        telephone
      }
    }
  }
`;

const trackSchema = z.object({
  orderNumber: z.string().min(1, 'Vui lòng nhập số đơn hàng'),
  email: z.string().email('Email không hợp lệ'),
});

type TrackFormData = z.infer<typeof trackSchema>;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  complete: 'Hoàn thành',
  canceled: 'Đã hủy',
  holded: 'Tạm giữ',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  complete: 'bg-green-100 text-green-800',
  canceled: 'bg-red-100 text-red-800',
  holded: 'bg-gray-100 text-gray-800',
};

export default function GuestOrderPage() {
  const [searchParams, setSearchParams] = useState<TrackFormData | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['guestOrder', searchParams?.orderNumber, searchParams?.email],
    queryFn: () => gqlClient.request(GET_GUEST_ORDER, {
      orderNumber: searchParams!.orderNumber,
      email: searchParams!.email,
    }),
    enabled: !!searchParams,
    retry: false,
  });

  const order = data?.guestOrder;

  const onSubmit = (data: TrackFormData) => {
    setSearchParams(data);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Helmet>
        <title>Tra cứu đơn hàng | MM Mega Market</title>
        <meta name="description" content="Tra cứu trạng thái đơn hàng tại MM Mega Market" />
      </Helmet>

      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tra cứu đơn hàng</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số đơn hàng *
            </label>
            <input
              {...register('orderNumber')}
              placeholder="VD: 000123456"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
            />
            {errors.orderNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.orderNumber.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email đặt hàng *
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="email@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0272BA] text-white py-2.5 rounded-lg font-medium hover:bg-[#005a9e] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={16} />
            {isLoading ? 'Đang tra cứu...' : 'Tra cứu đơn hàng'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searchParams && !isLoading && (
        <>
          {error || !order ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                Không tìm thấy đơn hàng. Vui lòng kiểm tra lại số đơn hàng và email.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package size={24} className="text-[#0272BA]" />
                <div>
                  <h2 className="font-semibold text-gray-800">Đơn hàng #{order.number}</h2>
                  <p className="text-sm text-gray-500">
                    {new Date(order.order_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${
                  STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Sản phẩm</h3>
                  <div className="space-y-2">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.product_name} × {item.quantity_ordered}
                        </span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                            .format(item.product_sale_price.value * item.quantity_ordered)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Tổng cộng:</span>
                <span className="text-[#006341]">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                    .format(order.total.grand_total.value)}
                </span>
              </div>

              {/* Shipping address */}
              {order.shipping_address && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</h3>
                  <p className="text-sm text-gray-600">
                    {order.shipping_address.firstname} {order.shipping_address.lastname}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shipping_address.street?.join(', ')}, {order.shipping_address.city}
                  </p>
                  <p className="text-sm text-gray-600">{order.shipping_address.telephone}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
