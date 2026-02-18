import { Link } from 'react-router-dom';
import DnrLabel from '@/components/product/DnrLabel';

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
    minimum_price?: {
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
        percent_off: number;
      };
    };
    maximum_price?: {
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
  product_label?: {
    label_id: string;
    name: string;
    image: string;
  };
  dnr_price?: any;
}

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard component
 * Reusable product card for grids and carousels
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const priceData = product.price_range.minimum_price || product.price_range.maximum_price;

  if (!priceData) {
    return null;
  }

  const finalPrice = priceData.final_price.value;
  const regularPrice = priceData.regular_price.value;
  const hasDiscount = finalPrice < regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
    : 0;

  return (
    <Link
      to={`/${product.url_key}`}
      className="block border rounded-lg p-3 hover:shadow-lg transition-shadow bg-white"
    >
      {/* Product Image */}
      <div className="relative mb-3">
        <img
          src={product.small_image?.url || '/placeholder.png'}
          alt={product.name}
          className="w-full h-48 object-contain"
          loading="lazy"
        />
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}
        {product.product_label && (
          <div className="absolute top-2 left-2">
            {product.product_label.image ? (
              <img
                src={product.product_label.image}
                alt={product.product_label.name}
                className="h-8"
              />
            ) : (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {product.product_label.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <h3 className="font-medium text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.ecom_name || product.name}
        </h3>

        {product.unit_ecom && (
          <p className="text-xs text-gray-600 mb-2">{product.unit_ecom}</p>
        )}

        {/* DNR Label */}
        {product.dnr_price && (
          <div className="mb-2">
            <DnrLabel dnrData={product.dnr_price} />
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-red-600">
            {finalPrice.toLocaleString('vi-VN')}₫
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through">
              {regularPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock_status === 'OUT_OF_STOCK' && (
          <span className="text-xs text-red-600 font-medium">Hết hàng</span>
        )}

        {/* Rating */}
        {product.rating_summary && product.rating_summary > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-yellow-500">★</span>
            <span>{(product.rating_summary / 20).toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
