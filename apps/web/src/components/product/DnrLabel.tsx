import { AlertCircle } from 'lucide-react';

interface DnrPrice {
  qty?: number;
  promo_label?: string;
  promo_type?: string;
  promo_amount?: number;
  promo_value?: number;
  event_id?: string;
  event_name?: string;
}

interface DnrLabelProps {
  dnrData?: DnrPrice | DnrPrice[];
  tooltipDnr?: Array<{
    buy_quant: number;
    discount_type: 'P' | 'F'; // P = Percentage, F = Fixed amount
    discount_value: number;
  }>;
}

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export default function DnrLabel({ dnrData, tooltipDnr }: DnrLabelProps) {
  // Extract event_name from dnrData (can be single object or array)
  const dnrLabel = Array.isArray(dnrData)
    ? dnrData[0]?.event_name || ''
    : dnrData?.event_name || '';

  if (!dnrLabel) return null;

  return (
    <div className="inline-flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
      <span>{dnrLabel}</span>

      {tooltipDnr && tooltipDnr.length > 0 && (
        <div className="relative group">
          <AlertCircle className="w-3 h-3 cursor-help" />
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {tooltipDnr.map((item, idx) => (
              <span key={idx}>
                ({item.buy_quant}→
                {item.discount_type === 'P'
                  ? `${item.discount_value}%`
                  : formatPrice(item.discount_value)
                })
                {idx < tooltipDnr.length - 1 && ' '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
