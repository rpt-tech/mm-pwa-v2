import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { gqlClient } from '@/lib/graphql-client';
import { GET_MINI_CART, REMOVE_ITEM_FROM_CART } from '@/queries/cart';

function formatPrice(value: number, currency = 'VND') {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

interface MiniCartItemProps {
  item: any;
  onRemove: (uid: string) => void;
  isRemoving: boolean;
}

function MiniCartItem({ item, onRemove, isRemoving }: MiniCartItemProps) {
  const product = item.product;
  const displayName = product.ecom_name || product.name;
  const thumbnail = product.thumbnail?.url;
  const price = item.prices?.row_total?.value ?? 0;
  const currency = item.prices?.row_total?.currency ?? 'VND';
  const originalPrice = product.price_range?.maximum_price?.regular_price?.value ?? 0;
  const finalPrice = product.price_range?.maximum_price?.final_price?.value ?? 0;
  const hasDiscount = originalPrice > finalPrice && originalPrice > 0;

  // Get variant thumbnail for configurable products
  const selectedOptions = item.configurable_options || [];
  const variantThumbnail = product.variants?.find((v: any) =>
    selectedOptions.every((opt: any) =>
      v.attributes?.some((a: any) => a.uid === opt.configurable_product_option_value_uid)
    )
  )?.product?.thumbnail?.url;

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <Link
        to={`/${product.url_key}.html`}
        className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-100"
      >
        <img
          src={variantThumbnail || thumbnail || '/placeholder.jpg'}
          alt={displayName}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          to={`/${product.url_key}.html`}
          className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#006341]"
        >
          {displayName}
        </Link>

        {selectedOptions.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {selectedOptions.map((opt: any) => (
              <span key={opt.configurable_product_option_uid}>
                {opt.option_label}: {opt.value_label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-[#006341]">
              {formatPrice(price, currency)}
            </span>
            {hasDiscount && (
              <span className="ml-1 text-xs text-gray-400 line-through">
                {formatPrice(originalPrice * item.quantity, currency)}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">x{item.quantity}</span>
        </div>
      </div>

      <button
        onClick={() => onRemove(item.uid)}
        disabled={isRemoving}
        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
        aria-label="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function MiniCart() {
  const { isMiniCartOpen, closeMiniCart } = useUIStore();
  const { cartId, setItemCount } = useCartStore();
  const queryClient = useQueryClient();

  // Fetch cart data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['miniCart', cartId],
    queryFn: () => gqlClient.request(GET_MINI_CART, { cartId }),
    enabled: !!cartId && isMiniCartOpen,
    staleTime: 30000,
  });

  const cart = data?.cart;
  const items = cart?.items || [];
  const totalQuantity = cart?.total_quantity ?? 0;
  const subtotal = cart?.prices?.subtotal_excluding_tax?.value ?? 0;
  const subtotalCurrency = cart?.prices?.subtotal_excluding_tax?.currency ?? 'VND';
  const grandTotal = cart?.prices?.grand_total?.value ?? 0;
  const grandTotalCurrency = cart?.prices?.grand_total?.currency ?? 'VND';

  // Update item count in store
  useEffect(() => {
    if (totalQuantity !== undefined) {
      setItemCount(totalQuantity);
    }
  }, [totalQuantity, setItemCount]);

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: ({ cartItemUid }: { cartItemUid: string }) =>
      gqlClient.request(REMOVE_ITEM_FROM_CART, { cartId, cartItemUid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniCart'] });
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      refetch();
    },
  });


  // Body scroll lock
  useEffect(() => {
    if (isMiniCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMiniCartOpen]);

  if (!isMiniCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeMiniCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-[#006341]">
          <div className="flex items-center gap-2 text-white">
            <ShoppingCart size={20} />
            <span className="font-semibold text-sm">
              Giỏ hàng ({totalQuantity} sản phẩm)
            </span>
          </div>
          <button
            onClick={closeMiniCart}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006341]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <ShoppingCart size={48} className="mb-3 text-gray-300" />
              <p className="text-sm">Giỏ hàng trống</p>
              <button
                onClick={closeMiniCart}
                className="mt-4 text-[#006341] text-sm hover:underline"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item: any) => (
                <MiniCartItem
                  key={item.uid}
                  item={item}
                  onRemove={(uid) => removeItemMutation.mutate({ cartItemUid: uid })}
                  isRemoving={removeItemMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tạm tính:</span>
              <span className="text-sm font-medium">{formatPrice(subtotal, subtotalCurrency)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-800">Tổng cộng:</span>
              <span className="text-base font-bold text-[#006341]">
                {formatPrice(grandTotal, grandTotalCurrency)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  closeMiniCart();
                  window.location.href = '/cart';
                }}
                className="flex-1 py-2 border-2 border-[#006341] text-[#006341] rounded font-medium text-sm hover:bg-[#006341] hover:text-white transition-colors"
              >
                Xem giỏ hàng
              </button>
              <button
                onClick={() => {
                  closeMiniCart();
                  window.location.href = '/checkout';
                }}
                className="flex-1 py-2 bg-[#006341] text-white rounded font-medium text-sm hover:bg-[#004d32] transition-colors"
              >
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
