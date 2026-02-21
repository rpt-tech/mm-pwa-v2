import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Trash2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import MyAccountLayout from '@/components/account/MyAccountLayout';
import { gqlClient } from '@/lib/graphql-client';
import { GET_WISHLIST, REMOVE_FROM_WISHLIST } from '@/queries/account';
import { ADD_PRODUCT_TO_CART } from '@/queries/product';
import { useCartStore } from '@/stores/cartStore';

export default function WishlistPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { initCart } = useCartStore();

  // Fetch wishlist
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const result = await gqlClient.request(GET_WISHLIST);
      return result.customer.wishlist;
    },
  });

  const wishlist = data || { items: [], items_count: 0 };

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async (wishlistItemId: string) => {
      return await gqlClient.request(REMOVE_FROM_WISHLIST, {
        wishlistId: wishlist.id,
        wishlistItemsIds: [wishlistItemId],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã xóa khỏi danh sách yêu thích');
    },
    onError: () => {
      toast.error('Không thể xóa sản phẩm');
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async ({ sku, quantity }: { sku: string; quantity: number }) => {
      const currentCartId = useCartStore.getState().cartId;
      return await gqlClient.request(ADD_PRODUCT_TO_CART, {
        cartId: currentCartId || '',
        cartItems: [{ sku, quantity }],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['miniCart'] });
      queryClient.invalidateQueries({ queryKey: ['cartDetails'] });
      toast.success('Đã thêm vào giỏ hàng');
    },
    onError: () => {
      toast.error('Không thể thêm vào giỏ hàng');
    },
  });

  const handleRemove = (itemId: string) => {
    removeMutation.mutate(itemId);
  };

  const handleAddToCart = async (sku: string) => {
    if (!useCartStore.getState().cartId) await initCart();
    addToCartMutation.mutate({ sku, quantity: 1 });
  };

  if (isLoading) {
    return (
      <MyAccountLayout currentPage="wishlist">
        <h2 className="text-2xl font-bold mb-6">{t('account.wishlist')}</h2>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006341]"></div>
        </div>
      </MyAccountLayout>
    );
  }

  return (
    <MyAccountLayout currentPage="wishlist">
      <Helmet><title>Danh sách yêu thích | MM Mega Market</title></Helmet>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {t('account.wishlist')} ({wishlist.items_count})
        </h2>
      </div>

      {wishlist.items_count === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t('account.emptyWishlist')}</p>
          <Link
            to="/"
            className="inline-block bg-[#006341] text-white px-6 py-2 rounded-lg hover:bg-[#004d33]"
          >
            {t('account.continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {wishlist.items.map((item: any) => {
            const product = item.product;
            const price = product.price_range.maximum_price.final_price;
            const regularPrice = product.price_range.maximum_price.regular_price;
            const discount = product.price_range.maximum_price.discount;

            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 flex gap-4 hover:border-[#006341] transition-colors"
              >
                {/* Product Image */}
                <Link
                  to={`/product/${product.url_key}`}
                  className="flex-shrink-0 w-24 h-24"
                >
                  <img
                    src={product.thumbnail.url}
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${product.url_key}`}
                    className="font-medium text-gray-900 hover:text-[#006341] line-clamp-2"
                  >
                    {product.ecom_name || product.name}
                  </Link>
                  {product.unit_ecom && (
                    <p className="text-xs text-gray-500 mt-0.5">{product.unit_ecom}</p>
                  )}
                  {product.art_no && (
                    <p className="text-xs text-gray-500 mt-1">SKU: {product.art_no}</p>
                  )}

                  {/* Price */}
                  <div className="mt-2">
                    {discount && discount.percent_off > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          {price.value.toLocaleString('vi-VN')} {price.currency}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {regularPrice.value.toLocaleString('vi-VN')} {regularPrice.currency}
                        </span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          -{discount.percent_off}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {price.value.toLocaleString('vi-VN')} {price.currency}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mt-2">
                    {product.stock_status === 'IN_STOCK' ? (
                      <span className="text-sm text-green-600">{t('product.inStock')}</span>
                    ) : (
                      <span className="text-sm text-red-600">{t('product.outOfStock')}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removeMutation.isPending}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title={t('account.removeFromWishlist')}
                  >
                    <Trash2 size={20} />
                  </button>
                  {product.stock_status === 'IN_STOCK' && (
                    <button
                      onClick={() => handleAddToCart(product.sku)}
                      disabled={addToCartMutation.isPending}
                      className="flex items-center gap-2 bg-[#006341] text-white px-4 py-2 rounded-lg hover:bg-[#004d33] transition-colors disabled:opacity-50 text-sm"
                    >
                      <ShoppingCart size={16} />
                      <span>{t('product.addToCart')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MyAccountLayout>
  );
}
