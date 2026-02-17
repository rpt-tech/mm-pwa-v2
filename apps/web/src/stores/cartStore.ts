import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  uid: string;
  productUid: string;
  sku: string;
  name: string;
  quantity: number;
}

interface CartState {
  cartId: string | null;
  items: CartItem[];
  itemCount: number;
  setCartId: (id: string | null) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (uid: string, quantity: number) => void;
  removeItem: (uid: string) => void;
  getItemByProductUid: (productUid: string) => CartItem | undefined;
  setItemCount: (count: number) => void;
  reset: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      itemCount: 0,

      setCartId: (cartId) => set({ cartId }),

      setItems: (items: CartItem[]) =>
        set({
          items,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        }),

      addItem: (item: CartItem) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.productUid === item.productUid);
          let newItems: CartItem[];

          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productUid === item.productUid ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            newItems = [...state.items, item];
          }

          return {
            items: newItems,
            itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
          };
        }),

      updateItem: (uid: string, quantity: number) =>
        set((state) => {
          const newItems = state.items.map((item) =>
            item.uid === uid ? { ...item, quantity } : item
          );

          return {
            items: newItems,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        }),

      removeItem: (uid: string) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.uid !== uid);

          return {
            items: newItems,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          };
        }),

      getItemByProductUid: (productUid: string) => {
        return get().items.find((item) => item.productUid === productUid);
      },

      setItemCount: (itemCount) => set({ itemCount }),

      reset: () => set({ cartId: null, items: [], itemCount: 0 }),
    }),
    {
      name: 'mm-cart',
    },
  ),
);
