import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { GET_FLASHSALE_PRODUCTS } from '@/queries/catalog';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GRAPHQL_ENDPOINT = 'https://online.mmvietnam.com/graphql';

interface FlashsaleProductsProps {
  pageSize?: number;
  url?: string;
  title?: string;
}

interface CountdownTimerProps {
  endTime: string;
}

const CountdownTimer = ({ endTime }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    const targetDate = new Date(endTime).getTime();

    if (isNaN(targetDate) || targetDate <= Date.now()) {
      setTimeRemaining({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeRemaining({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeRemaining({
          days: days.toString().padStart(2, '0'),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1 text-white font-bold">
      {timeRemaining.days !== '00' && (
        <>
          <span className="bg-red-600 px-2 py-1 rounded">{timeRemaining.days}</span>
          <span>:</span>
        </>
      )}
      <span className="bg-red-600 px-2 py-1 rounded">{timeRemaining.hours}</span>
      <span>:</span>
      <span className="bg-red-600 px-2 py-1 rounded">{timeRemaining.minutes}</span>
      <span>:</span>
      <span className="bg-red-600 px-2 py-1 rounded">{timeRemaining.seconds}</span>
    </div>
  );
};

export default function FlashsaleProducts({
  pageSize = 12,
  url = '/flashsale',
  title
}: FlashsaleProductsProps) {
  const { t } = useTranslation();
  const { isLoading: loading, error, data } = useQuery({
    queryKey: ['flashsale', pageSize],
    queryFn: () => request(GRAPHQL_ENDPOINT, GET_FLASHSALE_PRODUCTS, { pageSize }),
    staleTime: 0,
  });

  const items = !error && data?.getFlashSaleProducts?.items ? data.getFlashSaleProducts.items : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-orange-500 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">
              {title || t('flashsaleProduct.title', 'Flash sale')}
            </h2>
            {data?.getFlashSaleProducts?.end_time && (
              <CountdownTimer endTime={data.getFlashSaleProducts.end_time} />
            )}
          </div>
          <div>
            {url.startsWith('https://') || url.startsWith('http://') ? (
              <a
                href={url}
                className="text-white hover:underline font-semibold"
              >
                {t('global.viewAll', 'View all')}
              </a>
            ) : (
              <Link
                to={url}
                className="text-white hover:underline font-semibold"
              >
                {t('global.viewAll', 'View all')}
              </Link>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="h-96 bg-white/20 rounded-lg animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {items.map((product: any) => (
              <Link
                key={product.uid}
                to={`/${product.url_key}${product.url_suffix || '.html'}`}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Product Image */}
                <div className="relative aspect-square">
                  <img
                    src={product.small_image?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Discount Badge */}
                  {product.price_range?.maximum_price?.discount?.amount_off > 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                      -{Math.round(product.price_range.maximum_price.discount.amount_off)}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px]">
                    {product.ecom_name || product.name}
                  </h3>

                  {/* Unit */}
                  {product.unit_ecom && (
                    <p className="text-xs text-gray-500 mb-2">{product.unit_ecom}</p>
                  )}

                  {/* Price */}
                  <div className="flex flex-col gap-1">
                    {product.price_range?.maximum_price?.discount?.amount_off > 0 ? (
                      <>
                        <span className="text-lg font-bold text-red-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: product.price_range.maximum_price.final_price.currency
                          }).format(product.price_range.maximum_price.final_price.value)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: product.price_range.maximum_price.regular_price.currency
                          }).format(product.price_range.maximum_price.regular_price.value)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: product.price?.regularPrice?.amount?.currency || 'VND'
                        }).format(product.price?.regularPrice?.amount?.value || 0)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  {product.stock_status === 'OUT_OF_STOCK' && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">
                      {t('product.outOfStock', 'Out of stock')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
