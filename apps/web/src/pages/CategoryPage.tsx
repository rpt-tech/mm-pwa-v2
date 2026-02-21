import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GET_PRODUCTS, GET_CATEGORY_DATA, GET_FILTER_INPUTS } from '../queries/catalog';
import ProductGrid from '../components/catalog/ProductGrid';
import FilterSidebar from '../components/catalog/FilterSidebar';
import FilterModal from '../components/catalog/FilterModal';
import ProductSort from '../components/catalog/ProductSort';
import Pagination from '../components/ui/Pagination';
import { gqlClient } from '@/lib/graphql-client';
const PAGE_SIZE = 24;


const CategoryPage: React.FC = () => {
  const { '*': splat } = useParams();
  const categoryId = splat;
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (sessionStorage.getItem('viewMode') as 'grid' | 'list') || 'grid';
  });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const sortAttribute = searchParams.get('sort_attribute') || 'position';
  const sortDirection = searchParams.get('sort_direction') || 'ASC';

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
      category_uid: { eq: categoryId },
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
  }, [searchParams, categoryId, filterTypeMap]);

  // Fetch category data
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => gqlClient.request(GET_CATEGORY_DATA, { id: categoryId }),
    enabled: !!categoryId,
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', categoryId, currentPage, filters, sortAttribute, sortDirection],
    queryFn: () =>
      gqlClient.request(GET_PRODUCTS, {
        currentPage,
        filters,
        pageSize: PAGE_SIZE,
        sort: { [sortAttribute]: sortDirection },
      }),
    enabled: !!categoryId && filterTypeMap.size > 0,
  });

  const category = categoryData?.categories?.items?.[0];
  const products = productsData?.products?.items || [];
  const totalCount = productsData?.products?.total_count || 0;
  const totalPages = productsData?.products?.page_info?.total_pages || 1;
  const aggregations = productsData?.products?.aggregations || [];
  const sortFields = productsData?.products?.sort_fields?.options || [];

  const isLoading = categoryLoading || productsLoading;

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
      {/* Breadcrumbs would go here */}

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
                <span className="text-lg font-normal text-gray-600 ml-2">
                  good price, home delivery
                </span>
              </>
            )}
          </h1>
          <div className="text-gray-600">
            {isLoading ? (
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
            ) : (
              totalCount > 0 && <span>{totalCount} Results</span>
            )}
          </div>
        </div>

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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                {/* Filter Button - Mobile */}
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="lg:hidden px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Filters
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
              <div className="flex gap-2">
                <button
                  onClick={() => toggleViewMode('grid')}
                  className={`px-3 py-2 rounded ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  aria-label="Grid View"
                >
                  Grid
                </button>
                <button
                  onClick={() => toggleViewMode('list')}
                  className={`px-3 py-2 rounded ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  aria-label="List View"
                >
                  List
                </button>
              </div>
            </div>

            {/* Pagination Top */}
            {totalPages > 1 && (
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
              products={products}
              isLoading={isLoading}
              viewMode={viewMode}
            />

            {/* No Products */}
            {!isLoading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No products found</p>
              </div>
            )}

            {/* Pagination Bottom */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Category Description */}
        {category?.description && (
          <div className="mt-8">
            {descriptionText.length > 320 ? (
              <div className={descriptionExpanded ? 'expanded' : 'collapsed'}>
                <div
                  ref={contentRef}
                  style={{ maxHeight, overflow: 'hidden', transition: 'max-height 0.3s ease' }}
                  dangerouslySetInnerHTML={{ __html: category.description }}
                />
                <button
                  onClick={toggleDescription}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  {descriptionExpanded ? 'Show Less' : 'Show More'}
                </button>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: category.description }} />
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
    </div>
  );
};

export default CategoryPage;
