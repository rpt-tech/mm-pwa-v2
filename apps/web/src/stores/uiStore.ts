import { create } from 'zustand';

interface UIState {
  isMiniCartOpen: boolean;
  isAuthModalOpen: boolean;
  isNavOpen: boolean;
  isSearchOpen: boolean;
  authModalView: 'signIn' | 'createAccount' | 'forgotPassword';
  openMiniCart: () => void;
  closeMiniCart: () => void;
  openAuthModal: (view?: UIState['authModalView']) => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: UIState['authModalView']) => void;
  openNav: () => void;
  closeNav: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isMiniCartOpen: false,
  isAuthModalOpen: false,
  isNavOpen: false,
  isSearchOpen: false,
  authModalView: 'signIn',

  openMiniCart: () => set({ isMiniCartOpen: true }),
  closeMiniCart: () => set({ isMiniCartOpen: false }),

  openAuthModal: (view = 'signIn') =>
    set({ isAuthModalOpen: true, authModalView: view }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalView: (authModalView) => set({ authModalView }),

  openNav: () => set({ isNavOpen: true }),
  closeNav: () => set({ isNavOpen: false }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));
