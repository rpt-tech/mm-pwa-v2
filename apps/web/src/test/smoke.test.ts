import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

describe('environment', () => {
  it('is configured', () => {
    expect(true).toBe(true);
  });
});

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      drawer: null,
      isMegaMenuOpen: false,
      isMiniCartOpen: false,
      isAuthModalOpen: false,
      isNavOpen: false,
      isSearchOpen: false,
      authModalView: 'signIn',
    });
  });

  it('has correct initial state', () => {
    const state = useUIStore.getState();
    expect(state.drawer).toBeNull();
    expect(state.isMegaMenuOpen).toBe(false);
    expect(state.isMiniCartOpen).toBe(false);
    expect(state.isAuthModalOpen).toBe(false);
    expect(state.isNavOpen).toBe(false);
    expect(state.isSearchOpen).toBe(false);
    expect(state.authModalView).toBe('signIn');
  });
});

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoggedIn).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({
      cartId: null,
      items: [],
      itemCount: 0,
    });
  });

  it('has correct initial state', () => {
    const state = useCartStore.getState();
    expect(state.cartId).toBeNull();
    expect(state.items).toEqual([]);
    expect(state.itemCount).toBe(0);
  });
});
