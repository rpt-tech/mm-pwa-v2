import { Link } from 'react-router-dom';
import DnrLabel from '@/components/product/DnrLabel';
import WishlistButton from '@/components/product/WishlistButton';

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
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-[#0272BA]/30 transition-all"
    >
      {/* Product Image */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        <img
          src={product.small_image?.url || '/placeholder.png'}
          alt={product.ecom_name || product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-[#E82230] text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </div>
        )}
        {product.product_label && (
          <div className="absolute top-2 right-2">
            {product.product_label.image ? (
              <img src={product.product_label.image} alt={product.product_label.name} className="h-8" />
            ) : (
              <span className="bg-[#0272BA] text-white text-xs px-1.5 py-0.5 rounded">
                {product.product_label.name}
              </span>
            )}
          </div>
        )}
        {product.stock_status === 'OUT_OF_STOCK' && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded">Hết hàng</span>
          </div>
        )}
        {/* Wishlist Button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton productSku={product.sku} size="sm" />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem] leading-tight">
          {product.ecom_name || product.name}
        </h3>

        {product.unit_ecom && (
          <p className="text-xs text-gray-500 mb-1">{product.unit_ecom}</p>
        )}

        {/* DNR Label */}
        {product.dnr_price && (
          <div className="mb-1.5">
            <DnrLabel dnrData={product.dnr_price} />
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-bold text-[#E82230]">
            {finalPrice.toLocaleString('vi-VN')}₫
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {regularPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating_summary && product.rating_summary > 0 && (
          <div className="flex items-center gap-0.5 mt-1 text-xs text-gray-500">
            <span className="text-yellow-400">★</span>
            <span>{(product.rating_summary / 20).toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
