import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mm_recently_viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedProduct {
  uid: string;
  url_key: string;
  name: string;
  ecom_name?: string;
  small_image?: { url: string };
  price_range?: {
    maximum_price?: {
      final_price?: { value: number; currency: string };
      regular_price?: { value: number; currency: string };
      discount?: { amount_off: number; percent_off: number };
    };
  };
}

function readStorage(): RecentlyViewedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedProduct[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: RecentlyViewedProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export function addRecentlyViewed(product: RecentlyViewedProduct): void {
  const current = readStorage();
  // Remove duplicate by uid, prepend new item, cap at MAX_ITEMS
  const filtered = current.filter((p) => p.uid !== product.uid);
  const updated = [product, ...filtered].slice(0, MAX_ITEMS);
  writeStorage(updated);
  // Notify other hook instances via storage event
  window.dispatchEvent(new Event('mm_recently_viewed_updated'));
}

export function useRecentlyViewed(): RecentlyViewedProduct[] {
  const [items, setItems] = useState<RecentlyViewedProduct[]>(readStorage);

  useEffect(() => {
    const sync = () => setItems(readStorage());
    window.addEventListener('mm_recently_viewed_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('mm_recently_viewed_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return items;
}
