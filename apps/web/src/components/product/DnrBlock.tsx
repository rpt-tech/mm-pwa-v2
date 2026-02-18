import { useTranslation } from 'react-i18next';

interface DnrPrice {
  qty?: number;
  promo_label?: string;
  promo_type?: string;
  promo_amount?: number;
  promo_value?: number;
  event_id?: string;
  event_name?: string;
}

interface DnrBlockProps {
  dnrData?: DnrPrice[];
  currencyCode?: string;
}

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export default function DnrBlock({ dnrData, currencyCode = 'VND' }: DnrBlockProps) {
  const { t } = useTranslation();

  // Source has dnrHide = true, meaning this component is currently disabled
  // Keeping the implementation for future use
  const dnrHide = true;
  if (dnrHide || !dnrData || dnrData.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <strong className="text-red-800 font-semibold block mb-2">
        {t('dnrBlock.title', 'Discount')}
      </strong>
      <div className="space-y-2">
        {dnrData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <strong className="text-red-600 font-bold">
              {formatPrice(item.promo_value || 0, currencyCode)}
            </strong>
            <span className="text-gray-700">{item.promo_label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
