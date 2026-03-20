import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  images?: string[];
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, name: string, price: number, quantity: number, size: string, images?: string[]) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  // Fetch cart when auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchCart();
    }
  }, [isAuthenticated, token]);

  const fetchCart = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedItems: CartItem[] = data.data.items.map((item: any) => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
          size: item.size,
          images: item.productId.images,
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    productId: string,
    name: string,
    price: number,
    quantity: number,
    size: string,
    images?: string[]
  ) => {
    if (!isAuthenticated || !token) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity, size }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to add to cart");
      }
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (!isAuthenticated || !token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_URL}/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, size }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove from cart");
      }
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (productId: string, size: string, quantity: number) => {
    if (!isAuthenticated || !token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_URL}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, size, quantity }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update cart");
      }
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !token) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setItems([]);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to clear cart");
      }
    } catch (error) {
      throw error;
    }
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
