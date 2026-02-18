import { useEffect } from 'react';

interface ProductStructuredDataProps {
  product: {
    name: string;
    sku: string;
    description?: string;
    image?: {
      url: string;
    };
    price_range: {
      maximum_price: {
        final_price: {
          value: number;
          currency: string;
        };
        regular_price: {
          value: number;
          currency: string;
        };
        discount?: {
          percent_off: number;
        };
      };
    };
    stock_status: string;
    rating_summary?: number;
    review_count?: number;
    url_key: string;
  };
}

/**
 * ProductStructuredData component
 * Adds JSON-LD structured data for better SEO
 */
export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  useEffect(() => {
    const price = product.price_range.maximum_price.final_price;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.sku,
      description: product.description?.replace(/<[^>]*>/g, '').substring(0, 200) || product.name,
      image: product.image?.url || '',
      offers: {
        '@type': 'Offer',
        url: `${window.location.origin}/product/${product.url_key}`,
        priceCurrency: price.currency,
        price: price.value,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        availability: product.stock_status === 'IN_STOCK'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    };

    // Add aggregateRating if available
    if (product.rating_summary && product.review_count) {
      (structuredData as any).aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: (product.rating_summary / 20).toFixed(1), // Convert from 0-100 to 0-5
        reviewCount: product.review_count,
      };
    }

    // Create or update script tag
    let script = document.getElementById('product-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'product-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById('product-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [product]);

  return null; // This component doesn't render anything
}
