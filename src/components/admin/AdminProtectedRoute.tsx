import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ReactNode } from "react";

const AdminProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAdminAuth();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.mustChangePassword) return <Navigate to="/admin/change-password" replace />;

  return <>{children}</>;
};

export default AdminProtectedRoute;
