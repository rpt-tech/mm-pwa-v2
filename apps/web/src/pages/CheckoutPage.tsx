import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight, CheckCircle, AlertCircle, Package, CreditCard, MapPin } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { gqlClient } from '@/lib/graphql-client';
import VietnamLocationCascade from '@/components/checkout/VietnamLocationCascade';
import AlcoholCheckoutDialog from '@/components/product/AlcoholCheckoutDialog';
import {
  GET_CUSTOMER_ADDRESSES,
  SET_GUEST_EMAIL,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
  SET_PAYMENT_METHOD,
  PLACE_ORDER,
  GET_CHECKOUT_DETAILS,
} from '@/queries/checkout';

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

// Validation schema
const addressSchema = z.object({
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  firstname: z.string().min(1, 'Họ không được để trống'),
  lastname: z.string().min(1, 'Tên không được để trống'),
  telephone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  street: z.string().min(5, 'Địa chỉ không được để trống'),
  city_code: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  city_name: z.string().optional(),
  district_code: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  district_name: z.string().optional(),
  ward_code: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  ward_name: z.string().optional(),
  country_code: z.string().default('VN'),
  postcode: z.string().default('700000'),
});

type AddressFormData = z.infer<typeof addressSchema>;

const CHECKOUT_STEP = {
  SHIPPING: 1,
  PAYMENT: 2,
} as const;

type CheckoutStepType = typeof CHECKOUT_STEP[keyof typeof CHECKOUT_STEP];

// Progress indicator
function CheckoutProgress({ step }: { step: CheckoutStepType }) {
  const steps = [
    { id: CHECKOUT_STEP.SHIPPING, label: 'Địa chỉ giao hàng', icon: MapPin },
    { id: CHECKOUT_STEP.PAYMENT, label: 'Thanh toán', icon: CreditCard },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, idx) => (
        <div key={s.id} className="flex items-center">
          <div className={`flex items-center gap-2 ${step >= s.id ? 'text-[#006341]' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2
              ${step > s.id ? 'bg-[#006341] border-[#006341] text-white' :
                step === s.id ? 'border-[#006341] text-[#006341]' :
                'border-gray-300 text-gray-400'}`}
            >
              {step > s.id ? <CheckCircle size={16} /> : <s.icon size={16} />}
            </div>
            <span className="text-sm font-medium hidden sm:block">{s.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > s.id ? 'bg-[#006341]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Order summary sidebar
function OrderSummary({ cart, isCompact = false }: { cart: any; isCompact?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(!isCompact);
  const items = cart?.items || [];
  const prices = cart?.prices;
  const subtotal = prices?.subtotal_excluding_tax?.value ?? 0;
  const grandTotal = prices?.grand_total?.value ?? 0;
  const currency = prices?.grand_total?.currency ?? 'VND';
  const discounts = prices?.discounts || [];
  const shippingAddress = cart?.shipping_addresses?.[0];
  const shippingMethod = shippingAddress?.selected_shipping_method;
  const shippingCost = shippingMethod?.amount?.value ?? 0;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3"
      >
        <div className="flex items-center gap-2">
          <Package size={18} className="text-[#006341]" />
          <span className="font-semibold text-gray-800">
            Tóm tắt đơn hàng ({items.length} sản phẩm)
          </span>
        </div>
        <ChevronRight
          size={16}
          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="space-y-2 mb-4">
          {items.map((item: any) => {
            const product = item.product;
            const displayName = product.ecom_name || product.name;
            const rowTotal = item.prices?.row_total?.value ?? 0;
            const itemCurrency = item.prices?.row_total?.currency ?? 'VND';

            return (
              <div key={item.uid} className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={product.thumbnail?.url || '/placeholder.jpg'}
                    alt={displayName}
                    className="w-12 h-12 object-contain bg-white rounded border"
                    loading="lazy"
                  />
                  <span className="absolute -top-1 -right-1 bg-[#006341] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2">{displayName}</p>
                </div>
                <span className="text-xs font-medium flex-shrink-0">
                  {formatPrice(rowTotal, itemCurrency)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-1 text-sm border-t pt-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span>{formatPrice(subtotal, currency)}</span>
        </div>

        {discounts.map((d: any, i: number) => (
          <div key={i} className="flex justify-between text-green-600">
            <span>Giảm giá ({d.label}):</span>
            <span>-{formatPrice(d.amount?.value ?? 0, currency)}</span>
          </div>
        ))}

        {shippingMethod && (
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển ({shippingMethod.method_title}):</span>
            <span>{shippingCost === 0 ? 'Miễn phí' : formatPrice(shippingCost, currency)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Tổng cộng:</span>
          <span className="text-[#006341]">{formatPrice(grandTotal, currency)}</span>
        </div>
      </div>
    </div>
  );
}

// Shipping address form
function ShippingStep({
  cartId,
  isLoggedIn,
  onNext,
}: {
  cartId: string;
  isLoggedIn: boolean;
  onNext: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country_code: 'VN', postcode: '700000' },
  });

  // Fetch customer addresses if logged in
  const { data: customerData } = useQuery({
    queryKey: ['customerAddresses'],
    queryFn: () => gqlClient.request(GET_CUSTOMER_ADDRESSES),
    enabled: isLoggedIn,
  });

  const addresses = customerData?.customer?.addresses || [];

  // Auto-select default shipping address
  useEffect(() => {
    const defaultAddr = addresses.find((a: any) => a.default_shipping);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
      setValue('firstname', defaultAddr.firstname);
      setValue('lastname', defaultAddr.lastname);
      setValue('telephone', defaultAddr.telephone);
      setValue('street', defaultAddr.street?.join(', ') || '');
      setValue('city_code', defaultAddr.city_code || '');
      setValue('ward_code', defaultAddr.ward_code || '');
    }
  }, [addresses, setValue]);

  const setGuestEmailMutation = useMutation({
    mutationFn: (email: string) =>
      gqlClient.request(SET_GUEST_EMAIL, { cartId, email }),
  });

  const setShippingAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) => {
      const input: any = {
        firstname: data.firstname,
        lastname: data.lastname,
        street: [data.street],
        city: data.city_code, // city field receives city_code value
        country_code: data.country_code || 'VN',
        postcode: data.postcode || '700000',
        telephone: data.telephone,
        save_in_address_book: false,
        city_code: data.city_code,
        district_code: data.district_code,
        ward_code: data.ward_code,
      };

      return gqlClient.request(SET_SHIPPING_ADDRESS, {
        cartId,
        shippingAddresses: [
          selectedAddressId
            ? { customer_address_id: selectedAddressId }
            : { address: input },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      // Auto-select first available shipping method
      const cart = queryClient.getQueryData<any>(['cartDetails', cartId]);
      const shippingAddr = cart?.cart?.shipping_addresses?.[0];
      const firstMethod = shippingAddr?.available_shipping_methods?.[0];
      if (firstMethod) {
        gqlClient.request(SET_SHIPPING_METHOD, {
          cartId,
          shippingMethods: [{
            carrier_code: firstMethod.carrier_code,
            method_code: firstMethod.method_code,
          }],
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
          onNext();
        });
      } else {
        onNext();
      }
    },
  });

  const onSubmit = async (data: AddressFormData) => {
    if (!isLoggedIn && data.email) {
      await setGuestEmailMutation.mutateAsync(data.email);
    }
    setShippingAddressMutation.mutate(data);
  };

  const isLoading = setShippingAddressMutation.isPending || setGuestEmailMutation.isPending;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={20} className="text-[#006341]" />
        Địa chỉ giao hàng
      </h2>

      {/* Saved addresses for logged-in users */}
      {isLoggedIn && addresses.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-3">Địa chỉ đã lưu:</p>
          <div className="space-y-2">
            {addresses.map((addr: any) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedAddressId === addr.id
                    ? 'border-[#006341] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === addr.id}
                  onChange={() => {
                    setSelectedAddressId(addr.id);
                    setValue('firstname', addr.firstname);
                    setValue('lastname', addr.lastname);
                    setValue('telephone', addr.telephone);
                    setValue('street', addr.street?.join(', ') || '');
                    setValue('city_code', addr.city_code || '');
                    setValue('ward_code', addr.ward_code || '');
                  }}
                  className="mt-0.5 accent-[#006341]"
                />
                <div className="text-sm">
                  <p className="font-medium">{addr.firstname} {addr.lastname}</p>
                  <p className="text-gray-600">{addr.street?.join(', ')}</p>
                  <p className="text-gray-600">{addr.city}, {addr.region?.region}</p>
                  <p className="text-gray-600">{addr.telephone}</p>
                  {addr.default_shipping && (
                    <span className="text-xs text-[#006341] font-medium">Mặc định</span>
                  )}
                </div>
              </label>
            ))}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                ${selectedAddressId === null
                  ? 'border-[#006341] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <input
                type="radio"
                name="address"
                checked={selectedAddressId === null}
                onChange={() => setSelectedAddressId(null)}
                className="accent-[#006341]"
              />
              <span className="text-sm">+ Địa chỉ giao hàng mới</span>
            </label>
          </div>
        </div>
      )}

      {/* Address form - show when no saved address selected or guest */}
      {(selectedAddressId === null || !isLoggedIn) && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isLoggedIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                {...register('email')}
                type="email"
                placeholder="email@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ *</label>
              <input
                {...register('firstname')}
                placeholder="Nguyễn"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
              />
              {errors.firstname && <p className="mt-1 text-xs text-red-500">{errors.firstname.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
              <input
                {...register('lastname')}
                placeholder="Văn A"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
              />
              {errors.lastname && <p className="mt-1 text-xs text-red-500">{errors.lastname.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
            <input
              {...register('telephone')}
              type="tel"
              placeholder="0901234567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
            />
            {errors.telephone && <p className="mt-1 text-xs text-red-500">{errors.telephone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
            <input
              {...register('street')}
              placeholder="Số nhà, tên đường"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
            />
            {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street.message}</p>}
          </div>

          {/* Vietnam Location Cascade */}
          <VietnamLocationCascade
            cityCode={watch('city_code')}
            wardCode={watch('ward_code')}
            onCityChange={(cityCode, cityName) => {
              setValue('city_code', cityCode);
              setValue('city_name', cityName);
              setValue('district_code', '');
              setValue('district_name', '');
              setValue('ward_code', '');
              setValue('ward_name', '');
            }}
            onDistrictChange={(districtCode, districtName) => {
              setValue('district_code', districtCode);
              setValue('district_name', districtName);
              setValue('ward_code', '');
              setValue('ward_name', '');
            }}
            onWardChange={(wardCode, wardName) => {
              setValue('ward_code', wardCode);
              setValue('ward_name', wardName);
            }}
            errors={{
              city: errors.city_code?.message,
              ward: errors.ward_code?.message,
            }}
          />

          {setShippingAddressMutation.isError && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle size={16} />
              <span>Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#006341] text-white py-3 rounded-lg font-semibold hover:bg-[#004d32] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                Tiếp tục
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Submit for saved address */}
      {selectedAddressId !== null && isLoggedIn && (
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="w-full bg-[#006341] text-white py-3 rounded-lg font-semibold hover:bg-[#004d32] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              Tiếp tục
              <ChevronRight size={18} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Payment step
function PaymentStep({
  cartId,
  cart,
  onBack,
  onPlaceOrder,
}: {
  cartId: string;
  cart: any;
  onBack: () => void;
  onPlaceOrder: (orderNumber: string) => void;
}) {
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState('');
  const [error, setError] = useState('');

  const methods = cart?.available_payment_methods || [];

  // Set default payment method
  useEffect(() => {
    const defaultMethod = cart?.selected_payment_method?.code;
    if (defaultMethod) {
      setSelectedMethod(defaultMethod);
    } else if (methods.length > 0) {
      setSelectedMethod(methods[0].code);
    }
  }, [cart, methods]);

  const setPaymentMutation = useMutation({
    mutationFn: (code: string) =>
      gqlClient.request(SET_PAYMENT_METHOD, {
        cartId,
        paymentMethod: { code },
      }),
  });

  const placeOrderMutation = useMutation({
    mutationFn: () => gqlClient.request(PLACE_ORDER, { input: { cart_id: cartId } }),
    onSuccess: (data) => {
      const orderV2 = data?.placeOrder?.orderV2;
      const orderNumber = orderV2?.number;
      const payUrl = orderV2?.payment_methods?.[0]?.pay_url;

      if (orderNumber) {
        queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
        queryClient.invalidateQueries({ queryKey: ['miniCart'] });

        // If payment redirect URL exists (Momo, VNPay, ZaloPay), redirect to payment gateway
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          // Otherwise go to confirmation page
          onPlaceOrder(orderNumber);
        }
      }
    },
    onError: (err: any) => {
      setError(err.response?.errors?.[0]?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    },
  });

  const handlePlaceOrder = async () => {
    if (!selectedMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }
    setError('');
    await setPaymentMutation.mutateAsync(selectedMethod);
    placeOrderMutation.mutate();
  };

  const PAYMENT_METHOD_LABELS: Record<string, { label: string; desc: string }> = {
    cashondelivery: { label: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận hàng' },
    free: { label: 'Miễn phí', desc: 'Không cần thanh toán' },
    vnpay: { label: 'VNPay', desc: 'Thanh toán qua cổng VNPay' },
    momo_wallet: { label: 'Ví MoMo', desc: 'Thanh toán qua ví MoMo' },
    zalopay: { label: 'ZaloPay', desc: 'Thanh toán qua ZaloPay' },
    banktransfer: { label: 'Chuyển khoản ngân hàng', desc: 'Chuyển khoản trước khi giao hàng' },
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard size={20} className="text-[#006341]" />
        Phương thức thanh toán
      </h2>

      <div className="space-y-3 mb-6">
        {methods.map((method: any) => {
          const info = PAYMENT_METHOD_LABELS[method.code] || {
            label: method.title,
            desc: method.note || '',
          };
          const isAvailable = method.available !== false;

          return (
            <label
              key={method.code}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
                ${selectedMethod === method.code
                  ? 'border-[#006341] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.code}
                checked={selectedMethod === method.code}
                onChange={() => setSelectedMethod(method.code)}
                disabled={!isAvailable}
                className="accent-[#006341]"
              />
              <div>
                <p className="text-sm font-medium">{info.label}</p>
                {info.desc && <p className="text-xs text-gray-500">{info.desc}</p>}
                {!isAvailable && (
                  <p className="text-xs text-red-600 mt-1">Phương thức này hiện không khả dụng</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mb-4">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={placeOrderMutation.isPending || setPaymentMutation.isPending}
          className="flex-1 bg-[#006341] text-white py-3 rounded-lg font-semibold hover:bg-[#004d32] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {placeOrderMutation.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            'Đặt hàng'
          )}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartId, reset: resetCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const [step, setStep] = useState<CheckoutStepType>(CHECKOUT_STEP.SHIPPING);
  const [showAlcoholDialog, setShowAlcoholDialog] = useState(false);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['checkoutDetails', cartId],
    queryFn: () => gqlClient.request(GET_CHECKOUT_DETAILS, { cartId }),
    enabled: !!cartId,
    staleTime: 30000,
  });

  const cart = cartData?.cart;

  // Check if cart has alcohol products
  const hasAlcoholProduct = useMemo(() => {
    return cart?.items?.some((item: any) => item?.product?.is_alcohol === true) ?? false;
  }, [cart]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartId) {
      navigate('/cart');
    }
  }, [cartId, navigate]);

  // Show alcohol dialog if cart has alcohol products
  useEffect(() => {
    if (hasAlcoholProduct && !sessionStorage.getItem('alcohol_confirmed')) {
      setShowAlcoholDialog(true);
    }
  }, [hasAlcoholProduct]);

  const handleOrderSuccess = (number: string) => {
    resetCart();
    sessionStorage.removeItem('alcohol_confirmed');
    // Redirect to order confirmation page
    navigate(`/checkout/confirmation?order_number=${number}`);
  };

  const handleAlcoholDialogConfirm = () => {
    setShowAlcoholDialog(false);
    navigate('/cart');
  };

  const handleAlcoholDialogClose = () => {
    setShowAlcoholDialog(false);
    navigate('/cart');
  };

  if (!cartId) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006341]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Checkout header */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-4">
            <a href="/" className="flex items-center gap-2">
              <img
                src="/images/logo.svg"
                alt="MM Mega Market"
                className="h-8"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="font-bold text-[#006341] text-lg">MM Mega Market</span>
            </a>
          </div>
          <CheckoutProgress step={step} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            {step === CHECKOUT_STEP.SHIPPING && (
              <ShippingStep
                cartId={cartId}
                isLoggedIn={isLoggedIn}
                onNext={() => setStep(CHECKOUT_STEP.PAYMENT)}
              />
            )}
            {step === CHECKOUT_STEP.PAYMENT && (
              <PaymentStep
                cartId={cartId}
                cart={cart}
                onBack={() => setStep(CHECKOUT_STEP.SHIPPING)}
                onPlaceOrder={handleOrderSuccess}
              />
            )}
          </div>

          {/* Order summary */}
          {cart && (
            <div className="lg:col-span-1">
              <OrderSummary cart={cart} isCompact={true} />
            </div>
          )}
        </div>
      </div>

      {/* Alcohol checkout dialog */}
      <AlcoholCheckoutDialog
        isOpen={showAlcoholDialog}
        onConfirm={handleAlcoholDialogConfirm}
        onClose={handleAlcoholDialogClose}
      />
    </div>
  );
}
