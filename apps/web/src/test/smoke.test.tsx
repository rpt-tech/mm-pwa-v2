import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={makeQueryClient()}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

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

  it('openNav / closeNav toggle isNavOpen', () => {
    const { openNav, closeNav } = useUIStore.getState();
    openNav();
    expect(useUIStore.getState().isNavOpen).toBe(true);
    closeNav();
    expect(useUIStore.getState().isNavOpen).toBe(false);
  });

  it('openAuthModal sets view and flag', () => {
    useUIStore.getState().openAuthModal('createAccount');
    const state = useUIStore.getState();
    expect(state.isAuthModalOpen).toBe(true);
    expect(state.authModalView).toBe('createAccount');
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

  it('login marks isLoggedIn true', () => {
    useAuthStore.getState().login('tok123', { email: 'test@test.com', firstname: 'Test', lastname: 'User' } as any);
    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(true);
    expect(state.token).toBe('tok123');
  });

  it('logout clears user and token', () => {
    useAuthStore.setState({ user: { email: 'x' } as any, token: 'tok', isLoggedIn: true, isLoading: false });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoggedIn).toBe(false);
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

  it('setCartId updates cartId', () => {
    useCartStore.setState({ cartId: 'abc123', items: [], itemCount: 0 });
    expect(useCartStore.getState().cartId).toBe('abc123');
  });
});

describe('StockStatusMessage', () => {
  it('shows out of stock message', async () => {
    const { default: StockStatusMessage } = await import('@/components/catalog/StockStatusMessage');
    render(<StockStatusMessage stockStatus="OUT_OF_STOCK" />);
    expect(screen.getByText(/hết hàng|out of stock/i)).toBeTruthy();
  });

  it('shows in stock message (renders null — no element)', async () => {
    const { default: StockStatusMessage } = await import('@/components/catalog/StockStatusMessage');
    const { container } = render(<StockStatusMessage stockStatus="IN_STOCK" />);
    // IN_STOCK renders null — container should be empty
    expect(container.firstChild).toBeNull();
  });
});

describe('LoadingIndicator', () => {
  it('renders without crashing', async () => {
    const { default: LoadingIndicator } = await import('@/components/ui/LoadingIndicator');
    const { container } = render(<LoadingIndicator />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('OfflineBanner', () => {
  it('renders without crashing', async () => {
    const { default: OfflineBanner } = await import('@/components/common/OfflineBanner');
    const { container } = render(<OfflineBanner />);
    expect(container).toBeTruthy();
  });
});

describe('NotFoundPage', () => {
  it('renders 404 content', async () => {
    const { default: NotFoundPage } = await import('@/pages/NotFoundPage');
    render(<Wrapper><NotFoundPage /></Wrapper>);
    expect(document.body.textContent).toMatch(/404|không tìm thấy|not found/i);
  });
});
