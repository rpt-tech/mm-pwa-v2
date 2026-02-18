import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GET_AUTOCOMPLETE_RESULTS } from '@/queries/catalog';
import { gqlClient } from '@/lib/graphql-client';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/uiStore';
import { ChevronDown, Search, X } from 'lucide-react';
import MegaMenu from '@/components/navigation/MegaMenu';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { drawer, toggleDrawer, openNav, openMiniCart } = useUIStore();

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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Header Top - CMS Block placeholder */}
      <div className="bg-gray-100 py-2 text-center text-sm">
        {/* CMS Block: header_top_b2c */}
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Mobile Menu Trigger */}
          {!isDesktop && (
            <button
              onClick={openNav}
              className="p-2 hover:bg-gray-100 rounded"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="MM Vietnam"
              className="h-10"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"%3E%3Ctext x="10" y="25" font-family="Arial" font-size="20" fill="%23333"%3EMM Vietnam%3C/text%3E%3C/svg%3E';
              }}
            />
          </Link>

          {/* Store Switcher (Desktop) */}
          {isDesktop && (
            <div className="ml-4">
              {/* Store Switcher placeholder */}
            </div>
          )}

          {/* Search Bar with Autocomplete */}
          <div className="flex-1 mx-4 max-w-2xl relative">
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
                    if (searchQuery.length >= 3) {
                      setIsAutocompleteOpen(true);
                    }
                  }}
                  placeholder={t('searchBar.placeholder', 'What are you looking for?')}
                  className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="p-2 hover:bg-gray-100 rounded"
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {isAutocompleteOpen && searchQuery.length >= 3 && (
              <div
                ref={autocompleteRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
              >
                {autocompleteLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    {t('autocomplete.loading', 'Loading...')}
                  </div>
                ) : suggestions.length > 0 ? (
                  <div>
                    <div className="p-2 text-xs text-gray-500 border-b">
                      {t('autocomplete.suggestions', 'Suggestions')}
                    </div>
                    {suggestions.map((product: any) => (
                      <button
                        key={product.uid}
                        onClick={() => handleSuggestionClick(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0 text-left"
                      >
                        <img
                          src={product.small_image?.url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {product.ecom_name || product.name}
                          </p>
                          {product.unit_ecom && (
                            <p className="text-xs text-gray-500">{product.unit_ecom}</p>
                          )}
                          <p className="text-sm font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: product.price?.regularPrice?.amount?.currency || 'VND'
                            }).format(product.price?.regularPrice?.amount?.value || 0)}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full p-3 text-center text-sm text-blue-600 hover:bg-gray-50 font-medium"
                    >
                      {t('autocomplete.viewAll', `View all results for "${searchQuery}"`)}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {t('autocomplete.emptyResult', 'No results were found.')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-4">
            {isDesktop && (
              <>
                {/* Quick Order - shown only when signed in */}
                {/* <Link to="/quick-order" className="text-sm hover:text-blue-600">
                  {t('global.quickOrder', 'Quick order')}
                </Link> */}

                {/* Wishlist */}
                <button className="p-2 hover:bg-gray-100 rounded relative">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* Account */}
                <Link
                  to="/sign-in"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm">{t('accountTrigger.buttonFallback', 'My Account')}</span>
                </Link>
              </>
            )}

            {/* Cart */}
            <button
              onClick={isDesktop ? openMiniCart : () => window.location.href = '/cart'}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded relative"
            >
              {isDesktop && (
                <span className="text-sm">{t('cartTrigger.label', 'My Cart')}</span>
              )}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {/* Cart count badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {isDesktop && (
              <>
                {/* Category Menu Button */}
                <button
                  onClick={handleMegaMenu}
                  className={`flex items-center gap-2 px-4 py-2 rounded ${
                    isMegaMenuOpen ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{t('header.menuButton', 'Category')}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* CMS Menu Links */}
                <div className="flex-1 mx-4">
                  {/* CMS Block: header_menu_links_v2 */}
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-4">
                  <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                    <option value="vi">VI</option>
                    <option value="en">EN</option>
                  </select>

                  {/* Business Customer Link */}
                  <a
                    href="https://mmpro.vn/"
                    className="text-sm px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {t('header.customerB2B', 'Business Customer')}
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MegaMenu */}
      {isDesktop && isMegaMenuOpen && <MegaMenu isOpen={isMegaMenuOpen} />}
    </header>
  );
}
