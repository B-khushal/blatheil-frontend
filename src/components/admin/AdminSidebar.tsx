import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, ChevronLeft, ChevronRight, Monitor, Gift, MessageSquare, BarChart3 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { label: "Website Editor", path: "/admin/website-editor", icon: Monitor, adminOnly: true },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { label: "Reviews", path: "/admin/reviews", icon: MessageSquare, adminOnly: true },
  { label: "Users", path: "/admin/users", icon: Users, adminOnly: true },
  { label: "Offers", path: "/admin/offers", icon: Gift, adminOnly: true },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const { user: adminUser, logout } = useAdminAuth();
  const { logout: logoutStorefront, user: backendUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    logoutStorefront();
    navigate("/", { replace: true });
  };

  const activeUser = backendUser || adminUser;
  const visibleLinks = adminLinks.filter((l) => !l.adminOnly || activeUser?.role === "admin");

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3 }}
      className="h-screen sticky top-0 flex flex-col border-r border-border bg-card overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <AnimatePresence>
          {!collapsed && (
            <Link to="/" className="inline-block">
              <motion.img
                src="/logo.png"
                alt="BLATHEIL"
                className="h-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Link>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-sm text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {visibleLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== "/admin" && location.pathname.startsWith(link.path));
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden font-heading uppercase tracking-wider text-xs"
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="text-xs font-heading uppercase tracking-wider text-foreground truncate">{activeUser?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{activeUser?.email}</p>
            <span className="inline-block mt-1 text-[9px] font-heading uppercase tracking-widest px-2 py-0.5 rounded-sm gold-gradient text-primary-foreground">
              {activeUser?.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-xs font-heading uppercase tracking-wider">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
