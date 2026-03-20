export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  mustChangePassword: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  sizes: string[];
  stock: number;
  images: string[];
  description: string;
  isFeatured: boolean;
  isSoldOut: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  size: string;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
}
