import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { gqlClient } from '@/lib/graphql-client';
import { GET_RELATED_UPSELL_PRODUCTS } from '@/queries/product';

interface RelatedUpsellProductsProps {
  urlKey: string;
}

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export default function RelatedUpsellProducts({ urlKey }: RelatedUpsellProductsProps) {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['relatedUpsellProducts', urlKey],
    queryFn: () => gqlClient.request(GET_RELATED_UPSELL_PRODUCTS, { urlKey }),
    enabled: !!urlKey,
  });

  const product = data?.products?.items?.[0];
  const relatedProducts = product?.related_products || [];
  const upsellProducts = product?.upsell_products || [];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0 && upsellProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {t('product.relatedProducts', 'Related Products')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {relatedProducts.map((item: any) => {
              const finalPrice = item.price_range?.maximum_price?.final_price?.value || 0;
              const regularPrice = item.price_range?.maximum_price?.regular_price?.value || 0;
              const hasDiscount = finalPrice < regularPrice;
              const discountPercent = hasDiscount
                ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
                : 0;

              return (
                <Link
                  key={item.uid}
                  to={`/product/${item.url_key}`}
                  className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border"
                >
                  <div className="relative aspect-square">
                    <img
                      src={item.small_image?.url || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discountPercent}%
                      </div>
                    )}
                    {item.stock_status === 'OUT_OF_STOCK' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {t('product.outOfStock', 'Out of Stock')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[2.5rem]">
                      {item.ecom_name || item.name}
                    </h3>
                    {item.unit_ecom && (
                      <p className="text-xs text-gray-500 mb-2">{item.unit_ecom}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-red-600">
                        {formatPrice(finalPrice, item.price_range?.maximum_price?.final_price?.currency)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(regularPrice, item.price_range?.maximum_price?.regular_price?.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Upsell Products */}
      {upsellProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {t('product.upsellProducts', 'You May Also Like')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {upsellProducts.map((item: any) => {
              const finalPrice = item.price_range?.maximum_price?.final_price?.value || 0;
              const regularPrice = item.price_range?.maximum_price?.regular_price?.value || 0;
              const hasDiscount = finalPrice < regularPrice;
              const discountPercent = hasDiscount
                ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
                : 0;

              return (
                <Link
                  key={item.uid}
                  to={`/product/${item.url_key}`}
                  className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow border"
                >
                  <div className="relative aspect-square">
                    <img
                      src={item.small_image?.url || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                    {hasDiscount && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discountPercent}%
                      </div>
                    )}
                    {item.stock_status === 'OUT_OF_STOCK' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {t('product.outOfStock', 'Out of Stock')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[2.5rem]">
                      {item.ecom_name || item.name}
                    </h3>
                    {item.unit_ecom && (
                      <p className="text-xs text-gray-500 mb-2">{item.unit_ecom}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-red-600">
                        {formatPrice(finalPrice, item.price_range?.maximum_price?.final_price?.currency)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(regularPrice, item.price_range?.maximum_price?.regular_price?.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
