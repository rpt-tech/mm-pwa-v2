import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { GET_PAYMENT_METHODS, SET_PAYMENT_METHOD } from '@/queries/checkout';
import { useTranslation } from 'react-i18next';

interface PaymentMethod {
  code: string;
  title: string;
  note?: string;
  available?: boolean;
}

interface PaymentMethodsProps {
  cartId: string;
  onPaymentSelected?: (code: string) => void;
}

export default function PaymentMethods({ cartId, onPaymentSelected }: PaymentMethodsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Fetch available payment methods
  const { data, isLoading } = useQuery({
    queryKey: ['paymentMethods', cartId],
    queryFn: async () => {
      const result: any = await gqlClient.request(GET_PAYMENT_METHODS, { cartId });
      return result.cart;
    },
    enabled: !!cartId,
  });

  // Set payment method mutation
  const setPaymentMutation = useMutation({
    mutationFn: (code: string) => {
      return gqlClient.request(SET_PAYMENT_METHOD, {
        cartId,
        paymentMethod: { code },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', cartId] });
      queryClient.invalidateQueries({ queryKey: ['cartDetails', cartId] });
    },
  });

  const handleMethodChange = (code: string) => {
    setSelectedMethod(code);
    setPaymentMutation.mutate(code);
    onPaymentSelected?.(code);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const availableMethods: PaymentMethod[] = data?.available_payment_methods || [];
  const currentSelected = selectedMethod || data?.selected_payment_method?.code || '';

  if (!availableMethods.length) {
    return (
      <div className="text-red-600 text-sm space-y-2">
        <p>{t('checkout.paymentLoadingError', 'There was an error loading payments.')}</p>
        <p>{t('checkout.refreshOrTryAgainLater', 'Please refresh or try again later.')}</p>
      </div>
    );
  }

  // Payment method icons/images
  const getPaymentIcon = (code: string) => {
    switch (code) {
      case 'cashondelivery':
        return '💵';
      case 'momo_wallet':
        return '🟣';
      case 'vnpay':
        return '🔵';
      case 'zalopay':
        return '🔷';
      default:
        return '💳';
    }
  };

  return (
    <div className="space-y-3">
      {availableMethods.map((method) => {
        const isSelected = currentSelected === method.code;
        const isAvailable = method.available !== false;

        return (
          <label
            key={method.code}
            className={`
              block border-2 rounded-lg p-4 cursor-pointer transition-all
              ${isSelected ? 'border-[#006341] bg-green-50' : 'border-gray-300 hover:border-gray-400'}
              ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payment_method"
                value={method.code}
                checked={isSelected}
                onChange={() => handleMethodChange(method.code)}
                disabled={!isAvailable}
                className="mt-1 w-4 h-4 text-[#006341] focus:ring-[#006341]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPaymentIcon(method.code)}</span>
                  <span className="font-medium text-gray-900">{method.title}</span>
                </div>
                {method.note && (
                  <p className="text-sm text-gray-600 mt-2">{method.note}</p>
                )}
                {!isAvailable && (
                  <p className="text-sm text-red-600 mt-2">
                    {t('checkout.paymentNotAvailable', 'This payment method is currently unavailable')}
                  </p>
                )}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
