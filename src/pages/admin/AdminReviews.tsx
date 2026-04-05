import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, EyeOff, Star, Pin, PinOff, X } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

interface Review {
  _id: string;
  product_id: {
    _id: string;
    name: string;
  };
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  title?: string;
  comment: string;
  image_url?: string | null;
  is_verified_purchase: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  is_visible: boolean;
  is_reported: boolean;
  report_reason?: string;
  moderation_status: string;
  created_at: string;
  helpful_count: number;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: '',
    userId: '',
    rating: '',
    moderation: '',
    isReported: false,
    searchTerm: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.moderation && { moderation: filters.moderation }),
        ...(filters.isReported && { isReported: 'true' })
      });

      const res = await fetch(`${API_URL}/reviews/admin/all?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch reviews');

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'Admin deleted review' })
      });

      if (!res.ok) throw new Error('Failed to delete review');

      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
      console.error(error);
    }
  };

  const handleUpdateReview = async (reviewId: string, updates: Partial<Review>) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/reviews/admin/${reviewId}/moderation`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moderationStatus: updates.moderation_status,
          isFeatured: updates.is_featured,
          isPinned: updates.is_pinned,
          isVisible: updates.is_visible
        })
      });

      if (!res.ok) throw new Error('Failed to update review');

      const data = await res.json();
      setReviews(prev =>
        prev.map(r => (r._id === reviewId ? { ...r, ...data.review } : r))
      );
      toast.success('Review updated');
    } catch (error) {
      toast.error('Failed to update review');
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.size === 0) {
      toast.error('Select reviews to delete');
      return;
    }

    if (!confirm(`Delete ${selectedReviews.size} reviews? This cannot be undone.`)) return;

    try {
      for (const reviewId of selectedReviews) {
        await handleDeleteReview(reviewId);
      }
      setSelectedReviews(new Set());
    } catch (error) {
      toast.error('Failed to delete some reviews');
    }
  };

  const getModerationBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-600';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600';
      case 'flagged':
        return 'bg-orange-500/20 text-orange-600';
      case 'rejected':
        return 'bg-red-500/20 text-red-600';
      default:
        return 'bg-gray-500/20 text-gray-600';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
        <h1 className="text-4xl font-heading font-bold uppercase mb-8">Review Management</h1>

        {/* Filters */}
        <div className="bg-muted p-6 rounded-sm space-y-4">
          <h3 className="font-heading font-semibold uppercase">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search reviews..."
              value={filters.searchTerm}
              onChange={e => {
                setFilters({ ...filters, searchTerm: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
            />

            <select
              value={filters.moderation}
              onChange={e => {
                setFilters({ ...filters, moderation: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.rating}
              onChange={e => {
                setFilters({ ...filters, rating: e.target.value });
                setPage(1);
              }}
              className="px-4 py-2 bg-background border border-border rounded-sm focus:outline-none focus:border-primary"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.isReported}
                onChange={e => {
                  setFilters({ ...filters, isReported: e.target.checked });
                  setPage(1);
                }}
                className="rounded"
              />
              <span className="text-sm font-heading uppercase">Show Reported Only</span>
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.size > 0 && (
          <div className="bg-primary/10 border border-primary p-4 rounded-sm flex items-center justify-between">
            <span className="font-heading">{selectedReviews.size} selected</span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No reviews found</div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border rounded-sm p-6 hover:bg-muted/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedReviews.has(review._id)}
                      onChange={e => {
                        const newSelected = new Set(selectedReviews);
                        if (e.target.checked) {
                          newSelected.add(review._id);
                        } else {
                          newSelected.delete(review._id);
                        }
                        setSelectedReviews(newSelected);
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
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
                        <span className={`text-xs px-2 py-1 rounded font-heading uppercase ${getModerationBadgeColor(review.moderation_status)}`}>
                          {review.moderation_status}
                        </span>
                        {review.is_reported && (
                          <span className="text-xs px-2 py-1 rounded font-heading uppercase bg-red-500/20 text-red-600">
                            ⚠ Reported: {review.report_reason}
                          </span>
                        )}
                        {review.is_verified_purchase && (
                          <span className="text-xs px-2 py-1 rounded font-heading uppercase bg-green-500/20 text-green-600">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      {review.title && (
                        <h3 className="font-heading font-semibold uppercase">{review.title}</h3>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product & Customer Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Product</p>
                    <p className="font-medium">{review.product_id.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{review.user_id.name}</p>
                    <p className="text-xs text-muted-foreground">{review.user_id.email}</p>
                  </div>
                </div>

                {/* Review Content */}
                <div
                  className="mb-4 p-4 bg-muted/50 rounded-sm text-sm"
                  onClick={() =>
                    setExpandedReview(
                      expandedReview === review._id ? null : review._id
                    )
                  }
                >
                  {expandedReview === review._id ? (
                    <p className="cursor-pointer leading-relaxed">{review.comment}</p>
                  ) : (
                    <p className="cursor-pointer text-muted-foreground">
                      {review.comment.substring(0, 200)}...
                    </p>
                  )}
                </div>

                {review.image_url && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setZoomedImageUrl(review.image_url || null)}
                      className="block w-fit"
                    >
                      <img
                        src={review.image_url}
                        alt="Review upload"
                        className="h-40 w-40 object-cover rounded-sm border border-border cursor-zoom-in hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    </button>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-muted-foreground">
                  <div>
                    <span className="text-xs">Helpful Count: </span>
                    <span className="font-medium">{review.helpful_count}</span>
                  </div>
                  <div>
                    <span className="text-xs">Date: </span>
                    <span className="font-medium">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs">Status: </span>
                    <span className="font-medium">
                      {review.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleUpdateReview(review._id, {
                        ...review,
                        is_visible: !review.is_visible
                      })
                    }
                    className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-sm flex items-center gap-1 transition-colors"
                  >
                    {review.is_visible ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Show
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateReview(review._id, {
                        ...review,
                        is_featured: !review.is_featured
                      })
                    }
                    className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-sm flex items-center gap-1 transition-colors"
                  >
                    {review.is_featured ? '★ Unfeature' : '☆ Feature'}
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateReview(review._id, {
                        ...review,
                        is_pinned: !review.is_pinned
                      })
                    }
                    className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-sm flex items-center gap-1 transition-colors"
                  >
                    {review.is_pinned ? (
                      <>
                        <PinOff className="w-3 h-3" />
                        Unpin
                      </>
                    ) : (
                      <>
                        <Pin className="w-3 h-3" />
                        Pin
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="px-3 py-1 text-sm bg-red-500/20 text-red-600 hover:bg-red-500/30 rounded-sm flex items-center gap-1 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-border rounded-sm disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
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
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-border rounded-sm disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
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
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
