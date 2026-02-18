import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { GET_PAYMENT_METHODS, SET_PAYMENT_METHOD_ON_CART } from '@/queries/checkout';

interface PaymentMethod {
  code: string;
  title: string;
  note?: string;
  available?: boolean;
}

interface PaymentMethodsProps {
  cartId: string;
  onPaymentMethodChange?: (code: string) => void;
}

export default function PaymentMethods({ cartId, onPaymentMethodChange }: PaymentMethodsProps) {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Fetch available payment methods
  const { data, isLoading } = useQuery({
    queryKey: ['paymentMethods', cartId],
    queryFn: async () => {
      const result = await gqlClient.request(GET_PAYMENT_METHODS, { cartId });
      return result.cart;
    },
    enabled: !!cartId,
  });

  // Set payment method mutation
  const setPaymentMethodMutation = useMutation({
    mutationFn: async (code: string) => {
      return await gqlClient.request(SET_PAYMENT_METHOD_ON_CART, {
        cartId,
        paymentMethod: { code },
      });
    },
    onSuccess: (_, code) => {
      setSelectedMethod(code);
      onPaymentMethodChange?.(code);
    },
  });

  const availablePaymentMethods = data?.available_payment_methods || [];
  const currentSelected = data?.selected_payment_method?.code || selectedMethod;

  const handleMethodChange = (code: string) => {
    setPaymentMethodMutation.mutate(code);
  };

  // Payment method images mapping
  const getPaymentImage = (code: string) => {
    const images: Record<string, string> = {
      cashondelivery: '/images/payment/cod.svg',
      momo_wallet: '/images/payment/momo.svg',
      vnpay: '/images/payment/vnpay.svg',
      zalopay: '/images/payment/zalopay.svg',
    };
    return images[code] || '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#006341]"></div>
      </div>
    );
  }

  if (!availablePaymentMethods.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
        <p>{t('checkout.paymentLoadingError', 'There was an error loading payments.')}</p>
        <p>{t('checkout.refreshOrTryAgainLater', 'Please refresh or try again later.')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availablePaymentMethods.map((method: PaymentMethod) => {
        const isSelected = currentSelected === method.code;
        const isDisabled = method.available === false;
        const imageUrl = getPaymentImage(method.code);

        return (
          <div key={method.code} className="border border-gray-200 rounded-lg overflow-hidden">
            <label
              className={`flex items-center p-4 cursor-pointer transition-colors ${
                isSelected ? 'bg-green-50 border-[#006341]' : 'hover:bg-gray-50'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="payment_method"
                value={method.code}
                checked={isSelected}
                onChange={() => !isDisabled && handleMethodChange(method.code)}
                disabled={isDisabled || setPaymentMethodMutation.isPending}
                className="w-4 h-4 text-[#006341] border-gray-300 focus:ring-[#006341]"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={method.title}
                  className="ml-3 h-8 w-auto object-contain"
                />
              )}
              <span className="ml-3 text-sm font-medium text-gray-900">{method.title}</span>
            </label>
            {isSelected && method.note && (
              <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50">
                {method.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
