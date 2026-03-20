import { Product, ProductListResponse, ProductResponse } from "@/types/product";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isSoldOut?: boolean;
  search?: string;
}

const buildQuery = (query: ProductQuery = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
};

export const fetchProducts = async (query: ProductQuery = {}): Promise<Product[]> => {
  const queryString = buildQuery(query);
  const response = await fetch(`${API_URL}/products${queryString ? `?${queryString}` : ""}`);

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  const data = (await response.json()) as ProductListResponse;
  return data.data || [];
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load product");
  }

  const data = (await response.json()) as ProductResponse;
  return data.data;
};
