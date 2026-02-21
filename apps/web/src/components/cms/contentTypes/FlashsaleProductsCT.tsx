import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import ProductCard from '@/components/catalog/ProductCard';

interface FlashsaleProductsProps {
  pageSize?: number;
  url?: string;
  title?: string;
  textAlign?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  cssClasses?: string[];
}

const GET_FLASHSALE_PRODUCTS = `
  query getFlashSaleProducts($pageSize: Int!) {
    getFlashSaleProducts(pageSize: $pageSize) {
      end_time
      items {
        uid
        sku
        name
        url_key
        small_image {
          url
          label
        }
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
        stock_status
        rating_summary
        review_count
        ecom_name
        unit_ecom
        mm_product_type
        is_alcohol
        allow_pickup
        product_label {
          label_id
          name
          image
        }
      }
      total_count
    }
  }
`;

/**
 * FlashsaleProducts ContentType component
 * Displays flash sale products with countdown timer
 */
export const FlashsaleProductsCT: React.FC<FlashsaleProductsProps> = ({
  pageSize = 10,
  url = '/flash-sale',
  title,
  textAlign,
  border,
  borderColor,
  borderWidth,
  borderRadius,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  cssClasses = []
}) => {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['flashsaleProducts', pageSize],
    queryFn: async () => {
      return gqlClient.request(GET_FLASHSALE_PRODUCTS, { pageSize });
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000 // Refetch every minute
  });

  const items = data?.getFlashSaleProducts?.items || [];
  const endTime = data?.getFlashSaleProducts?.end_time;

  // Countdown timer effect
  useEffect(() => {
    if (!endTime) return;

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

  const dynamicStyles: React.CSSProperties = {
    textAlign: textAlign as any,
    border,
    borderColor,
    borderWidth,
    borderRadius,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft
  };

  if (items.length === 0) {
    return null;
  }

  const sliderSettings = {
    slidesToShow: Math.min(items.length, 6),
    slidesToScroll: Math.min(items.length, 6),
    autoplay: false,
    arrows: true,
    dots: false,
    infinite: items.length > 6,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1479,
        settings: {
          slidesToShow: Math.min(items.length, 5),
          slidesToScroll: Math.min(items.length, 5)
        }
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: Math.min(items.length, 4),
          slidesToScroll: Math.min(items.length, 4)
        }
      },
      {
        breakpoint: 959,
        settings: {
          slidesToShow: Math.min(items.length, 3),
          slidesToScroll: Math.min(items.length, 3)
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: Math.min(items.length, 2),
          slidesToScroll: Math.min(items.length, 2)
        }
      }
    ]
  };

  return (
    <div
      className={`flashsale-products-wrapper ${cssClasses.join(' ')}`}
      style={dynamicStyles}
    >
      {/* Header with title and countdown */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-4">
          <span>{title || t('flashsaleProduct.title', 'Flash Sale')}</span>
          {endTime && (
            <div className="flex items-center gap-1 text-lg font-mono bg-red-600 text-white px-3 py-1 rounded">
              {timeRemaining.days !== '00' && (
                <>
                  <span>{timeRemaining.days}</span>
                  <span>:</span>
                </>
              )}
              <span>{timeRemaining.hours}</span>
              <span>:</span>
              <span>{timeRemaining.minutes}</span>
              <span>:</span>
              <span>{timeRemaining.seconds}</span>
            </div>
          )}
        </h2>
        <Link
          to={url}
          className="text-[#0272BA] hover:text-[#005a9e] font-medium"
        >
          {t('global.viewAll', 'View all')} →
        </Link>
      </div>

      {/* Products carousel */}
      <div className="flashsale-products">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <Slider {...sliderSettings}>
            {items.map((item: any) => (
              <div key={item.uid} className="px-2">
                <ProductCard product={item} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default FlashsaleProductsCT;
