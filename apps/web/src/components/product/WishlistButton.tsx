import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { gqlClient } from '@/lib/graphql-client';
import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST } from '@/queries/account';

interface WishlistButtonProps {
  productSku: string;
  wishlistItemId?: string;
  isInWishlist?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function WishlistButton({
  productSku,
  wishlistItemId,
  isInWishlist = false,
  size = 'md',
  showLabel = false,
}: WishlistButtonProps) {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const queryClient = useQueryClient();
  const [inWishlist, setInWishlist] = useState(isInWishlist);

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: (sku: string) =>
      gqlClient.request(ADD_TO_WISHLIST, {
        wishlistId: '0',
        items: [{ sku, quantity: 1 }],
      }),
    onSuccess: () => {
      setInWishlist(true);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã thêm vào danh sách yêu thích');
    },
    onError: () => {
      toast.error('Không thể thêm vào danh sách yêu thích');
    },
  });

  // Remove from wishlist mutation — uses wishlistItemId when available
  const removeFromWishlistMutation = useMutation({
    mutationFn: (itemId: string) =>
      gqlClient.request(REMOVE_FROM_WISHLIST, {
        wishlistId: '0',
        wishlistItemsIds: [itemId],
      }),
    onSuccess: () => {
      setInWishlist(false);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã xóa khỏi danh sách yêu thích');
    },
    onError: () => {
      toast.error('Không thể xóa sản phẩm');
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    if (inWishlist) {
      if (wishlistItemId) {
        removeFromWishlistMutation.mutate(wishlistItemId);
      } else {
        // No item ID available — optimistically toggle UI only
        setInWishlist(false);
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      }
    } else {
      addToWishlistMutation.mutate(productSku);
    }
  };

  const isPending = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full border-2 transition-all ${
        inWishlist
          ? 'bg-red-50 border-red-500 text-red-500 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
      } disabled:opacity-50 disabled:cursor-not-allowed ${showLabel ? 'gap-2 px-4 w-auto' : ''}`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={iconSizes[size]}
        className={`${inWishlist ? 'fill-current' : ''} ${isPending ? 'animate-pulse' : ''}`}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
}
