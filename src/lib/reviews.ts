const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface Review {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  customer_name: string;
  is_verified_purchase: boolean;
  created_at: string;
  helpful_count: number;
}

export interface ReviewResponse {
  success: boolean;
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    itemsPerPage: number;
  };
  productRating: {
    average: number;
    totalReviews: number;
    distribution: {
      [key: number]: number;
    };
  };
}

export const fetchProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'latest'
): Promise<ReviewResponse> => {
  const res = await fetch(
    `${API_URL}/reviews/product/${productId}?page=${page}&limit=${limit}&sortBy=${sortBy}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch reviews');
  }

  return res.json();
};

export const submitReview = async (
  productId: string,
  rating: number,
  comment: string,
  title?: string,
  imageUrl?: string,
  orderId?: string
) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productId,
      rating,
      comment,
      title: title || undefined,
      imageUrl: imageUrl || undefined,
      orderId: orderId || undefined
    })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to submit review');
  }

  return res.json();
};

export const updateReview = async (
  reviewId: string,
  rating?: number,
  comment?: string,
  title?: string,
  imageUrl?: string
) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      rating,
      comment,
      title,
      imageUrl
    })
  });

  if (!res.ok) {
    throw new Error('Failed to update review');
  }

  return res.json();
};

export const deleteReview = async (reviewId: string) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to delete review');
  }

  return res.json();
};

export const markReviewHelpful = async (reviewId: string) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/reviews/${reviewId}/like`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to mark review as helpful');
  }

  return res.json();
};

export const reportReview = async (reviewId: string, reason: string) => {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/reviews/${reviewId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reportReason: reason })
  });

  if (!res.ok) {
    throw new Error('Failed to report review');
  }

  return res.json();
};
