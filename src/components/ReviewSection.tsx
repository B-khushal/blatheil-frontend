import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  image_url?: string | null;
  customer_name: string;
  is_verified_purchase: boolean;
  created_at: string;
  helpful_count: number;
}

type RatingDistribution = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

interface ReviewSectionProps {
  productId: string;
  onWriteReview?: () => void;
}

export const ReviewSection = ({ productId, onWriteReview }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(
        `${API_URL}/reviews/product/${productId}?page=${page}&limit=5&sortBy=${sortBy}`
      );

      if (!res.ok) throw new Error('Failed to fetch reviews');

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
        setAverageRating(data.productRating.average);
        setTotalReviews(data.productRating.totalReviews);
        const rawDistribution = data?.productRating?.distribution || {};
        setRatingDistribution({
          5: Number(rawDistribution?.[5] ?? rawDistribution?.['5'] ?? 0),
          4: Number(rawDistribution?.[4] ?? rawDistribution?.['4'] ?? 0),
          3: Number(rawDistribution?.[3] ?? rawDistribution?.['3'] ?? 0),
          2: Number(rawDistribution?.[2] ?? rawDistribution?.['2'] ?? 0),
          1: Number(rawDistribution?.[1] ?? rawDistribution?.['1'] ?? 0)
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, page, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHelpful = async (reviewId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (res.ok) {
        // Update local review count
        setReviews(prev =>
          prev.map(r =>
            r._id === reviewId
              ? { ...r, helpful_count: r.helpful_count + 1 }
              : r
          )
        );
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ reportReason: reason })
      });

      if (res.ok) {
        alert('Review reported successfully. Thank you for helping us maintain community standards.');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
    }
  };

  const getRatingPercentage = (rating: number) => {
    const safeDistribution: RatingDistribution = {
      5: Number(ratingDistribution[5] || 0),
      4: Number(ratingDistribution[4] || 0),
      3: Number(ratingDistribution[3] || 0),
      2: Number(ratingDistribution[2] || 0),
      1: Number(ratingDistribution[1] || 0)
    };

    const total = Object.values(safeDistribution).reduce((a, b) => a + Number(b || 0), 0);
    if (total <= 0) {
      return 0;
    }

    const currentCount = Number(safeDistribution[rating as keyof RatingDistribution] || 0);
    return Math.round((currentCount / total) * 100);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="inline-block"
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-3xl font-heading font-bold uppercase mb-8">Customer Reviews</h2>

      {/* Rating Summary */}
      {totalReviews > 0 && (
        <div className="mb-12 pb-8 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Average Rating */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                  <div className="flex gap-1 justify-center mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(averageRating)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium w-12">{rating} ★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">
                    {getRatingPercentage(rating)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {['latest', 'highest', 'lowest', 'helpful'].map(option => (
            <button
              key={option}
              onClick={() => {
                setSortBy(option);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-heading uppercase tracking-wider rounded-sm transition-colors ${
                sortBy === option
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6 mb-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-border rounded-sm p-6 hover:bg-muted/50 transition-colors"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {/* Rating */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    {review.is_verified_purchase && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-wider font-heading">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h3 className="font-heading font-semibold text-lg uppercase">{review.title}</h3>
                  )}
                </div>
              </div>

              {/* Review Body */}
              <div className="mb-4">
                <p className="text-foreground/80 leading-relaxed">
                  {expandedReview === review._id
                    ? review.comment
                    : review.comment.substring(0, 300) + (review.comment.length > 300 ? '...' : '')}
                </p>
                {review.image_url && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setZoomedImageUrl(review.image_url || null)}
                      className="block"
                    >
                      <img
                        src={review.image_url}
                        alt="Customer uploaded review"
                        className="w-full max-w-md h-56 object-cover rounded-sm border border-border cursor-zoom-in hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    </button>
                  </div>
                )}
                {review.comment.length > 300 && (
                  <button
                    onClick={() =>
                      setExpandedReview(expandedReview === review._id ? null : review._id)
                    }
                    className="text-sm text-primary hover:text-primary/80 mt-2 font-medium"
                  >
                    {expandedReview === review._id ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>

              {/* Review Footer */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">{review.customer_name}</p>
                  <p>
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review._id)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs">{review.helpful_count}</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Report reason: spam, offensive, fake, irrelevant, or other');
                      if (reason && ['spam', 'offensive', 'fake', 'irrelevant', 'other'].includes(reason)) {
                        handleReportReview(review._id, reason);
                      }
                    }}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-border rounded-sm disabled:opacity-50 hover:bg-muted transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-4">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-sm font-heading transition-colors ${
                  page === i + 1
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-border rounded-sm disabled:opacity-50 hover:bg-muted transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Call to Action */}
      {user && (
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground mb-4">Have you used this product?</p>
          <button
            type="button"
            onClick={() => {
              if (onWriteReview) {
                onWriteReview();
                return;
              }

              const el = document.getElementById(`review-form-${productId}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm rounded-sm hover:opacity-90 transition-opacity"
          >
            Write a Review
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-500/10 text-red-600 rounded-sm">
          {error}
        </div>
      )}

      {zoomedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 p-4 md:p-8 flex items-center justify-center"
          onClick={() => setZoomedImageUrl(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedImageUrl(null)}
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomedImageUrl}
            alt="Zoomed review upload"
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-sm"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};
