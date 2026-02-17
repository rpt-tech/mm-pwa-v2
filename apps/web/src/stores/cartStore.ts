import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  cartId: string | null;
  itemCount: number;
  setCartId: (id: string | null) => void;
  setItemCount: (count: number) => void;
  reset: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartId: null,
      itemCount: 0,
      setCartId: (cartId) => set({ cartId }),
      setItemCount: (itemCount) => set({ itemCount }),
      reset: () => set({ cartId: null, itemCount: 0 }),
    }),
    {
      name: 'mm-cart',
    },
  ),
);
