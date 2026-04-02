import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Truck, RefreshCw, Printer, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { AdminInvoicePrint } from "@/components/admin/AdminInvoicePrint";
import { AdminPackageSlip } from "@/components/admin/AdminPackageSlip";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";

interface Order {
  _id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  totalPrice: number;
  createdAt: string;
  userId: { name: string; email: string };
  items: { productId: { name: string }; quantity: number; size?: string }[];
  shippingAddress?: string;
  phone?: string;
  shipping_status?: string;
  courier_name?: string;
  awb_code?: string;
  shipment_id?: string;
}

const statusOptions: Order["status"][] = ["pending", "confirmed", "shipped", "delivered"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  confirmed: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  shipped: "bg-purple-400/10 text-purple-400 border-purple-400/30",
  delivered: "bg-green-400/10 text-green-400 border-green-400/30",
};

const shippingStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  processing: "bg-blue-400/10 text-blue-400 border-blue-400/30",
  shipped: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  "in transit": "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  "out for delivery": "bg-orange-500/10 text-orange-300 border-orange-500/30",
  delivered: "bg-green-500/10 text-green-500 border-green-500/30",
};

const AdminOrders = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const perPage = 5;

  const invoiceRef = useRef<HTMLDivElement>(null);
  const slipRef = useRef<HTMLDivElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const executePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
  });

  const executePrintSlip = useReactToPrint({
    contentRef: slipRef,
  });

  const triggerPrintInvoice = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      if (executePrintInvoice) executePrintInvoice();
    }, 100);
  };

  const triggerPrintSlip = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      if (executePrintSlip) executePrintSlip();
    }, 100);
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchOrders(true);
    }, 25000);

    return () => window.clearInterval(interval);
  }, [token]);

  const fetchOrders = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = 
      o.userId?.name?.toLowerCase().includes(search.toLowerCase()) || 
      o._id.includes(search);
    return matchStatus && matchSearch;
  });
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleStatusUpdate = async (id: string, status: Order["status"]) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      await fetchOrders();
      toast.success(`Order updated to ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order");
    }
  };

  const handleShipmentSync = async (orderId: string, force = false) => {
    try {
      const res = await fetch(`${API_URL}/shiprocket/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, force }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Shipment sync failed");
      }

      toast.success(force ? "Shiprocket sync retried" : "Shipment created");
      await fetchOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sync shipment");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold uppercase">Orders</h1>
          <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or ID..."
              className="w-full bg-transparent border border-border rounded-sm pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setStatusFilter("all"); setPage(1); }} className={`px-3 py-2 text-xs font-heading uppercase tracking-widest border rounded-sm transition-colors ${statusFilter === "all" ? "gold-gradient text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary"}`}>
              All
            </button>
            {statusOptions.map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-2 text-xs font-heading uppercase tracking-widest border rounded-sm transition-colors ${statusFilter === s ? "gold-gradient text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3 mb-6">
          {paginated.map((order) => (
            <div key={order._id} className="glass-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{order._id.slice(-8)}</span>
                    <span className={`text-[10px] font-heading uppercase tracking-widest px-2 py-0.5 border rounded-sm ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span
                      className={`text-[10px] font-heading uppercase tracking-widest px-2 py-0.5 border rounded-sm ${
                        shippingStatusColors[(order.shipping_status || "pending").toLowerCase()] ||
                        shippingStatusColors.pending
                      }`}
                    >
                      {order.shipping_status || "Pending"}
                    </span>
                  </div>
                  <h3 className="font-heading text-sm uppercase tracking-wide mt-1">{order.userId?.name}</h3>
                  <p className="text-xs text-muted-foreground">{order.phone} · {order.shippingAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-heading text-primary">{formatPrice(order.totalPrice || 0)}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.items?.map((item, i) => (
                    <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-sm">
                      {item.productId?.name} {item.size ? `(${item.size})` : ""} ×{item.quantity}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-muted-foreground">
                  <span>Courier: {order.courier_name || "Not assigned"}</span>
                  <span>•</span>
                  <span>AWB: {order.awb_code || "Pending"}</span>
                  {order.awb_code && (
                    <Link to={`/track-order/${order.awb_code}`}>
                      <button className="px-2 py-1 border border-border rounded-sm text-primary hover:border-primary transition-colors">
                        Track Order
                      </button>
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground">Update Status:</span>
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      disabled={order.status === s}
                      onClick={() => handleStatusUpdate(order._id, s)}
                      className={`text-[10px] font-heading uppercase tracking-widest px-2 py-1 border rounded-sm transition-colors ${
                        order.status === s
                          ? "border-primary/30 text-primary cursor-default"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <button
                    onClick={() => handleShipmentSync(order._id, false)}
                    disabled={Boolean(order.shipment_id)}
                    className={`text-[10px] font-heading uppercase tracking-widest px-2 py-1 border rounded-sm transition-colors flex items-center gap-1 ${
                      order.shipment_id
                        ? "border-border/50 text-muted-foreground/60 cursor-not-allowed"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Truck className="w-3 h-3" />
                    Create Shipment
                  </button>
                  <button
                    onClick={() => handleShipmentSync(order._id, true)}
                    className="text-[10px] font-heading uppercase tracking-widest px-2 py-1 border rounded-sm transition-colors border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry Shiprocket Sync
                  </button>
                  <button
                    onClick={() => triggerPrintInvoice(order)}
                    className="text-[10px] font-heading uppercase tracking-widest px-2 py-1 border rounded-sm transition-colors border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center gap-1 ml-auto sm:ml-0"
                  >
                    <FileText className="w-3 h-3" />
                    Print Invoice
                  </button>
                  <button
                    onClick={() => triggerPrintSlip(order)}
                    className="text-[10px] font-heading uppercase tracking-widest px-2 py-1 border rounded-sm transition-colors border-border text-muted-foreground hover:border-primary hover:text-primary flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    Print Slip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No orders found</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-sm text-xs font-heading ${page === i + 1 ? "gold-gradient text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Hidden Print Components */}
      <div className="absolute top-0 left-0 opacity-0 -z-50 pointer-events-none overflow-hidden" style={{ width: 0, height: 0 }}>
        {printingOrder && <AdminInvoicePrint ref={invoiceRef} order={printingOrder} currencyFormatPrice={formatPrice} />}
        {printingOrder && <AdminPackageSlip ref={slipRef} order={printingOrder} currencyFormatPrice={formatPrice} />}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
