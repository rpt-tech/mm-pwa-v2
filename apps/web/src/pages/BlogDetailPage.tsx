import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { GET_BLOG_DETAIL, INCREASE_BLOG_VIEW, GET_BLOG_LIST } from '@/queries/blog';
import RichContent from '@/components/cms/RichContent';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

function BlogCard({ post }: { post: any }) {
  const date = post.publish_date
    ? new Date(post.publish_date).toLocaleDateString('vi-VN')
    : '';
  return (
    <Link
      to={`/blog/${post.url_key}`}
      className="flex gap-3 group"
    >
      <img
        src={post.image_thumb || post.image || '/placeholder.png'}
        alt={post.title}
        className="w-20 h-16 object-cover rounded flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-[#0272BA] transition-colors">
          {post.title}
        </p>
        {date && <p className="text-xs text-gray-400 mt-1">{date}</p>}
      </div>
    </Link>
  );
}

export default function BlogDetailPage() {
  const { urlKey } = useParams<{ urlKey: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['blogDetail', urlKey],
    queryFn: () => gqlClient.request(GET_BLOG_DETAIL, { urlKey }),
    enabled: !!urlKey,
    staleTime: 5 * 60 * 1000,
  });

  // Recent posts for sidebar
  const { data: recentData } = useQuery({
    queryKey: ['blogList', 1, 5],
    queryFn: () => gqlClient.request(GET_BLOG_LIST, {
      currentPage: 1,
      pageSize: 5,
      sort: { publish_date: 'DESC' },
    }),
    staleTime: 5 * 60 * 1000,
  });

  const increaseViewMutation = useMutation({
    mutationFn: () => gqlClient.request(INCREASE_BLOG_VIEW, { urlKey }),
  });

  const post = data?.blogList?.items?.[0];
  const recentPosts = recentData?.blogList?.items?.filter((p: any) => p.url_key !== urlKey).slice(0, 4) || [];

  // Increment view count once on mount
  useEffect(() => {
    if (post && urlKey) {
      increaseViewMutation.mutate();
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Bài viết không tồn tại.</p>
        <Link to="/blog" className="mt-4 inline-block text-[#0272BA] hover:underline">
          Quay lại danh sách tin tức
        </Link>
      </div>
    );
  }

  const date = post.publish_date
    ? new Date(post.publish_date).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Helmet>
        <title>{post.meta_title || post.title} | MM Mega Market</title>
        {post.meta_description && <meta name="description" content={post.meta_description} />}
        {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
      </Helmet>

      <Breadcrumbs />

      <div className="flex gap-8">
        {/* Main article */}
        <article className="flex-1 min-w-0">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm text-[#0272BA] hover:underline mb-4"
          >
            <ArrowLeft size={14} />
            Tin tức & Khuyến mãi
          </Link>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            {date && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {date}
              </span>
            )}
            {post.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {post.views} lượt xem
              </span>
            )}
          </div>

          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full rounded-lg mb-6 object-cover max-h-96"
            />
          )}

          <div className="prose prose-sm max-w-none">
            <RichContent html={post.content} />
          </div>
        </article>

        {/* Sidebar */}
        {recentPosts.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-700 mb-4">Bài viết mới nhất</h2>
              <div className="space-y-4">
                {recentPosts.map((p: any) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
