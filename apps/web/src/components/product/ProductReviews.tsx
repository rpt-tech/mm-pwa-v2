import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { gqlClient } from '@/lib/graphql-client';
import { GET_PRODUCT_REVIEWS, CREATE_PRODUCT_REVIEW } from '@/queries/product';
import { useAuthStore } from '@/stores/authStore';

interface ProductReviewsProps {
  sku: string;
  productName?: string;
}

export default function ProductReviews({ sku }: ProductReviewsProps) {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    summary: '',
    text: '',
    rating: 5,
  });

  // Fetch reviews
  const { data, isLoading } = useQuery({
    queryKey: ['productReviews', sku, currentPage],
    queryFn: () => gqlClient.request(GET_PRODUCT_REVIEWS, { sku, currentPage, pageSize: 10 }),
    enabled: !!sku,
  });

  const product = data?.products?.items?.[0];
  const reviews = product?.reviews?.items || [];
  const pageInfo = product?.reviews?.page_info;
  const reviewCount = product?.review_count || 0;

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (input: any) => gqlClient.request(CREATE_PRODUCT_REVIEW, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', sku] });
      setShowReviewForm(false);
      setFormData({ nickname: '', summary: '', text: '', rating: 5 });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    createReviewMutation.mutate({
      sku,
      nickname: formData.nickname,
      summary: formData.summary,
      text: formData.text,
      ratings: [
        {
          id: 'Rating', // Default rating ID
          value_id: formData.rating.toString(),
        },
      ],
    });
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {t('product.reviews', 'Reviews')} ({reviewCount})
        </h2>
        {isLoggedIn && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-[#006341] text-white rounded-lg hover:bg-[#004d32]"
          >
            {t('product.writeReview', 'Write a Review')}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{t('product.writeReview', 'Write a Review')}</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('product.rating', 'Rating')}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${rating <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('product.nickname', 'Nickname')}</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('product.reviewSummary', 'Summary')}</label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('product.reviewText', 'Review')}</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="px-6 py-2 bg-[#006341] text-white rounded-lg hover:bg-[#004d32] disabled:opacity-50"
            >
              {createReviewMutation.isPending ? t('common.loading') : t('product.submitReview', 'Submit Review')}
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>

          {createReviewMutation.isError && (
            <p className="text-red-600 text-sm mt-2">
              {t('product.reviewError', 'Failed to submit review. Please try again.')}
            </p>
          )}
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          {t('product.noReviews', 'No reviews yet. Be the first to review this product!')}
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review: any, index: number) => (
            <div key={index} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(Math.round(review.average_rating), 'sm')}
                    <span className="text-sm font-semibold">{review.nickname}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <h4 className="font-semibold mb-2">{review.summary}</h4>
              <p className="text-gray-700">{review.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageInfo && pageInfo.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            {t('common.previous', 'Previous')}
          </button>
          <span className="px-4 py-2">
            {currentPage} / {pageInfo.total_pages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pageInfo.total_pages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            {t('common.next', 'Next')}
          </button>
        </div>
      )}
    </div>
  );
}
