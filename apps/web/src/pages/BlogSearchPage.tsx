import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Eye } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { GET_SEARCH_NEWS } from '@/queries/blog';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function BlogSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const searchTerm = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['blogSearch', searchTerm, page],
    queryFn: () =>
      gqlClient.request(GET_SEARCH_NEWS, {
        search: searchTerm,
        date: '',
        categoryId: '',
        currentPage: page,
        pageSize: PAGE_SIZE,
      }),
    enabled: !!searchTerm,
    staleTime: 2 * 60 * 1000,
  });

  const items = data?.searchNews?.items || [];
  const pageInfo = data?.searchNews?.page_info;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
      setPage(1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Helmet>
        <title>{searchTerm ? `Tìm kiếm "${searchTerm}" | Tin tức MM` : 'Tìm kiếm tin tức | MM Mega Market'}</title>
      </Helmet>

      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-800 mb-4">Tìm kiếm tin tức</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-xl">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Nhập từ khóa tìm kiếm..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#0272BA]"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-[#0272BA] text-white rounded-lg text-sm hover:bg-[#005a9e] transition-colors"
        >
          <Search size={16} />
          Tìm kiếm
        </button>
      </form>

      {searchTerm && (
        <p className="text-sm text-gray-500 mb-4">
          {isLoading ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm cho "${searchTerm}": ${items.length} bài viết`}
        </p>
      )}

      {!searchTerm && (
        <p className="text-gray-500 text-center py-12">Nhập từ khóa để tìm kiếm bài viết</p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3" />
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
              <div className="bg-gray-200 h-3 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && searchTerm && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Không tìm thấy bài viết nào phù hợp</p>
          <Link to="/blog" className="text-[#0272BA] hover:underline text-sm">
            Xem tất cả bài viết
          </Link>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((post: any) => (
              <Link
                key={post.id}
                to={`/blog/${post.url_key}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.image_thumb && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image_thumb}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-[#0272BA]">
                    {post.title}
                  </h2>
                  {post.short_content && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.short_content}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {post.publish_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(post.publish_date)}
                      </span>
                    )}
                    {post.views != null && (
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.views}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pageInfo && pageInfo.total_pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {page} / {pageInfo.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageInfo.total_pages, p + 1))}
                disabled={page === pageInfo.total_pages}
                className="px-4 py-2 border border-gray-200 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
