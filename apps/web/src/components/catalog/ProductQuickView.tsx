import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { gqlClient } from '@/lib/graphql-client';
import { GET_PRODUCT_DETAIL, ADD_PRODUCT_TO_CART } from '@/queries/product';
import { useCartStore } from '@/stores/cartStore';

interface ProductQuickViewProps {
  urlKey: string;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({ urlKey, onClose }) => {
  const { fetchCart, initCart } = useCartStore();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['quickview', urlKey],
    queryFn: () => gqlClient.request(GET_PRODUCT_DETAIL, { urlKey }),
    staleTime: 5 * 60 * 1000,
  });

  const product = (data as any)?.products?.items?.[0];

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      let cartId = useCartStore.getState().cartId;
      if (!cartId) {
        await initCart();
        cartId = useCartStore.getState().cartId;
      }
      return gqlClient.request(ADD_PRODUCT_TO_CART, {
        cartId,
        cartItems: [{ sku: product.sku, quantity: 1 }],
      });
    },
    onSuccess: () => {
      fetchCart();
      toast.success('Đã thêm vào giỏ hàng');
      onClose();
    },
    onError: () => {
      toast.error('Không thể thêm vào giỏ hàng');
    },
  });

  const isConfigurable = product?.__typename === 'ConfigurableProduct';
  const isOutOfStock = product?.stock_status === 'OUT_OF_STOCK';
  const priceData = product?.price_range?.minimum_price || product?.price_range?.maximum_price;
  const finalPrice = priceData?.final_price?.value;
  const regularPrice = priceData?.regular_price?.value;
  const hasDiscount = finalPrice != null && regularPrice != null && finalPrice < regularPrice;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Đóng"
        >
          <X size={18} className="text-gray-600" />
        </button>

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#0272BA] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
            Không thể tải thông tin sản phẩm.
          </div>
        )}

        {product && (
          <div className="flex gap-4 p-5">
            {/* Image */}
            <div className="flex-shrink-0 w-40 h-40 bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={product.small_image?.url || '/placeholder.png'}
                alt={product.ecom_name || product.name}
                className="w-full h-full object-contain p-2"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-gray-800 line-clamp-3 leading-snug">
                {product.ecom_name || product.name}
              </h2>

              {product.unit_ecom && (
                <p className="text-xs text-gray-500">{product.unit_ecom}</p>
              )}

              {/* Price */}
              {priceData && (
                <div className="flex items-baseline gap-2 flex-wrap">
                  {!isConfigurable && <span className="text-xs text-gray-500">Từ</span>}
                  <span className="text-lg font-bold text-[#E82230]">
                    {finalPrice?.toLocaleString('vi-VN')}₫
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {regularPrice?.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
              )}

              {/* Stock status */}
              <span
                className={`text-xs font-medium ${
                  isOutOfStock ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
              </span>

              {/* Configurable note */}
              {isConfigurable && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                  Xem chi tiết để chọn phiên bản
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                {!isConfigurable && !isOutOfStock && (
                  <button
                    onClick={() => addToCartMutation.mutate()}
                    disabled={addToCartMutation.isPending}
                    className="flex items-center gap-1.5 bg-[#0272BA] text-white text-xs px-3 py-2 rounded-lg hover:bg-[#005a9e] disabled:bg-gray-300 transition-colors"
                  >
                    <ShoppingCart size={14} />
                    {addToCartMutation.isPending ? '...' : 'Thêm vào giỏ'}
                  </button>
                )}
                <Link
                  to={`/product/${product.url_key}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 border border-gray-300 text-gray-700 text-xs px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink size={14} />
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductQuickView;
