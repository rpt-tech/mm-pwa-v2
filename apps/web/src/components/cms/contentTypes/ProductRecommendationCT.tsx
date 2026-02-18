import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import { useLocation } from 'react-router-dom';
import Slider from 'react-slick';
import ProductCard from '@/components/catalog/ProductCard';
import { useAuthStore } from '@/stores/authStore';

interface ProductRecommendationProps {
  asmJourneyId: string;
  pageSize?: number;
  color?: string;
  image?: string;
  imageMobile?: string;
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

const GET_PRODUCTS_RECOMMENDATION = `
  query getProductRecommendation(
    $asmUid: String,
    $asmJourneyId: String,
    $pageSize: Int!
    $dims: DimsInput,
    $items: ItemsInput
    $extra: ExtraInput,
    $ec: String,
    $ea: String,
  ) {
    productsV2(
      filter: { url_key: { in: "" }},
      asm_uid: $asmUid,
      is_product_recommendation: true,
      asm_journey_id: $asmJourneyId,
      ec: $ec,
      ea: $ea,
      portal_id: "564892373",
      prop_id: "565018647",
      dims: $dims,
      items: $items,
      extra: $extra,
      currentPage: 1,
      pageSize: $pageSize
    ) {
      globalTracking {
        view
        impression
        atmTrackingParameters
      }
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
        tracking_click_url
      }
      total_count
    }
  }
`;

/**
 * ProductRecommendation ContentType component
 * AI-powered product recommendations from Antsomi CDP
 */
export const ProductRecommendationCT: React.FC<ProductRecommendationProps> = ({
  asmJourneyId,
  pageSize = 12,
  color,
  image,
  imageMobile,
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
  const location = useLocation();
  const { pathname } = location;
  const { user, isLoggedIn } = useAuthStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Get phone number from user custom attributes
  const phoneNumber = isLoggedIn && user?.custom_attributes
    ? user.custom_attributes.find((attr: any) => attr.code === 'company_user_phone_number')?.value || null
    : null;

  // Get ASM UID from cookie or localStorage
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const asmUid = getCookie('_asm_uid') || localStorage.getItem('_asm_uid') || '';
  const currentURL = typeof window !== 'undefined' ? window.location.href : '';
  const normalizedPath = pathname.replace(/^\/|\/$/g, '');

  const extra = {
    page_type: pathname === '/' ? 'Home' : normalizedPath,
    page_category: pathname === '/' ? 'Home' : normalizedPath,
    location_url: currentURL,
    cart_subtotal: null,
    cart_item_count: null
  };

  const { data, isLoading } = useQuery({
    queryKey: ['productRecommendation', asmJourneyId, asmUid, phoneNumber],
    queryFn: async () => {
      return gqlClient.request(GET_PRODUCTS_RECOMMENDATION, {
        asmUid,
        asmJourneyId,
        pageSize,
        dims: {
          phone_number: phoneNumber
        },
        extra,
        ec: 'pageview',
        ea: 'view'
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!asmJourneyId
  });

  const items = data?.productsV2?.items || [];

  // Track impression event
  useEffect(() => {
    if (data?.productsV2?.globalTracking?.impression) {
      try {
        if (typeof window !== 'undefined' && (window as any).web_event) {
          (window as any).web_event.trackEventWithUri(data.productsV2.globalTracking.impression);
        }
      } catch (error) {
        console.error('Tracking impression error:', error);
      }
    }
  }, [data]);

  // Track view event when component is visible
  useEffect(() => {
    if (!data?.productsV2?.globalTracking?.view || hasTrackedView) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          try {
            if (typeof window !== 'undefined' && (window as any).web_event) {
              (window as any).web_event.trackEventWithUri(data.productsV2.globalTracking.view);
            }
          } catch (error) {
            console.error('Tracking view error:', error);
          }
          setHasTrackedView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, [data, hasTrackedView]);

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
    paddingLeft,
    backgroundColor: color
  };

  if (items.length === 0) {
    return null;
  }

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const cartLayout = cssClasses.includes('cartLayout');
  const gridLayout = cssClasses.includes('gridLayout');
  const twoColumnsLayout = cssClasses.includes('twoColumnsLayout');

  const sliderSettings = cartLayout ? {
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    dots: false,
    infinite: items.length > 4,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: items.length > 3
        }
      },
      {
        breakpoint: 1023,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: items.length > 2
        }
      }
    ]
  } : twoColumnsLayout ? {
    slidesToShow: 3,
    slidesToScroll: 3,
    arrows: true,
    dots: false,
    infinite: items.length > 3,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1325,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: items.length > 2
        }
      }
    ]
  } : {
    slidesToShow: 6,
    slidesToScroll: 6,
    arrows: true,
    dots: false,
    infinite: items.length > 6,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1479,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
          infinite: items.length > 5
        }
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: items.length > 4
        }
      },
      {
        breakpoint: 959,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: items.length > 3
        }
      }
    ]
  };

  return (
    <div
      ref={wrapperRef}
      className={`product-recommendation-wrapper ${cssClasses.join(' ')}`}
      style={dynamicStyles}
    >
      {/* Banner image */}
      {(image || imageMobile) && (
        <div className="mb-4">
          <img
            src={isMobile && imageMobile ? imageMobile : image}
            alt="Product Recommendation"
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Products */}
      <div className="product-recommendation-carousel">
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
        ) : isMobile || gridLayout ? (
          <div className={`grid ${gridLayout ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2'} gap-4`}>
            {items.map((item: any) => (
              <ProductCard key={item.uid} product={item} />
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

export default ProductRecommendationCT;
