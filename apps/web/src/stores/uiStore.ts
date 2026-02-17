import { create } from 'zustand';

interface UIState {
  drawer: string | null;
  isMegaMenuOpen: boolean;
  isMiniCartOpen: boolean;
  isAuthModalOpen: boolean;
  isNavOpen: boolean;
  isSearchOpen: boolean;
  authModalView: 'signIn' | 'createAccount' | 'forgotPassword';

  toggleDrawer: (drawerName: string) => void;
  closeDrawer: () => void;
  openDrawer: (drawerName: string) => void;
  setMegaMenuOpen: (isOpen: boolean) => void;
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
  drawer: null,
  isMegaMenuOpen: false,
  isMiniCartOpen: false,
  isAuthModalOpen: false,
  isNavOpen: false,
  isSearchOpen: false,
  authModalView: 'signIn',

  toggleDrawer: (drawerName: string) =>
    set((state) => ({
      drawer: state.drawer === drawerName ? null : drawerName,
    })),

  closeDrawer: () => set({ drawer: null }),

  openDrawer: (drawerName: string) => set({ drawer: drawerName }),

  setMegaMenuOpen: (isOpen: boolean) => set({ isMegaMenuOpen: isOpen }),

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
