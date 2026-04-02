import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, PackageSearch } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

interface OrderItem {
  productId?: { name?: string };
  quantity: number;
  size?: string;
}

interface Order {
  _id: string;
  totalPrice: number;
  createdAt: string;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  shipping_status?: string;
  courier_name?: string;
  awb_code?: string;
  items: OrderItem[];
}

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  processing: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  shipped: "bg-indigo-400/10 text-indigo-300 border-indigo-400/30",
  "in transit": "bg-indigo-400/10 text-indigo-300 border-indigo-400/30",
  "out for delivery": "bg-orange-400/10 text-orange-300 border-orange-400/30",
  delivered: "bg-green-500/10 text-green-500 border-green-500/30",
};

const normalizeStatus = (value?: string) => (value || "Pending").toLowerCase();

export default function MyOrders() {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const loadOrders = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) {
      setLoading(true);
    }

    try {
      const response = await fetch(`${API_URL}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch your orders");
      }

      const payload = await response.json();
      setOrders(payload.data || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your orders");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [API_URL, token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadOrders(true);
    }, 25000);

    return () => window.clearInterval(interval);
  }, [loadOrders]);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders]
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading uppercase tracking-wide">My Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time shipping updates for your purchases.</p>
          </div>
          <Button variant="outline" onClick={() => loadOrders()}>
            Refresh
          </Button>
        </div>

        {loading && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <Card className="border-red-500/40 bg-red-500/10">
            <CardContent className="pt-6 text-red-300">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && sortedOrders.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <PackageSearch className="w-8 h-8 mx-auto mb-2" />
              You have not placed any orders yet.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {sortedOrders.map((order) => {
            const normalizedStatus = normalizeStatus(order.shipping_status || order.status);
            const statusColor = statusColorMap[normalizedStatus] || statusColorMap.pending;

            return (
              <Card key={order._id} className="bg-slate-900/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-mono">#{order._id.slice(-8)}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-[11px] px-3 py-1 rounded-full border font-semibold uppercase tracking-wider ${statusColor}`}>
                      {order.shipping_status || order.status}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-slate-300">
                    <p className="font-medium mb-1">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={`${order._id}-${idx}`}>
                          {item.productId?.name || "Product"}
                          {item.size ? ` (${item.size})` : ""} x {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                    <p className="text-primary font-semibold">Total: {formatPrice(order.totalPrice || 0)}</p>
                    <div className="flex items-center gap-2">
                      {order.courier_name && (
                        <span className="text-xs text-muted-foreground">Courier: {order.courier_name}</span>
                      )}
                      {order.awb_code && (
                        <Link to={`/track-order/${order.awb_code}`}>
                          <Button variant="outline" size="sm">
                            Track {order.awb_code}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
