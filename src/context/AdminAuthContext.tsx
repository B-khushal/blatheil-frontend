import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminUser } from "@/types/admin";
import { authApi, initStore } from "@/data/adminStore";

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string; mustChangePassword?: boolean };
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  updateUser: (user: AdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const AUTH_KEY = "blatheil_admin_auth";

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    initStore();
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const login = (email: string, password: string) => {
    const found = authApi.login(email, password);
    if (!found) return { success: false, error: "Invalid email or password" };
    setUser(found);
    localStorage.setItem(AUTH_KEY, JSON.stringify(found));
    return { success: true, mustChangePassword: found.mustChangePassword };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (!user) return false;
    const success = authApi.changePassword(user.email, oldPassword, newPassword);
    if (success) {
      const updated = { ...user, mustChangePassword: false };
      setUser(updated);
      localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    }
    return success;
  };

  const updateUser = (updated: AdminUser) => {
    setUser(updated);
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, changePassword, updateUser }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
