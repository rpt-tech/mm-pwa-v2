/**
 * Analytics utility for GA4 / GTM dataLayer events
 * GTM handles the actual GA4 tag — we just push to dataLayer
 */

declare global {
  interface Window {
    dataLayer: any[];
  }
}

function push(event: Record<string, any>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export const analytics = {
  pageView(path: string, title?: string) {
    push({ event: 'page_view', page_path: path, page_title: title });
  },

  viewItem(product: { sku: string; name: string; price: number; currency?: string }) {
    push({
      event: 'view_item',
      ecommerce: {
        items: [{
          item_id: product.sku,
          item_name: product.name,
          price: product.price,
          currency: product.currency || 'VND',
        }],
      },
    });
  },

  addToCart(product: { sku: string; name: string; price: number; quantity: number; currency?: string }) {
    push({
      event: 'add_to_cart',
      ecommerce: {
        items: [{
          item_id: product.sku,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
          currency: product.currency || 'VND',
        }],
      },
    });
  },

  purchase(order: { id: string; total: number; currency?: string; items: Array<{ sku: string; name: string; price: number; quantity: number }> }) {
    push({
      event: 'purchase',
      ecommerce: {
        transaction_id: order.id,
        value: order.total,
        currency: order.currency || 'VND',
        items: order.items.map((item) => ({
          item_id: item.sku,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  },

  search(term: string) {
    push({ event: 'search', search_term: term });
  },

  login(method = 'email') {
    push({ event: 'login', method });
  },

  signUp(method = 'email') {
    push({ event: 'sign_up', method });
  },

  removeFromCart(product: { sku: string; name: string; price: number; quantity: number; currency?: string }) {
    push({
      event: 'remove_from_cart',
      ecommerce: {
        items: [{
          item_id: product.sku,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
          currency: product.currency || 'VND',
        }],
      },
    });
  },

  beginCheckout(items: Array<{ sku: string; name: string; price: number; quantity: number }>, value?: number) {
    push({
      event: 'begin_checkout',
      ecommerce: {
        value: value || 0,
        currency: 'VND',
        items: items.map((item) => ({
          item_id: item.sku,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  },
};
