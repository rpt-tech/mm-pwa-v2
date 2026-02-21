import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GET_AUTOCOMPLETE_RESULTS } from '@/queries/catalog';
import { gqlClient } from '@/lib/graphql-client';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ChevronDown, Search, X } from 'lucide-react';
import MegaMenu from '@/components/navigation/MegaMenu';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { drawer, toggleDrawer, openNav, openMiniCart } = useUIStore();
  const { itemCount } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const isMegaMenuOpen = drawer === 'megaMenu';

  // Autocomplete query
  const { data: autocompleteData, isLoading: autocompleteLoading } = useQuery({
    queryKey: ['autocomplete', searchQuery],
    queryFn: () => gqlClient.request(GET_AUTOCOMPLETE_RESULTS, {
      inputText: searchQuery,
      asmUid: '',
      pageSize: 5
    }),
    enabled: searchQuery.length >= 3,
    staleTime: 30000,
  });

  const suggestions = autocompleteData?.products?.items || [];

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search.html?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsAutocompleteOpen(false);
      searchInputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (product: any) => {
    navigate(`/${product.url_key}${product.url_suffix || '.html'}`);
    setIsAutocompleteOpen(false);
    setSearchQuery('');
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsAutocompleteOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMegaMenu = () => {
    toggleDrawer('megaMenu');
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Main Header - MM Vietnam blue */}
      <div className="bg-[#0272BA]">
        <div className="container mx-auto px-4 lg:px-5">
          <div className="flex items-center gap-2.5 py-[14px]">
            {/* Mobile Menu Trigger */}
            {!isDesktop && (
              <button
                onClick={openNav}
                className="w-10 h-10 flex items-center justify-center border border-[#E8E8E8] rounded-full shrink-0"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img
                src="/logo.svg"
                alt="MM Vietnam"
                className="h-10 max-h-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const span = document.createElement('span');
                  span.className = 'text-white font-bold text-xl';
                  span.textContent = 'MM Vietnam';
                  e.currentTarget.parentNode?.appendChild(span);
                }}
              />
            </Link>

            {/* Search Bar with Autocomplete */}
            <div className="flex-1 relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsAutocompleteOpen(e.target.value.length >= 3);
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 3) setIsAutocompleteOpen(true);
                    }}
                    placeholder={t('searchBar.placeholder', 'What are you looking for?')}
                    className="w-full px-4 py-2.5 pr-14 bg-white border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setIsAutocompleteOpen(false);
                          searchInputRef.current?.focus();
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="w-9 h-9 bg-[#E82230] hover:bg-[#B2202A] rounded-full flex items-center justify-center transition-colors"
                      aria-label="Search"
                    >
                      <Search className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Autocomplete Dropdown */}
              {isAutocompleteOpen && searchQuery.length >= 3 && (
                <div
                  ref={autocompleteRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                >
                  {autocompleteLoading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">{t('autocomplete.loading', 'Loading...')}</div>
                  ) : suggestions.length > 0 ? (
                    <div>
                      <div className="px-3 py-2 text-xs text-gray-400 border-b">{t('autocomplete.suggestions', 'Suggestions')}</div>
                      {suggestions.map((product: any) => (
                        <button
                          key={product.uid}
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 text-left"
                        >
                          <img src={product.small_image?.url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{product.ecom_name || product.name}</p>
                            {product.unit_ecom && <p className="text-xs text-gray-500">{product.unit_ecom}</p>}
                            <p className="text-sm font-bold text-[#0272BA]">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: product.price?.regularPrice?.amount?.currency || 'VND' }).format(product.price?.regularPrice?.amount?.value || 0)}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button onClick={handleSearchSubmit} className="w-full p-3 text-center text-sm text-[#0272BA] hover:bg-gray-50 font-medium">
                        {t('autocomplete.viewAll', `View all results for "${searchQuery}"`)}
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">{t('autocomplete.emptyResult', 'No results were found.')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {isDesktop && (
                <>
                  {/* Wishlist */}
                  <Link to="/account/wishlist" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white hover:bg-white/10 rounded transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-xs leading-tight">{t('wishlistTrigger.label', 'Wishlist')}</span>
                  </Link>

                  {/* Account */}
                  <Link
                    to={isLoggedIn ? "/account" : "/sign-in"}
                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs leading-tight">{t('accountTrigger.buttonFallback', 'My Account')}</span>
                  </Link>
                </>
              )}

              {/* Cart */}
              <button
                onClick={isDesktop ? openMiniCart : () => window.location.href = '/cart'}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-white hover:bg-white/10 rounded transition-colors relative"
              >
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#E82230] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs leading-tight">{t('cartTrigger.label', 'My Cart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar - white */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-5">
          <div className="flex items-center py-1.5 gap-4">
            {isDesktop ? (
              <>
                {/* Category Menu Button */}
                <button
                  onClick={handleMegaMenu}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isMegaMenuOpen ? 'text-[#0272BA]' : 'text-[#172630] hover:text-[#0272BA]'
                  }`}
                >
                  <svg className="w-5 h-5 text-[#0272BA]" fill="none" stroke="currentColor" viewBox="0 0 22 22">
                    <rect x="1" y="1" width="8" height="8" rx="1.5" strokeWidth="1.5" />
                    <rect x="13" y="1" width="8" height="8" rx="1.5" strokeWidth="1.5" />
                    <rect x="1" y="13" width="8" height="8" rx="1.5" strokeWidth="1.5" />
                    <rect x="13" y="13" width="8" height="8" rx="1.5" strokeWidth="1.5" />
                  </svg>
                  <span>{t('header.menuButton', 'Category')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* CMS Menu Links placeholder */}
                <div className="flex-1" />

                {/* Language Switcher */}
                <select
                  className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:border-[#0272BA]"
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                >
                  <option value="vi">VI</option>
                  <option value="en">EN</option>
                </select>

                {/* Business Customer Link */}
                <a
                  href="https://mmpro.vn/"
                  className="flex items-center gap-2 text-sm px-3 py-1.5 border border-gray-300 rounded hover:border-[#0272BA] hover:text-[#0272BA] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 18 16">
                    <path d="M18 6.62C18 7.84 16.99 8.89 15.75 8.89c-1.24 0-2.25-1.05-2.25-2.27 0 1.22-1.01 2.27-2.25 2.27C10.01 8.89 9 7.84 9 6.62c0 1.22-1.01 2.27-2.25 2.27C5.51 8.89 4.5 7.84 4.5 6.62c0 1.22-1.01 2.27-2.25 2.27C1.01 8.89 0 7.84 0 6.62L1.8 2.67h14.4L18 6.62zM15.3 1.78H2.7C2.14 1.78 1.8 1.35 1.8.89 1.8.43 2.08 0 2.81 0h12.38C15.87 0 16.2.43 16.2.89c0 .46-.43.89-.9.89zM2.7 9.33v4h12.6v-4h.45c.14.05.3-.04.45 0-.04-.01.03.01 0 0-.02-.01.03 0 0 0-.08-.01.08.02 0 0-.08.01.16-.01 0 0-.08.01.26.01.45 0 .19 0 .26.03.45 0V15.11c0 .46-.43.89-.9.89H2.7c-.47 0-.9-.43-.9-.89V9.33c.18.03.26 0 .45 0 .09 0 .35.01.45 0-.08.01.08-.01 0 0-.02 0 .03.01 0 0-.02-.01.03 0 0 0-.08-.01.16.02 0 0z" />
                  </svg>
                  {t('header.customerB2B', 'Business Customer')}
                </a>
              </>
            ) : (
              /* Mobile: horizontal scrollable category links placeholder */
              <div className="flex-1 overflow-x-auto scrollbar-none">
                <div className="flex gap-4 text-sm text-gray-600 whitespace-nowrap py-1">
                  {/* CMS Block: header_menu_links_v2 */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MegaMenu */}
      {isDesktop && isMegaMenuOpen && <MegaMenu isOpen={isMegaMenuOpen} />}
    </header>
  );
}
