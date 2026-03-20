import { AdminUser, Product, Order } from "@/types/admin";

const STORAGE_KEYS = {
  USERS: "blatheil_admin_users",
  PRODUCTS: "blatheil_admin_products",
  ORDERS: "blatheil_admin_orders",
  AUTH: "blatheil_admin_auth",
};

// --- Seed Data ---
const defaultAdmin: AdminUser = {
  id: "1",
  name: "Super Admin",
  email: "blatheil134@gmail.com",
  role: "admin",
  mustChangePassword: true,
  createdAt: new Date().toISOString(),
};

const seedProducts: Product[] = [
  {
    id: "p1",
    name: "Dominion Oversized Hoodie",
    price: 189,
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 45,
    images: ["/src/assets/products/hoodie-black.jpg"],
    description: "Premium 450gsm heavyweight cotton hoodie with gold-embroidered BLATHEIL crest.",
    isFeatured: true,
    isSoldOut: false,
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "p2",
    name: "Tactical Cargo Pants",
    price: 165,
    category: "Bottoms",
    sizes: ["S", "M", "L", "XL"],
    stock: 30,
    images: ["/src/assets/products/cargo-black.jpg"],
    description: "Utility-driven cargo pants with gold hardware accents.",
    isFeatured: false,
    isSoldOut: false,
    createdAt: "2026-03-14T10:00:00Z",
  },
  {
    id: "p3",
    name: "Legacy Graphic Tee",
    price: 89,
    category: "Tees",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 120,
    images: ["/src/assets/products/tee-black.jpg"],
    description: "Heavyweight 280gsm cotton tee featuring the BLATHEIL mountain insignia.",
    isFeatured: true,
    isSoldOut: false,
    createdAt: "2026-03-13T10:00:00Z",
  },
  {
    id: "p4",
    name: "Sovereign Bomber Jacket",
    price: 299,
    category: "Outerwear",
    sizes: ["S", "M", "L", "XL"],
    stock: 15,
    images: ["/src/assets/products/bomber-black.jpg"],
    description: "Premium satin bomber with gold YKK zippers and quilted lining.",
    isFeatured: true,
    isSoldOut: false,
    createdAt: "2026-03-12T10:00:00Z",
  },
  {
    id: "p5",
    name: "Crown Snapback",
    price: 59,
    category: "Accessories",
    sizes: ["One Size"],
    stock: 80,
    images: ["/src/assets/products/cap-gold.jpg"],
    description: "Structured six-panel snapback with 3D embroidered monogram.",
    isFeatured: false,
    isSoldOut: false,
    createdAt: "2026-03-11T10:00:00Z",
  },
  {
    id: "p6",
    name: "Elite Tracksuit Set",
    price: 259,
    category: "Sets",
    sizes: ["S", "M", "L", "XL"],
    stock: 0,
    images: ["/src/assets/products/tracksuit-black.jpg"],
    description: "Full tracksuit set with gold stripe detailing.",
    isFeatured: false,
    isSoldOut: true,
    createdAt: "2026-03-10T10:00:00Z",
  },
];

const seedOrders: Order[] = [
  {
    id: "o1",
    customerName: "Marcus Johnson",
    phone: "+1 555-0101",
    address: "123 King St, New York, NY 10001",
    items: [{ productId: "p1", productName: "Dominion Oversized Hoodie", quantity: 1, size: "L", price: 189 }],
    totalPrice: 189,
    status: "pending",
    createdAt: "2026-03-20T08:00:00Z",
  },
  {
    id: "o2",
    customerName: "Zara Kim",
    phone: "+1 555-0202",
    address: "456 Queen Ave, Los Angeles, CA 90001",
    items: [
      { productId: "p3", productName: "Legacy Graphic Tee", quantity: 2, size: "M", price: 89 },
      { productId: "p5", productName: "Crown Snapback", quantity: 1, size: "One Size", price: 59 },
    ],
    totalPrice: 237,
    status: "confirmed",
    createdAt: "2026-03-19T14:30:00Z",
  },
  {
    id: "o3",
    customerName: "Deon Williams",
    phone: "+1 555-0303",
    address: "789 Leader Blvd, Chicago, IL 60601",
    items: [{ productId: "p4", productName: "Sovereign Bomber Jacket", quantity: 1, size: "XL", price: 299 }],
    totalPrice: 299,
    status: "shipped",
    createdAt: "2026-03-18T11:15:00Z",
  },
  {
    id: "o4",
    customerName: "Aisha Patel",
    phone: "+1 555-0404",
    address: "321 Crown Rd, Miami, FL 33101",
    items: [
      { productId: "p2", productName: "Tactical Cargo Pants", quantity: 1, size: "S", price: 165 },
      { productId: "p1", productName: "Dominion Oversized Hoodie", quantity: 1, size: "M", price: 189 },
    ],
    totalPrice: 354,
    status: "delivered",
    createdAt: "2026-03-17T09:45:00Z",
  },
];

// --- Helpers ---
function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Password store (simple hash simulation) ---
const PASS_KEY = "blatheil_admin_passwords";

function getPasswords(): Record<string, string> {
  return getItem<Record<string, string>>(PASS_KEY, { "blatheil134@gmail.com": "password123" });
}

function setPasswords(p: Record<string, string>) {
  setItem(PASS_KEY, p);
}

// --- Init seed data on first load ---
export function initStore() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setItem(STORAGE_KEYS.USERS, [defaultAdmin]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setItem(STORAGE_KEYS.PRODUCTS, seedProducts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setItem(STORAGE_KEYS.ORDERS, seedOrders);
  }
  if (!localStorage.getItem(PASS_KEY)) {
    setPasswords({ "blatheil134@gmail.com": "password123" });
  }
}

// --- Auth API ---
export const authApi = {
  login(email: string, password: string): AdminUser | null {
    const passwords = getPasswords();
    const users = getItem<AdminUser[]>(STORAGE_KEYS.USERS, []);
    if (passwords[email] === password) {
      return users.find((u) => u.email === email) || null;
    }
    return null;
  },

  changePassword(email: string, oldPassword: string, newPassword: string): boolean {
    const passwords = getPasswords();
    if (passwords[email] !== oldPassword) return false;
    passwords[email] = newPassword;
    setPasswords(passwords);
    // Mark mustChangePassword = false
    const users = getItem<AdminUser[]>(STORAGE_KEYS.USERS, []);
    const updated = users.map((u) => (u.email === email ? { ...u, mustChangePassword: false } : u));
    setItem(STORAGE_KEYS.USERS, updated);
    return true;
  },
};

// --- Products API ---
export const productsApi = {
  getAll(): Product[] {
    return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  },
  create(product: Omit<Product, "id" | "createdAt">): Product {
    const products = this.getAll();
    const newProduct: Product = {
      ...product,
      id: "p" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    setItem(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  update(id: string, data: Partial<Product>): Product | null {
    const products = this.getAll();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    products[idx] = { ...products[idx], ...data };
    setItem(STORAGE_KEYS.PRODUCTS, products);
    return products[idx];
  },
  delete(id: string): boolean {
    const products = this.getAll();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    setItem(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },
};

// --- Orders API ---
export const ordersApi = {
  getAll(): Order[] {
    return getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  },
  updateStatus(id: string, status: Order["status"]): Order | null {
    const orders = this.getAll();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], status };
    setItem(STORAGE_KEYS.ORDERS, orders);
    return orders[idx];
  },
};

// --- Users API ---
export const usersApi = {
  getAll(): AdminUser[] {
    return getItem<AdminUser[]>(STORAGE_KEYS.USERS, []);
  },
  create(data: { name: string; email: string; role: "admin" | "staff" }): AdminUser | null {
    const users = this.getAll();
    if (users.find((u) => u.email === data.email)) return null;
    const newUser: AdminUser = {
      id: "u" + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);
    const passwords = getPasswords();
    passwords[data.email] = "password123";
    setPasswords(passwords);
    return newUser;
  },
  delete(id: string): boolean {
    const users = this.getAll();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    setItem(STORAGE_KEYS.USERS, filtered);
    return true;
  },
};
