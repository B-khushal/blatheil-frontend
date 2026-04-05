import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    if (!comment || comment.length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          orderId: orderId || undefined,
          rating,
          title: title || undefined,
          comment,
          imageUrl: imageUrl || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setSuccess(true);
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setImageUrl('');
      setOrderId('');

      // Call callback to refresh reviews
      if (onReviewSubmitted) {
        setTimeout(() => onReviewSubmitted(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        const uploadedUrl = data?.data?.url || data?.imageUrl || '';
        if (!uploadedUrl) {
          setError('Upload succeeded but no image URL was returned');
          return;
        }
        setImageUrl(uploadedUrl);
      } else {
        setError('Failed to upload image');
      }
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="py-12 bg-muted/50 rounded-sm p-8 text-center">
        <h3 className="text-xl font-heading font-bold mb-4">Share Your Review</h3>
        <p className="text-muted-foreground mb-6">You must be logged in to submit a review.</p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm rounded-sm hover:opacity-90 transition-opacity"
        >
          Log In to Review
        </a>
      </section>
    );
  }

  return (
    <section id={`review-form-${productId}`} className="py-12 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto"
      >
        <h2 className="text-3xl font-heading font-bold uppercase mb-8">Write a Review</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-heading uppercase tracking-wider mb-4">
              Your Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      star <= rating
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 5 && 'Excellent! ★★★★★'}
                {rating === 4 && 'Good! ★★★★'}
                {rating === 3 && 'Average ★★★'}
                {rating === 2 && 'Not great ★★'}
                {rating === 1 && 'Poor ★'}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-heading uppercase tracking-wider mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Great quality, highly recommended"
              maxLength={100}
              className="w-full px-4 py-2 bg-muted border border-border rounded-sm focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-heading uppercase tracking-wider mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us about your experience with this product... (minimum 10 characters)"
              maxLength={2000}
              rows={6}
              required
              className="w-full px-4 py-2 bg-muted border border-border rounded-sm focus:outline-none focus:border-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/2000 {comment.length < 10 && '(minimum 10 required)'}
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-heading uppercase tracking-wider mb-2">
              Product Photo (Optional)
            </label>
            <div className="flex gap-4">
              <label className="flex-1 border-2 border-dashed border-border rounded-sm p-6 cursor-pointer hover:border-primary transition-colors text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              {imageUrl && (
                <div className="flex-1">
                  <img
                    src={imageUrl}
                    alt="Review"
                    className="w-full h-32 object-cover rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs text-red-500 mt-2 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Link (Optional) */}
          <div>
            <label className="block text-sm font-heading uppercase tracking-wider mb-2">
              Link to Order (Optional - for verified purchase badge)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Enter order ID to get verified purchase badge"
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setError('Order picker is coming soon. You can paste your order ID manually.')}
                className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-sm text-sm font-heading transition-colors"
              >
                My Orders
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/50 text-red-600 rounded-sm text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-green-500/10 border border-green-500/50 text-green-600 rounded-sm text-sm"
            >
              ✓ Review submitted successfully! Thank you for your feedback.
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !rating || !comment}
            className="w-full px-6 py-3 bg-primary text-primary-foreground font-heading uppercase tracking-wider text-sm rounded-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By submitting a review, you agree to our community guidelines. Reviews are moderated before publication.
        </p>
      </motion.div>
    </section>
  );
};
