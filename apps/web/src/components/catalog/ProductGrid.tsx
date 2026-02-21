import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

interface Product {
  uid: string;
  name: string;
  ecom_name?: string;
  sku: string;
  url_key: string;
  __typename?: string;
  small_image?: { url: string };
  price_range: {
    minimum_price?: {
      final_price: { value: number; currency: string };
      regular_price: { value: number; currency: string };
      discount?: { amount_off: number; percent_off: number };
    };
    maximum_price?: {
      final_price: { value: number; currency: string };
      regular_price: { value: number; currency: string };
      discount?: { amount_off: number };
    };
  };
  stock_status: string;
  rating_summary?: number;
  unit_ecom?: string;
  is_alcohol?: boolean;
  mm_product_type?: string;
  product_label?: { label_id: string; name: string; image: string };
  dnr_price?: any;
}

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading, viewMode }) => {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 animate-pulse">
            <div className="bg-gray-200 h-48 mb-4 rounded" />
            <div className="bg-gray-200 h-4 mb-2 rounded" />
            <div className="bg-gray-200 h-4 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => {
          const priceData = product.price_range.minimum_price || product.price_range.maximum_price;
          if (!priceData) return null;
          const finalPrice = priceData.final_price.value;
          const regularPrice = priceData.regular_price.value;
          const hasDiscount = finalPrice < regularPrice;
          const discountPercent = hasDiscount
            ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
            : 0;

          return (
            <Link
              key={product.uid}
              to={`/product/${product.url_key}`}
              className="flex gap-4 border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={product.small_image?.url || '/placeholder.png'}
                  alt={product.ecom_name || product.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{product.ecom_name || product.name}</h3>
                {product.unit_ecom && (
                  <p className="text-sm text-gray-600 mb-2">{product.unit_ecom}</p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-[#E82230]">
                    {finalPrice.toLocaleString('vi-VN')}₫
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {regularPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-sm text-[#E82230] font-semibold">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                {product.stock_status === 'OUT_OF_STOCK' && (
                  <span className="text-sm text-red-600">Hết hàng</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.uid} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
