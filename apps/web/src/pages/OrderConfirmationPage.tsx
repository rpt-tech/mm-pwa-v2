import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { gql } from 'graphql-request';
import { analytics } from '@/lib/analytics';

// Payment result query
const PAYMENT_RESULT_QUERY = gql`
  query PaymentResult($input: PaymentResultInput) {
    paymentResult(input: $input) {
      order_id
      status
      order_source
      order_source_info
      order {
        id
        number
        grand_total
        payment_methods {
          name
          type
        }
      }
    }
  }
`;

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract order info from URL params
  const orderNumber = searchParams.get('orderId') || searchParams.get('vnp_OrderInfo') || searchParams.get('order_number');
  const apptransid = searchParams.get('apptransid');
  const extractedOrderNumber = orderNumber || (apptransid ? apptransid.split('_')[1] : null);

  // Redirect if no order number
  useEffect(() => {
    if (!extractedOrderNumber || extractedOrderNumber === 'null') {
      navigate('/');
    }
  }, [extractedOrderNumber, navigate]);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch payment result
  const { data, isLoading } = useQuery({
    queryKey: ['paymentResult', extractedOrderNumber, searchParams.toString()],
    queryFn: async () => {
      const responseParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        responseParams[key] = value;
      });

      const result: any = await gqlClient.request(PAYMENT_RESULT_QUERY, {
        input: { response_params: responseParams },
      });
      return result.paymentResult;
    },
    enabled: !!extractedOrderNumber,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006341]"></div>
      </div>
    );
  }

  const orderStatus = data?.status || 'pending';
  const order = data?.order;

  // Track purchase event on success
  useEffect(() => {
    if (orderStatus === 'success' && order && extractedOrderNumber) {
      analytics.purchase({
        id: extractedOrderNumber,
        total: order.grand_total || 0,
        items: (order.items || []).map((item: any) => ({
          sku: item.product_sku || '',
          name: item.product_name || '',
          price: item.product_sale_price?.value || 0,
          quantity: item.quantity_ordered || 1,
        })),
      });
    }
  }, [orderStatus, order, extractedOrderNumber]);

  // Status icon and message
  const getStatusDisplay = () => {
    switch (orderStatus) {
      case 'success':
        return {
          icon: <CheckCircle size={64} className="text-green-500" />,
          title: 'Đặt hàng thành công!',
          message: 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'pending':
        return {
          icon: <Clock size={64} className="text-yellow-500" />,
          title: 'Đơn hàng đang chờ xử lý',
          message: 'Đơn hàng của bạn đang được xác nhận. Vui lòng kiểm tra email để biết thêm chi tiết.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'failed':
      default:
        return {
          icon: <XCircle size={64} className="text-red-500" />,
          title: 'Đặt hàng không thành công',
          message: 'Có lỗi xảy ra trong quá trình xử lý đơn hàng. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Status Card */}
        <div className={`${statusDisplay.bgColor} border-2 ${statusDisplay.borderColor} rounded-lg p-8 text-center mb-6`}>
          <div className="flex justify-center mb-4">{statusDisplay.icon}</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{statusDisplay.title}</h1>
          <p className="text-gray-600 mb-4">{statusDisplay.message}</p>
          {order?.number && (
            <div className="inline-block bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">Mã đơn hàng: </span>
              <span className="font-bold text-[#006341]">#{order.number}</span>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-[#006341]" />
              Thông tin đơn hàng
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">#{order.number}</span>
              </div>

              {order.grand_total && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-bold text-[#006341]">{formatPrice(order.grand_total)}</span>
                </div>
              )}

              {order.payment_methods?.[0] && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-medium">{order.payment_methods[0].name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
          <button
            onClick={() => navigate('/account/orders')}
            className="flex-1 py-3 bg-[#006341] text-white rounded-lg font-medium hover:bg-[#004d32] transition-colors"
          >
            Xem đơn hàng
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút tới.</p>
          <p className="mt-1">
            Nếu có thắc mắc, vui lòng liên hệ{' '}
            <a href="tel:1900636467" className="text-[#006341] hover:underline">
              1900 636 467
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
