import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CompareProduct {
  uid: string;
  url_key: string;
  name: string;
  ecom_name?: string;
  small_image?: { url: string };
  price_range: {
    minimum_price?: {
      final_price: { value: number; currency: string };
      regular_price: { value: number; currency: string };
    };
    maximum_price?: {
      final_price: { value: number; currency: string };
      regular_price: { value: number; currency: string };
    };
  };
  sku: string;
}

interface CompareState {
  items: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (uid: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCompare: (product) => {
        const { items } = get();
        if (items.length >= 3 || items.find((p) => p.uid === product.uid)) return;
        set({ items: [...items, product] });
      },
      removeFromCompare: (uid) => set({ items: get().items.filter((p) => p.uid !== uid) }),
      clearCompare: () => set({ items: [] }),
    }),
    {
      name: 'compare-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
