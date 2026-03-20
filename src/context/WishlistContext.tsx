/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types/product";

interface WishlistContextType {
  items: Product[];
  ids: Set<string>;
  loading: boolean;
  pendingProductIds: Set<string>;
  fetchWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingProductIds, setPendingProductIds] = useState<Set<string>>(new Set());

  const ids = useMemo(() => new Set(items.map((item) => item._id)), [items]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      const data = await response.json();
      setItems(data.data?.products || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, token, fetchWishlist]);

  const withPending = (productId: string, cb: () => Promise<void>) => {
    setPendingProductIds((prev) => new Set(prev).add(productId));

    return cb().finally(() => {
      setPendingProductIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    });
  };

  const isInWishlist = (productId: string) => ids.has(productId);

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated || !token) {
      throw new Error("Not authenticated");
    }

    if (ids.has(product._id)) {
      return;
    }

    const previous = items;
    setItems((prev) => [product, ...prev]);

    await withPending(product._id, async () => {
      const response = await fetch(`${API_URL}/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) {
        setItems(previous);
        const error = await response.json();
        throw new Error(error.message || "Failed to add to wishlist");
      }

      const data = await response.json();
      setItems(data.data?.products || []);
    });
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated || !token) {
      throw new Error("Not authenticated");
    }

    const previous = items;
    setItems((prev) => prev.filter((product) => product._id !== productId));

    await withPending(productId, async () => {
      const response = await fetch(`${API_URL}/wishlist/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setItems(previous);
        const error = await response.json();
        throw new Error(error.message || "Failed to remove from wishlist");
      }

      const data = await response.json();
      setItems(data.data?.products || []);
    });
  };

  const toggleWishlist = async (product: Product) => {
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
      return;
    }

    await addToWishlist(product);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        ids,
        loading,
        pendingProductIds,
        fetchWishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
};
