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
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
  mustChangePassword: true,
  createdAt: new Date().toISOString(),
};

// Remove seeded products and orders to keep the admin store clean
const seedProducts: Product[] = [];
const seedOrders: Order[] = [];

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
  // Do not auto-seed products or orders in localStorage — keep store empty
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    setItem(STORAGE_KEYS.PRODUCTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    setItem(STORAGE_KEYS.ORDERS, []);
  }
  if (!localStorage.getItem(PASS_KEY)) {
    setPasswords({ [defaultAdmin.email]: "password123" });
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
