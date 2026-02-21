import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Trash2, ShoppingCart, Tag, ChevronRight, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { gqlClient } from '@/lib/graphql-client';
import {
  GET_CART_DETAILS,
  UPDATE_CART_ITEMS,
  REMOVE_ITEM_FROM_CART,
  REMOVE_ALL_CART_ITEMS,
  APPLY_COUPON_TO_CART,
  ADD_COMMENT_TO_CART_ITEM,
  GET_CROSS_SELL_PRODUCTS,
} from '@/queries/cart';
import QuantityStepper from '@/components/product/QuantityStepper';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

interface CartItemRowProps {
  item: any;
  cartId: string;
  onQuantityChange: (uid: string, qty: number) => void;
  onRemove: (uid: string) => void;
  isMutating: boolean;
}

function CartItemRow({ item, cartId, onQuantityChange, onRemove, isMutating }: CartItemRowProps) {
  const [comment, setComment] = useState(item.comment || '');
  const [isEditingComment, setIsEditingComment] = useState(false);
  const queryClient = useQueryClient();

  const product = item.product;
  const displayName = product.ecom_name || product.name;
  const thumbnail = product.small_image?.url || product.thumbnail?.url;
  const rowTotal = item.prices?.row_total?.value ?? 0;
  const currency = item.prices?.row_total?.currency ?? 'VND';
  const finalPrice = product.price_range?.maximum_price?.final_price?.value ?? 0;
  const regularPrice = product.price_range?.maximum_price?.regular_price?.value ?? 0;
  const hasDiscount = regularPrice > finalPrice && regularPrice > 0;
  const isFractional = product.mm_product_type === 'F';
  const selectedOptions = item.configurable_options || [];

  const commentMutation = useMutation({
    mutationFn: (newComment: string) =>
      gqlClient.request(ADD_COMMENT_TO_CART_ITEM, {
        cartId,
        cartItemUid: item.uid,
        comment: newComment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      setIsEditingComment(false);
    },
  });

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100">
      {/* Product image */}
      <Link
        to={`/product/${product.url_key}`}
        className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded overflow-hidden"
      >
        <img
          src={thumbnail || '/placeholder.jpg'}
          alt={displayName}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </Link>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${product.url_key}`}
          className="text-sm font-medium text-gray-800 hover:text-[#006341] line-clamp-2"
        >
          {displayName}
        </Link>

        {product.art_no && (
          <p className="text-xs text-gray-400 mt-0.5">SKU: {product.art_no}</p>
        )}

        {selectedOptions.length > 0 && (
          <div className="mt-1">
            {selectedOptions.map((opt: any) => (
              <span key={opt.id} className="text-xs text-gray-500 mr-2">
                {opt.option_label}: {opt.value_label}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-[#006341]">
            {formatPrice(finalPrice, currency)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(regularPrice, currency)}
            </span>
          )}
          {product.unit_ecom && (
            <span className="text-xs text-gray-500">/ {product.unit_ecom}</span>
          )}
        </div>

        {/* DNR label */}
        {item.have_great_deal && product.dnr_price && (
          <div className="mt-1 inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">
            <Tag size={10} />
            <span>{product.dnr_price[0]?.promo_label}</span>
          </div>
        )}

        {/* Comment */}
        <div className="mt-2">
          {isEditingComment ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ghi chú cho sản phẩm này..."
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#006341]"
                maxLength={255}
              />
              <button
                onClick={() => commentMutation.mutate(comment)}
                disabled={commentMutation.isPending}
                className="text-xs text-[#006341] hover:underline"
              >
                Lưu
              </button>
              <button
                onClick={() => setIsEditingComment(false)}
                className="text-xs text-gray-400 hover:underline"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingComment(true)}
              className="text-xs text-gray-400 hover:text-[#006341] underline"
            >
              {comment ? `Ghi chú: "${comment}"` : '+ Thêm ghi chú'}
            </button>
          )}
        </div>
      </div>

      {/* Quantity + Actions */}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onRemove(item.uid)}
          disabled={isMutating}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>

        <QuantityStepper
          value={item.quantity}
          min={isFractional ? 0.5 : 1}
          step={isFractional ? 0.5 : 1}
          onChange={(qty) => onQuantityChange(item.uid, qty)}
          disabled={isMutating}
        />

        <span className="text-sm font-bold text-[#006341]">
          {formatPrice(rowTotal, currency)}
        </span>
      </div>
    </div>
  );
}

function PriceSummary({ cart }: { cart: any }) {
  const navigate = useNavigate();
  const prices = cart?.prices;
  const subtotalExcl = prices?.subtotal_excluding_tax?.value ?? 0;
  const grandTotal = prices?.grand_total?.value ?? 0;
  const currency = prices?.grand_total?.currency ?? 'VND';
  const discounts = prices?.discounts || [];
  const appliedCoupons = cart?.applied_coupons || [];
  const taxes = prices?.applied_taxes || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
      <h3 className="font-semibold text-gray-800 mb-4">Tổng đơn hàng</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span>{formatPrice(subtotalExcl, currency)}</span>
        </div>

        {discounts.map((discount: any, i: number) => (
          <div key={i} className="flex justify-between text-green-600">
            <span>Giảm giá ({discount.label}):</span>
            <span>-{formatPrice(discount.amount?.value ?? 0, currency)}</span>
          </div>
        ))}

        {appliedCoupons.length > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Mã giảm giá ({appliedCoupons[0].code}):</span>
            <span>Đã áp dụng</span>
          </div>
        )}

        {taxes.map((tax: any, i: number) => (
          <div key={i} className="flex justify-between text-gray-500">
            <span>{tax.label}:</span>
            <span>{formatPrice(tax.amount?.value ?? 0, currency)}</span>
          </div>
        ))}

        <div className="border-t pt-2 flex justify-between font-bold text-base">
          <span>Tổng cộng:</span>
          <span className="text-[#006341]">{formatPrice(grandTotal, currency)}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="mt-4 w-full bg-[#006341] text-white py-3 rounded font-semibold hover:bg-[#004d32] transition-colors flex items-center justify-center gap-2"
      >
        Tiến hành thanh toán
        <ChevronRight size={18} />
      </button>

      <p className="mt-2 text-xs text-gray-400 text-center">
        Phí vận chuyển sẽ được tính ở bước thanh toán
      </p>
    </div>
  );
}

function CouponSection({ cartId }: { cartId: string }) {
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: () =>
      gqlClient.request(APPLY_COUPON_TO_CART, { cartId, couponCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      setCouponCode('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.errors?.[0]?.message || 'Mã giảm giá không hợp lệ');
    },
  });

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Tag size={16} className="text-[#006341]" />
        <span className="text-sm font-medium">Mã giảm giá</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setError(''); }}
          placeholder="Nhập mã giảm giá"
          className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#006341]"
        />
        <button
          onClick={() => applyMutation.mutate()}
          disabled={!couponCode || applyMutation.isPending}
          className="px-4 py-2 bg-[#006341] text-white text-sm rounded hover:bg-[#004d32] disabled:opacity-50 transition-colors"
        >
          Áp dụng
        </button>
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cartId, setItemCount } = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['cartDetails', cartId],
    queryFn: () => gqlClient.request(GET_CART_DETAILS, { cartId }),
    enabled: !!cartId,
    staleTime: 30000,
  });

  const cart = data?.cart;
  const items = cart?.items || [];
  const hasItems = items.length > 0;
  const totalQuantity = cart?.total_quantity ?? 0;

  // Cross-sell products
  const itemSkus = items.map((item: any) => item.product?.sku).filter(Boolean);
  const { data: crossSellData } = useQuery({
    queryKey: ['crossSell', itemSkus],
    queryFn: () => gqlClient.request(GET_CROSS_SELL_PRODUCTS, { skus: itemSkus }),
    enabled: itemSkus.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  const crossSellProducts = crossSellData?.products?.items?.flatMap((p: any) => p.crosssell_products || []) || [];

  const updateItemMutation = useMutation({
    mutationFn: ({ uid, quantity }: { uid: string; quantity: number }) =>
      gqlClient.request(UPDATE_CART_ITEMS, {
        cartId,
        cartItems: [{ cart_item_uid: uid, quantity }],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      queryClient.invalidateQueries({ queryKey: ['miniCart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (cartItemUid: string) =>
      gqlClient.request(REMOVE_ITEM_FROM_CART, { cartId, cartItemUid }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      queryClient.invalidateQueries({ queryKey: ['miniCart'] });
      const newCount = data?.removeItemFromCart?.cart?.total_quantity ?? 0;
      setItemCount(newCount);
    },
  });

  const removeAllMutation = useMutation({
    mutationFn: () =>
      gqlClient.request(REMOVE_ALL_CART_ITEMS, { cartId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      queryClient.invalidateQueries({ queryKey: ['miniCart'] });
      setItemCount(0);
    },
  });

  if (!cartId) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-[#006341] text-white rounded hover:bg-[#004d32] transition-colors"
        >
          Mua sắm ngay
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006341]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-500">
        <AlertCircle size={48} className="mx-auto mb-3" />
        <p>Không thể tải giỏ hàng. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl">
      <Helmet>
        <title>Giỏ hàng | MM Mega Market</title>
      </Helmet>
      <Breadcrumbs />

      <h1 className="text-xl font-bold text-gray-800 mb-4">
        Giỏ hàng ({totalQuantity} sản phẩm)
      </h1>

      {!hasItems ? (
        <div className="text-center py-16">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-medium text-gray-600 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-400 mb-6">Hãy thêm sản phẩm vào giỏ hàng</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#006341] text-white rounded-lg hover:bg-[#004d32] transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {items.length} sản phẩm
                </span>
                <button
                  onClick={() => {
                    if (window.confirm('Xóa tất cả sản phẩm trong giỏ hàng?')) {
                      removeAllMutation.mutate();
                    }
                  }}
                  disabled={removeAllMutation.isPending}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Xóa tất cả
                </button>
              </div>

              {items.map((item: any) => (
                <CartItemRow
                  key={item.uid}
                  item={item}
                  cartId={cartId}
                  onQuantityChange={(uid, qty) =>
                    updateItemMutation.mutate({ uid, quantity: qty })
                  }
                  onRemove={(uid) => removeItemMutation.mutate(uid)}
                  isMutating={updateItemMutation.isPending || removeItemMutation.isPending}
                />
              ))}

              {/* Coupon code */}
              <CouponSection cartId={cartId} />
            </div>
          </div>

          {/* Price summary */}
          <div className="lg:col-span-1">
            <PriceSummary cart={cart} />
          </div>
        </div>
      )}

      {/* Cross-sell Products */}
      {crossSellProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {crossSellProducts.slice(0, 6).map((product: any) => {
              const finalPrice = product.price_range?.maximum_price?.final_price?.value || 0;
              const regularPrice = product.price_range?.maximum_price?.regular_price?.value || 0;
              const hasDiscount = finalPrice < regularPrice;
              return (
                <Link
                  key={product.uid}
                  to={`/product/${product.url_key}`}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square">
                    <img
                      src={product.small_image?.url || '/placeholder.png'}
                      alt={product.ecom_name || product.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-2 mb-1">{product.ecom_name || product.name}</p>
                    <p className="text-sm font-bold text-red-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalPrice)}
                    </p>
                    {hasDiscount && (
                      <p className="text-xs text-gray-400 line-through">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(regularPrice)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
