import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

interface RecentlyViewedProductsProps {
  currentUid: string;
}

function formatPrice(value: number, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);
}

export default function RecentlyViewedProducts({ currentUid }: RecentlyViewedProductsProps) {
  const all = useRecentlyViewed();
  const items = all.filter((p) => p.uid !== currentUid).slice(0, 5);

  if (items.length < 2) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm đã xem</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const finalPrice = item.price_range?.maximum_price?.final_price?.value || 0;
          const regularPrice = item.price_range?.maximum_price?.regular_price?.value || 0;
          const currency = item.price_range?.maximum_price?.final_price?.currency || 'VND';
          const hasDiscount = finalPrice < regularPrice && regularPrice > 0;

          return (
            <Link
              key={item.uid}
              to={`/product/${item.url_key}`}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square">
                <img
                  src={item.small_image?.url || '/placeholder.png'}
                  alt={item.ecom_name || item.name}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-2 mb-1">{item.ecom_name || item.name}</p>
                {finalPrice > 0 && (
                  <p className="text-sm font-bold text-[#E82230]">{formatPrice(finalPrice, currency)}</p>
                )}
                {hasDiscount && (
                  <p className="text-xs text-gray-400 line-through">
                    {formatPrice(regularPrice, item.price_range?.maximum_price?.regular_price?.currency || currency)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
