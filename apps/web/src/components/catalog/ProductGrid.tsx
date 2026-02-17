import { Link } from 'react-router-dom';

interface Product {
  uid: string;
  name: string;
  ecom_name?: string;
  sku: string;
  url_key: string;
  small_image?: {
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
        amount_off: number;
      };
    };
  };
  stock_status: string;
  rating_summary?: number;
  unit_ecom?: string;
  is_alcohol?: boolean;
  mm_product_type?: string;
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
          const finalPrice = product.price_range.maximum_price.final_price.value;
          const regularPrice = product.price_range.maximum_price.regular_price.value;
          const hasDiscount = finalPrice < regularPrice;
          const discountPercent = hasDiscount
            ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
            : 0;

          return (
            <Link
              key={product.uid}
              to={`/product/${product.url_key}`}
              className="flex gap-4 border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={product.small_image?.url || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{product.ecom_name || product.name}</h3>
                {product.unit_ecom && (
                  <p className="text-sm text-gray-600 mb-2">{product.unit_ecom}</p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-red-600">
                    {finalPrice.toLocaleString('vi-VN')}₫
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {regularPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-sm text-red-600 font-semibold">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                {product.stock_status === 'OUT_OF_STOCK' && (
                  <span className="text-sm text-red-600">Out of stock</span>
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
      {products.map((product) => {
        const finalPrice = product.price_range.maximum_price.final_price.value;
        const regularPrice = product.price_range.maximum_price.regular_price.value;
        const hasDiscount = finalPrice < regularPrice;
        const discountPercent = hasDiscount
          ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
          : 0;

        return (
          <Link
            key={product.uid}
            to={`/product/${product.url_key}`}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="relative mb-4">
              <img
                src={product.small_image?.url || '/placeholder.png'}
                alt={product.name}
                className="w-full h-48 object-contain"
              />
              {hasDiscount && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discountPercent}%
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
              {product.ecom_name || product.name}
            </h3>
            {product.unit_ecom && (
              <p className="text-xs text-gray-600 mb-2">{product.unit_ecom}</p>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-red-600">
                {finalPrice.toLocaleString('vi-VN')}₫
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  {regularPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            {product.stock_status === 'OUT_OF_STOCK' && (
              <span className="text-xs text-red-600 mt-2 block">Out of stock</span>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default ProductGrid;
