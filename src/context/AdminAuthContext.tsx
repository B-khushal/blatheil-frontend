import { createContext, useContext, ReactNode } from "react";
import { AdminUser } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  updateUser: (user: AdminUser) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user: mainUser, login: mainLogin, logout: mainLogout, changePassword: mainChangePassword, updateProfile } = useAuth();

  const isTeamRole = (role: string) => ["admin", "manager", "sales_person"].includes(role);

  const adminUser: AdminUser | null = mainUser && isTeamRole(mainUser.role) ? {
    id: mainUser.id,
    name: mainUser.name,
    email: mainUser.email,
    role: mainUser.role as "admin" | "manager" | "sales_person",
    mustChangePassword: mainUser.mustChangePassword,
    createdAt: new Date().toISOString(),
  } : null;

  const login = async (email: string, password: string) => {
    try {
      const loggedUser = await mainLogin(email, password);
      if (loggedUser && isTeamRole(loggedUser.role)) {
        return { success: true, mustChangePassword: loggedUser.mustChangePassword };
      } else {
        mainLogout();
        return { success: false, error: "Access denied. Team credentials required." };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const logout = () => {
    mainLogout();
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      await mainChangePassword(oldPassword, newPassword);
      return true;
    } catch {
      return false;
    }
  };

  const updateUser = (updated: AdminUser) => {
    updateProfile(updated.name, updated.email);
  };

  return (
    <AdminAuthContext.Provider value={{
      user: adminUser,
      isAuthenticated: !!adminUser,
      login,
      logout,
      changePassword,
      updateUser
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
