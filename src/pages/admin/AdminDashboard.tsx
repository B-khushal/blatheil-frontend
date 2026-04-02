import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  userId?: { name?: string; email?: string };
}

interface Product {
  _id: string;
}

const statCard = (icon: React.ReactNode, label: string, value: string | number, accent = false) => (
  <div className={`glass-card p-6 ${accent ? "border-primary/30" : ""}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/10">{icon}</div>
      {accent && <span className="text-[10px] font-heading uppercase tracking-widest text-primary">Revenue</span>}
    </div>
    <p className="text-2xl font-heading font-bold">{value}</p>
    <p className="text-xs text-muted-foreground mt-1 font-heading uppercase tracking-wider">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/products?limit=100`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/orders?limit=20`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!productsRes.ok || !ordersRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        setProducts(productsData.data || []);
        setOrders(ordersData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, API_URL]);

  const revenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const statusColors: Record<string, string> = {
    pending: "text-yellow-500",
    confirmed: "text-blue-400",
    shipped: "text-purple-400",
    delivered: "text-green-400",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold uppercase">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="text-primary">{user?.name}</span>
          </p>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 border-destructive/40 text-destructive text-sm">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCard(<Package className="w-5 h-5 text-primary" />, "Total Products", products.length)}
          {statCard(<ShoppingCart className="w-5 h-5 text-primary" />, "Total Orders", orders.length)}
          {statCard(<DollarSign className="w-5 h-5 text-primary" />, "Total Revenue", formatPrice(revenue), true)}
          {statCard(<TrendingUp className="w-5 h-5 text-primary" />, "Pending Orders", pendingOrders)}
        </div>

        {/* Recent Orders */}
        <div className="glass-card p-6">
          <h2 className="font-heading uppercase tracking-widest text-sm mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs text-muted-foreground">{order._id.slice(-8)}</td>
                    <td className="py-3 px-2">{order.userId?.name || order.userId?.email || "Unknown"}</td>
                    <td className="py-3 px-2 text-primary font-semibold">{formatPrice(order.totalPrice || 0)}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-heading uppercase tracking-widest ${statusColors[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
