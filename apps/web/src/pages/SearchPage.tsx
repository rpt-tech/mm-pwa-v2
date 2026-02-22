import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'isomorphic-dompurify';
import { PRODUCT_SEARCH, GET_PAGE_SIZE, GET_SEARCH_PAGE_META, SEARCH_QUERY_DESCRIPTION, GET_SEARCH_TERM_DATA } from '@/queries/catalog';
import { useTranslation } from 'react-i18next';
import { gqlClient } from '@/lib/graphql-client';
import { analytics } from '@/lib/analytics';
import ProductCard from '@/components/catalog/ProductCard';
import SearchPopular from '@/components/navbar/SearchPopular';
import BackToTopButton from '@/components/common/BackToTopButton';

export default function SearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [sortAttribute, setSortAttribute] = useState('relevance');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState<string[]>([]);

  // Track search event
  useEffect(() => {
    if (searchTerm) analytics.search(searchTerm);
  }, [searchTerm]);

  // Handle search term redirect (Magento configured redirects)
  const { data: searchTermData } = useQuery({
    queryKey: ['searchTermData', searchTerm],
    queryFn: () => gqlClient.request(GET_SEARCH_TERM_DATA, { search: searchTerm }),
    enabled: !!searchTerm,
    staleTime: 300000,
  });
  useEffect(() => {
    const redirect = searchTermData?.searchTerm?.redirect;
    if (redirect) navigate(redirect, { replace: true });
  }, [searchTermData, navigate]);

  // Get page size
  const { data: pageSizeData } = useQuery({
    queryKey: ['pageSize'],
    queryFn: () => gqlClient.request(GET_PAGE_SIZE),
    staleTime: Infinity,
  });

  // Get meta data
  const { data: metaData } = useQuery({
    queryKey: ['searchPageMeta'],
    queryFn: () => gqlClient.request(GET_SEARCH_PAGE_META),
    staleTime: 300000,
  });

  // Get search query description (CMS-managed SEO text)
  const { data: descriptionData } = useQuery({
    queryKey: ['searchQueryDescription', searchTerm],
    queryFn: () => gqlClient.request(SEARCH_QUERY_DESCRIPTION, { keyword: searchTerm }),
    enabled: !!searchTerm,
    staleTime: 300000,
  });
  const searchDescription = descriptionData?.searchQueryDescription?.description || '';

  const pageSize = pageSizeData?.storeConfig?.grid_per_page || 24;

  // Build filters
  const filters = useMemo(() => {
    const baseFilters: any = {};

    if (categoryFilter.length > 0) {
      baseFilters.category_uid = { in: categoryFilter };
    }

    if (brandFilter.length > 0) {
      baseFilters.mm_brand = { in: brandFilter };
    }

    return baseFilters;
  }, [categoryFilter, brandFilter]);

  // Search products
  const { isLoading: loading, error, data } = useQuery({
    queryKey: ['productSearch', searchTerm, currentPage, filters, sortAttribute, sortDirection, pageSize],
    queryFn: () => gqlClient.request(PRODUCT_SEARCH, {
      currentPage,
      inputText: searchTerm,
      pageSize,
      filters,
      sort: { [sortAttribute]: sortDirection },
      asmUid: '',
      phoneNumber: ''
    }),
    enabled: !!searchTerm,
    staleTime: 30000,
  });

  const products = data?.products?.items || [];
  const totalCount = data?.products?.total_count || 0;
  const totalPages = data?.products?.page_info?.total_pages || 1;
  const aggregations = data?.products?.aggregations || [];

  // Get category and brand options from aggregations
  const categoryOptions = useMemo(() => {
    const catAgg = aggregations.find((agg: any) => agg.attribute_code === 'category_uid');
    return catAgg?.options || [];
  }, [aggregations]);

  const brandOptions = useMemo(() => {
    const brandAgg = aggregations.find((agg: any) => agg.attribute_code === 'mm_brand');
    return brandAgg?.options || [];
  }, [aggregations]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams({ query: searchTerm, page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [attr, dir] = e.target.value.split('_');
    setSortAttribute(attr || 'relevance');
    setSortDirection(dir || 'DESC');
  };

  // Meta tags
  const metaTitle = metaData?.storeConfig?.search_page_meta_title ||
    `${searchTerm} - Tìm kiếm | MM Mega Market`;

  const metaDescription = metaData?.storeConfig?.search_page_meta_description ||
    `Mua ${searchTerm} giá tốt tại MM Mega Market. Giao hàng nhanh toàn quốc.`;

  // Helmet handles title/meta

  // No search term — show popular searches
  if (!searchTerm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Tìm kiếm sản phẩm</h1>
        <SearchPopular />
      </div>
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-200 h-80 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold mb-4">
            {t('searchPage.noResult', 'No results found. The search term may be missing or invalid.')}
          </h1>
        </div>
      </div>
    );
  }

  // No results
  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy kết quả cho <strong>"{searchTerm}"</strong>
          </h1>
          <p className="text-gray-500 text-sm mb-6">Thử tìm với từ khóa khác hoặc xem các từ khóa phổ biến</p>
          <SearchPopular />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="text-[#0272BA] hover:underline">
              {t('global.home', 'Home')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-600">
            {t('searchPage.breadcrumbTitle', `Results for: ${searchTerm}`)}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {t('searchPage.searchTerm', `Showing results for "${searchTerm}"`)}
        </h1>
        <p className="text-gray-600">
          {t('searchPage.totalPages', `${totalCount} items`)}
        </p>
        {searchDescription && (
          <div className="mt-3 text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(searchDescription) }} />
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold text-lg mb-4">
              {t('filterModal.headerTitle', 'Filters')}
            </h2>

            {/* Category Filter */}
            {categoryOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">
                  {t('header.menuButton', 'Category')}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categoryOptions.map((option: any) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={categoryFilter.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategoryFilter([...categoryFilter, option.value]);
                          } else {
                            setCategoryFilter(categoryFilter.filter(v => v !== option.value));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Filter */}
            {brandOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">
                  {t('filter.brand', 'Brand')}
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brandOptions.map((option: any) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brandFilter.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBrandFilter([...brandFilter, option.value]);
                          } else {
                            setBrandFilter(brandFilter.filter(v => v !== option.value));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">
              {t('searchPage.totalPages', `${totalCount} items`)}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                {t('productSort.sortButton', 'Sort by')}:
                <select
                  value={`${sortAttribute}_${sortDirection}`}
                  onChange={handleSortChange}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  <option value="relevance_DESC">{t('sortItem.relevance', 'Best Match')}</option>
                  <option value="name_ASC">{t('sortItem.nameAsc', 'Name A-Z')}</option>
                  <option value="name_DESC">{t('sortItem.nameDesc', 'Name Z-A')}</option>
                  <option value="price_ASC">{t('sortItem.priceAsc', 'Price Low to High')}</option>
                  <option value="price_DESC">{t('sortItem.priceDesc', 'Price High to Low')}</option>
                </select>
              </label>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {products.map((product: any) => (
              <ProductCard key={product.uid} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                {t('pagination.previous', 'Previous')}
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border rounded ${
                      currentPage === pageNum
                        ? 'bg-[#0272BA] text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                {t('pagination.next', 'Next')}
              </button>
            </div>
          )}
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
}
