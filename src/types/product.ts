export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  sizes: string[];
  stock: number;
  images: string[];
  isFeatured: boolean;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}
