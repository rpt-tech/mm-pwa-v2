import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@/lib/graphql-client';
import Slider from 'react-slick';
import ProductCard from '@/components/catalog/ProductCard';

interface ProductsCarouselProps {
  pathNames?: string[];
  appearance?: 'grid' | 'carousel';
  autoplay?: boolean;
  autoplaySpeed?: number;
  infinite?: boolean;
  arrows?: boolean;
  dots?: boolean;
  draggable?: boolean;
  carouselMode?: 'default' | 'continuous';
  centerPadding?: string;
  slidesToShow?: number;
  slidesToShowMedium?: number;
  slidesToShowSmall?: number;
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

const GET_PRODUCTS_BY_URL_KEY = `
  query getProductsByUrlKey($url_keys: [String], $pageSize: Int!) {
    products(filter: { url_key: { in: $url_keys } }, pageSize: $pageSize) {
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
 * ProductsCarousel ContentType component
 * Renders a carousel or grid of products by URL keys
 */
export const ProductsCarousel: React.FC<ProductsCarouselProps> = ({
  pathNames = [],
  appearance = 'carousel',
  autoplay = false,
  autoplaySpeed = 3000,
  infinite = true,
  arrows = true,
  dots = false,
  draggable = false,
  carouselMode = 'default',
  centerPadding = '60px',
  slidesToShow = 6,
  slidesToShowMedium = 4,
  slidesToShowSmall = 2,
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
  // Extract URL keys from pathNames
  const urlKeys = pathNames.map(pathName => {
    const slug = pathName.split('/').pop() || '';
    return slug.replace('.html', ''); // Remove .html suffix if present
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['productsCarousel', urlKeys],
    queryFn: async () => {
      return gqlClient.request(GET_PRODUCTS_BY_URL_KEY, {
        url_keys: urlKeys,
        pageSize: urlKeys.length
      });
    },
    enabled: urlKeys.length > 0,
    staleTime: 5 * 60 * 1000
  });

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

  if (isLoading) {
    return (
      <div className={`products-loading ${cssClasses.join(' ')}`} style={dynamicStyles}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.products?.items || data.products.items.length === 0) {
    return null;
  }

  const items = data.products.items;

  // Restore original sort order
  const sortedItems = urlKeys
    .map(urlKey => items.find((item: any) => item.url_key === urlKey))
    .filter(Boolean);

  if (appearance === 'carousel') {
    const carouselCenterMode = carouselMode === 'continuous' && items.length > slidesToShow;

    const sliderSettings = {
      slidesToShow,
      slidesToScroll: slidesToShow,
      draggable,
      autoplay,
      autoplaySpeed,
      arrows,
      dots,
      infinite: items.length > slidesToShow && infinite,
      centerMode: carouselCenterMode,
      centerPadding: carouselCenterMode ? centerPadding : undefined,
      swipeToSlide: true,
      responsive: [
        {
          breakpoint: 640,
          settings: {
            slidesToShow: slidesToShowSmall,
            slidesToScroll: slidesToShowSmall
          }
        },
        {
          breakpoint: 960,
          settings: {
            slidesToShow: slidesToShowSmall + 1,
            slidesToScroll: slidesToShowSmall + 1
          }
        },
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: slidesToShowMedium,
            slidesToScroll: slidesToShowMedium
          }
        },
        {
          breakpoint: 1480,
          settings: {
            slidesToShow: slidesToShow - 1,
            slidesToScroll: slidesToShow - 1
          }
        }
      ]
    };

    return (
      <div
        className={`products-carousel ${cssClasses.join(' ')}`}
        style={dynamicStyles}
      >
        <Slider {...sliderSettings}>
          {sortedItems.map((item: any) => (
            <div key={item.uid} className="px-2">
              <ProductCard product={item} />
            </div>
          ))}
        </Slider>
      </div>
    );
  }

  // Grid appearance
  return (
    <div
      className={`products-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 ${cssClasses.join(' ')}`}
      style={dynamicStyles}
    >
      {sortedItems.map((item: any) => (
        <ProductCard key={item.uid} product={item} />
      ))}
    </div>
  );
};

export default ProductsCarousel;
