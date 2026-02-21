import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { GET_BLOG_LIST, GET_BLOG_CATEGORIES, GET_ARCHIVED_BLOG } from '@/queries/blog';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

const PAGE_SIZE = 12;

function BlogCard({ post }: { post: any }) {
  const date = post.publish_date
    ? new Date(post.publish_date).toLocaleDateString('vi-VN')
    : '';

  return (
    <Link
      to={`/blog/${post.url_key}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={post.image_thumb || post.image || '/placeholder.png'}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-[#0272BA] transition-colors">
          {post.title}
        </h2>
        {post.short_content && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.short_content}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {date && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {date}
            </span>
          )}
          {post.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {post.views}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['blogList', currentPage, PAGE_SIZE],
    queryFn: () => gqlClient.request(GET_BLOG_LIST, {
      currentPage,
      pageSize: PAGE_SIZE,
      sort: { publish_date: 'DESC' },
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['blogCategories'],
    queryFn: () => gqlClient.request(GET_BLOG_CATEGORIES),
    staleTime: 10 * 60 * 1000,
  });

  const { data: archivedData } = useQuery({
    queryKey: ['archivedBlog'],
    queryFn: () => gqlClient.request(GET_ARCHIVED_BLOG),
    staleTime: 10 * 60 * 1000,
  });

  const posts = data?.blogList?.items || [];
  const pageInfo = data?.blogList?.page_info;
  const totalPages = pageInfo?.total_pages || 1;
  const categories = categoriesData?.blogCategory?.categories || [];
  const archivedBlogs = archivedData?.archivedBlog?.archived_blogs || [];

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Helmet>
        <title>Tin tức & Khuyến mãi | MM Mega Market</title>
        <meta name="description" content="Cập nhật tin tức mới nhất, khuyến mãi hấp dẫn từ MM Mega Market" />
      </Helmet>

      <Breadcrumbs />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tin tức & Khuyến mãi</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        {categories.length > 0 && (
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Danh mục</h2>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                      !selectedCategory ? 'bg-[#0272BA] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Tất cả
                  </button>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.url_key)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                        selectedCategory === cat.url_key
                          ? 'bg-[#0272BA] text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cat.name}
                      {cat.blog_count > 0 && (
                        <span className="ml-1 text-xs opacity-70">({cat.blog_count})</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {archivedBlogs.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                <h2 className="font-semibold text-gray-700 mb-3">Lưu trữ</h2>
                <ul className="space-y-1">
                  {archivedBlogs.map((archive: any) => (
                    <li key={archive.date}>
                      <Link
                        to={`/blog/search?date=${archive.date}`}
                        className="text-sm text-[#0272BA] hover:underline flex justify-between"
                      >
                        <span>{archive.name}</span>
                        <span className="text-gray-400">({archive.blog_count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>Chưa có bài viết nào.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {posts.map((post: any) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded disabled:opacity-40 hover:bg-gray-100"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded border text-sm ${
                          currentPage === pageNum
                            ? 'bg-[#0272BA] text-white border-[#0272BA]'
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
                    className="p-2 border rounded disabled:opacity-40 hover:bg-gray-100"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
