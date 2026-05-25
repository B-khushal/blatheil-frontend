import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, DollarSign, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  _id: string;
  totalPrice: number;
  createdAt: string;
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
        const ordersRes = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!ordersRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const ordersData = await ordersRes.json();

        setOrders(ordersData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, API_URL]);

  // Monthly reset behavior: dashboard totals count only from 1st day of current month.
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthOrders = orders.filter((order) => new Date(order.createdAt) >= monthStart);
  const revenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

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

        {/* Minimal Stats: only Total Orders and Total Revenue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {statCard(<ShoppingCart className="w-5 h-5 text-primary" />, "Total Orders", monthOrders.length)}
          {statCard(<DollarSign className="w-5 h-5 text-primary" />, "Total Revenue", formatPrice(revenue), true)}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
