import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <AdminSidebar />
    <main className="flex-1 overflow-auto">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
    </main>
  </div>
);

export default AdminLayout;
