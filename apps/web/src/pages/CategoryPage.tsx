import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'isomorphic-dompurify';
import { GET_PRODUCTS, GET_CATEGORY_DATA, GET_CATEGORY_BY_URL_PATH, GET_FILTER_INPUTS } from '../queries/catalog';
import ProductGrid from '../components/catalog/ProductGrid';
import FilterSidebar from '../components/catalog/FilterSidebar';
import FilterModal from '../components/catalog/FilterModal';
import ProductSort from '../components/catalog/ProductSort';
import Pagination from '../components/ui/Pagination';
import { CmsBlock } from '@/components/cms/CmsBlock';
import { gqlClient } from '@/lib/graphql-client';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import BreadcrumbStructuredData from '@/components/seo/BreadcrumbStructuredData';
import BackToTopButton from '@/components/common/BackToTopButton';

// Magento url_path already includes "category/" prefix — strip it to avoid double prefix
const toCategoryPath = (urlPath?: string) =>
  `/category/${(urlPath || '').replace(/^category\//, '')}`;
const PAGE_SIZE = 24;


const CategoryPage: React.FC = () => {
  const { '*': splat } = useParams();
  // Strip .html suffix if present — handle null splat
  const rawId = (splat || '')?.replace(/\.html$/, '') || '';
  // Detect if it's a base64 UID (contains = or is short alphanumeric) vs URL path
  const isUid = /^[A-Za-z0-9+/]+=*$/.test(rawId) && rawId.length <= 20;
  const categoryId = rawId;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (sessionStorage.getItem('viewMode') as 'grid' | 'list') || 'grid';
  });

  const isInfiniteScroll = searchParams.get('scroll') === 'infinite';

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortAttribute = searchParams.get('sort_attribute') || 'position';
  const sortDirection = searchParams.get('sort_direction') || 'ASC';

  // Infinite scroll state
  const [infinitePage, setInfinitePage] = useState(1);
  const [accumulatedProducts, setAccumulatedProducts] = useState<any[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch category data - by UID or URL path
  // Magento stores url_path as "category/slug" — prepend prefix for the query
  const urlPathForQuery = isUid ? categoryId : `category/${categoryId}`;
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => isUid
      ? gqlClient.request(GET_CATEGORY_DATA, { id: categoryId })
      : gqlClient.request(GET_CATEGORY_BY_URL_PATH, { urlPath: urlPathForQuery }),
    enabled: !!categoryId,
  });

  const category = categoryData?.categories?.items?.[0];
  // Use category UID for product queries (may differ from URL-based categoryId)
  const categoryUid = category?.uid || (isUid ? categoryId : null);

  // Get filter inputs for type mapping
  const { data: filterInputsData } = useQuery({
    queryKey: ['filterInputs'],
    queryFn: () => gqlClient.request(GET_FILTER_INPUTS),
    staleTime: Infinity,
  });

  // Build filter type map
  const filterTypeMap = useMemo(() => {
    const typeMap = new Map<string, string>();
    if (filterInputsData?.__type?.inputFields) {
      filterInputsData.__type.inputFields.forEach((field: any) => {
        typeMap.set(field.name, field.type.name);
      });
    }
    return typeMap;
  }, [filterInputsData]);

  // Parse filters from URL
  const filters = useMemo(() => {
    const filterObj: any = {
      category_uid: { eq: categoryUid },
    };

    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_')) {
        const filterKey = key.replace('filter_', '');
        const filterType = filterTypeMap.get(filterKey);

        if (filterType === 'FilterRangeTypeInput') {
          const [from, to] = value.split('_');
          filterObj[filterKey] = { from, to };
        } else if (filterType === 'FilterEqualTypeInput') {
          filterObj[filterKey] = { eq: value };
        } else {
          // Default to 'in' for multi-select
          filterObj[filterKey] = { in: value.split(',') };
        }
      }
    });

    return filterObj;
  }, [searchParams, categoryUid, filterTypeMap]);

  // Fetch products
  const activePage = isInfiniteScroll ? infinitePage : currentPage;
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', categoryUid, activePage, filters, sortAttribute, sortDirection],
    queryFn: () =>
      gqlClient.request(GET_PRODUCTS, {
        currentPage: activePage,
        filters,
        pageSize: PAGE_SIZE,
        sort: { [sortAttribute]: sortDirection },
      }),
    enabled: !!categoryUid && filterTypeMap.size > 0,
  });

  const products = productsData?.products?.items || [];
  const totalCount = productsData?.products?.total_count || 0;
  const totalPages = productsData?.products?.page_info?.total_pages || 1;
  const aggregations = productsData?.products?.aggregations || [];
  const sortFields = productsData?.products?.sort_fields?.options || [];

  // Accumulate products for infinite scroll
  useEffect(() => {
    if (!isInfiniteScroll) return;
    if (productsLoading || products.length === 0) return;
    setAccumulatedProducts((prev) => {
      // Reset on page 1 (filter/sort change)
      if (infinitePage === 1) return products;
      return [...prev, ...products];
    });
    setIsFetchingMore(false);
  }, [productsData, isInfiniteScroll, infinitePage, productsLoading]);

  // Reset infinite scroll when filters/sort change
  useEffect(() => {
    if (!isInfiniteScroll) return;
    setInfinitePage(1);
    setAccumulatedProducts([]);
  }, [filters, sortAttribute, sortDirection, isInfiniteScroll]);

  // IntersectionObserver sentinel
  const loadMore = useCallback(() => {
    if (isFetchingMore || productsLoading) return;
    if (infinitePage >= totalPages) return;
    setIsFetchingMore(true);
    setInfinitePage((p) => p + 1);
  }, [isFetchingMore, productsLoading, infinitePage, totalPages]);

  useEffect(() => {
    if (!isInfiniteScroll || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isInfiniteScroll, loadMore]);

  const displayProducts = isInfiniteScroll ? accumulatedProducts : products;

  const isLoading = categoryLoading || (productsLoading && (isInfiniteScroll ? infinitePage === 1 : true));

  // Handle page change
  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', page.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (attribute: string, direction: string) => {
    setSearchParams((prev) => {
      prev.set('sort_attribute', attribute);
      prev.set('sort_direction', direction);
      prev.delete('page'); // Reset to page 1
      return prev;
    });
  };

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: string | null) => {
    setSearchParams((prev) => {
      if (value) {
        prev.set(`filter_${filterKey}`, value);
      } else {
        prev.delete(`filter_${filterKey}`);
      }
      prev.delete('page'); // Reset to page 1
      return prev;
    });
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams();
      // Keep only non-filter params
      prev.forEach((value, key) => {
        if (!key.startsWith('filter_')) {
          newParams.set(key, value);
        }
      });
      newParams.delete('page'); // Reset to page 1
      return newParams;
    });
  };

  // Toggle view mode
  const toggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    sessionStorage.setItem('viewMode', mode);
  };

  // Category description state
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState('126px');
  const contentRef = useRef<HTMLDivElement>(null);

  const descriptionText = category?.description
    ? category.description
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<\/?[^>]+(>|$)/g, '')
    : '';

  const toggleDescription = () => {
    setDescriptionExpanded(!descriptionExpanded);
  };

  useEffect(() => {
    if (descriptionExpanded && contentRef.current) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight('126px');
    }
  }, [descriptionExpanded]);

  return (
    <div className={`products-display-mode-${viewMode}`}>
      {/* SEO Meta Tags */}
      {category && (
        <Helmet>
          <title>{category.meta_title || category.name}</title>
          <meta
            name="description"
            content={
              category.meta_description ||
              (descriptionText ? descriptionText.slice(0, 160) : `${category.name} - Mua sắm tại MM Mega Market`)
            }
          />
          {category.meta_keywords && <meta name="keywords" content={category.meta_keywords} />}
          <meta property="og:title" content={category.meta_title || category.name} />
          {category.meta_description && <meta property="og:description" content={category.meta_description} />}
          {category.image && <meta property="og:image" content={category.image} />}
          <meta property="og:type" content="website" />
        </Helmet>
      )}
      {/* Breadcrumb Structured Data */}
      {category && (
        <BreadcrumbStructuredData
          items={[
            { name: 'Trang chủ', url: '/' },
            ...(category.breadcrumbs?.map((crumb: any) => ({
              name: crumb.category_name,
              url: toCategoryPath(crumb.category_url_path || crumb.category_url_key),
            })) || []),
            { name: category.name, url: toCategoryPath(category.url_path || category.url_key) },
          ]}
        />
      )}
      {/* Breadcrumbs */}
      {category && (
        <Breadcrumbs
          items={[
            ...(category.breadcrumbs?.map((crumb: any) => ({
              label: crumb.category_name,
              path: toCategoryPath(crumb.category_url_path || crumb.category_url_key),
            })) || []),
            { label: category.name },
          ]}
        />
      )}

      <article className="container mx-auto px-4 py-6">
        {/* Category Image */}
        {category?.category_menu_background && (
          <div className="mb-6">
            <img
              src={category.category_menu_background}
              alt={category.name}
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Category Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {isLoading ? (
              <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
            ) : (
              <>
                {category?.name}
              </>
            )}
          </h1>
          <div className="text-gray-600">
            {isLoading ? (
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              totalCount > 0 && <span>{totalCount} sản phẩm</span>
            )}
          </div>
        </div>

        {/* Category Top CMS Block */}
        {category?.uid && (
          <CmsBlock identifiers={[`category-top-${category.uid}`, 'category-top']} className="mb-4" />
        )}

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              filters={aggregations}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearFilters}
              isLoading={isLoading}
            />
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {/* Filter Button - Mobile */}
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-sm hover:border-[#0272BA] hover:text-[#0272BA] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
                  </svg>
                  Bộ lọc
                </button>

                {/* Sort */}
                <ProductSort
                  sortFields={sortFields}
                  currentSort={{ attribute: sortAttribute, direction: sortDirection }}
                  onSortChange={handleSortChange}
                  isLoading={isLoading}
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 border border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => toggleViewMode('grid')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === 'grid' ? 'bg-[#0272BA] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  aria-label="Grid View"
                  title="Lưới"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="0" y="0" width="7" height="7" rx="1" /><rect x="9" y="0" width="7" height="7" rx="1" />
                    <rect x="0" y="9" width="7" height="7" rx="1" /><rect x="9" y="9" width="7" height="7" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleViewMode('list')}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === 'list' ? 'bg-[#0272BA] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                  aria-label="List View"
                  title="Danh sách"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="0" y="0" width="16" height="3" rx="1" /><rect x="0" y="6" width="16" height="3" rx="1" />
                    <rect x="0" y="12" width="16" height="3" rx="1" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Pagination Top — hidden in infinite scroll mode */}
            {!isInfiniteScroll && totalPages > 1 && (
              <div className="mb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid
              products={displayProducts}
              isLoading={isLoading}
              viewMode={viewMode}
            />

            {/* No Products */}
            {!isLoading && displayProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-xl font-medium text-gray-700 mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-500 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                {Object.keys(filters).length > 1 && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-4 py-2 text-sm text-[#0272BA] border border-[#0272BA] rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            )}

            {/* Pagination Bottom — hidden in infinite scroll mode */}
            {!isInfiniteScroll && totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Infinite scroll sentinel + spinner */}
            {isInfiniteScroll && (
              <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
                {(isFetchingMore || (productsLoading && infinitePage > 1)) && (
                  <div className="w-8 h-8 border-4 border-[#0272BA] border-t-transparent rounded-full animate-spin" aria-label="Đang tải thêm sản phẩm" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category Bottom CMS Block */}
        {category?.uid && (
          <CmsBlock identifiers={[`category-bottom-${category.uid}`, 'category-bottom']} className="mt-8" />
        )}

        {/* Category Description */}
        {category?.description && (
          <div className="mt-8">
            {descriptionText.length > 320 ? (
              <div className={descriptionExpanded ? 'expanded' : 'collapsed'}>
                <div
                  ref={contentRef}
                  style={{ maxHeight, overflow: 'hidden', transition: 'max-height 0.3s ease' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(category.description) }}
                />
                <button
                  onClick={toggleDescription}
                  className="mt-2 text-[#0272BA] hover:underline"
                >
                  {descriptionExpanded ? 'Show Less' : 'Show More'}
                </button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(category.description) }} />
            )}
          </div>
        )}
      </article>

      {/* Filter Modal - Mobile */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={aggregations}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
      />
      <BackToTopButton />
    </div>
  );
};

export default CategoryPage;
