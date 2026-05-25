import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, ShoppingCart, DollarSign, Package, Users, MessageSquare, Gift, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { usersApi } from "@/data/adminStore";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface OrderItem {
  productId?: { _id?: string; name?: string } | string;
  quantity?: number;
}

interface Order {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items?: OrderItem[];
}

interface Product {
  _id: string;
  name: string;
  category: string;
  createdAt?: string;
}

interface Review {
  _id: string;
  created_at?: string;
  createdAt?: string;
  moderation_status?: string;
}

interface Offer {
  _id: string;
  isActive: boolean;
  startDate?: string;
}

interface SettingsData {
  currencyRate?: number;
  updatedAt?: string;
}

interface WebsiteContentData {
  _id?: string;
  updatedAt?: string;
}

interface AdminUser {
  id: string;
  name: string;
  createdAt?: string;
}

type DateRange = {
  startDate: string;
  endDate: string;
};

type AnalyticsMode = "range" | "yearly";

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const toInputDate = (d: Date) => {
  const copy = new Date(d);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
};

const parseDay = (value: string) => new Date(`${value}T00:00:00`);

const isWithinYear = (isoDate: string | undefined, year: number) => {
  if (!isoDate) return false;
  return new Date(isoDate).getFullYear() === year;
};

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const escapeCsv = (value: string | number) => {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes("\n") || str.includes("\"")) {
    return `"${str.replace(/\"/g, '""')}"`;
  }
  return str;
};

const isWithinRange = (isoDate: string | undefined, range: DateRange) => {
  if (!isoDate) return false;
  const value = new Date(isoDate);
  const start = parseDay(range.startDate);
  const end = parseDay(range.endDate);
  end.setHours(23, 59, 59, 999);
  return value >= start && value <= end;
};

const statCard = (icon: React.ReactNode, label: string, value: string | number, accent = false) => (
  <div className={`glass-card p-5 ${accent ? "border-primary/30" : ""}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="w-9 h-9 rounded-md flex items-center justify-center bg-primary/10">{icon}</div>
      {accent && <span className="text-[10px] font-heading uppercase tracking-widest text-primary">Revenue</span>}
    </div>
    <p className="text-2xl font-heading font-bold">{value}</p>
    <p className="text-xs text-muted-foreground mt-1 font-heading uppercase tracking-wider">{label}</p>
  </div>
);

const AdminAnalytics = () => {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const defaultEnd = startOfToday();
  const defaultStart = new Date(defaultEnd);
  defaultStart.setDate(defaultStart.getDate() - 29);

  const [mode, setMode] = useState<AnalyticsMode>("range");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: toInputDate(defaultStart),
    endDate: toInputDate(defaultEnd),
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const authHeader = { Authorization: `Bearer ${token}` };
        const reviewToken = localStorage.getItem("token") || token;

        const [ordersRes, productsRes, reviewsRes, offersRes, settingsRes, websiteRes] = await Promise.allSettled([
          fetch(`${API_URL}/orders`, { headers: authHeader }),
          fetch(`${API_URL}/products?limit=200`, { headers: authHeader }),
          fetch(`${API_URL}/reviews/admin/all?page=1&limit=200`, {
            headers: { Authorization: `Bearer ${reviewToken}` },
          }),
          fetch(`${API_URL}/offers`, { headers: authHeader }),
          fetch(`${API_URL}/settings`),
          fetch(`${API_URL}/admin/website-content`),
        ]);

        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const data = await ordersRes.value.json();
          setOrders(Array.isArray(data.data) ? data.data : []);
        }

        if (productsRes.status === "fulfilled" && productsRes.value.ok) {
          const data = await productsRes.value.json();
          setProducts(Array.isArray(data.data) ? data.data : []);
        }

        if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
          const data = await reviewsRes.value.json();
          const reviewList = Array.isArray(data.reviews)
            ? data.reviews
            : Array.isArray(data.data)
              ? data.data
              : [];
          setReviews(reviewList);
        }

        if (offersRes.status === "fulfilled" && offersRes.value.ok) {
          const data = await offersRes.value.json();
          setOffers(Array.isArray(data.data) ? data.data : []);
        }

        if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
          const data = await settingsRes.value.json();
          setSettingsData(data || null);
        }

        if (websiteRes.status === "fulfilled" && websiteRes.value.ok) {
          const data = await websiteRes.value.json();
          setWebsiteContent(data || null);
        }

        setUsers(usersApi.getAll() as AdminUser[]);
      } catch {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, API_URL]);

  const safeRange = useMemo(() => {
    if (dateRange.startDate <= dateRange.endDate) return dateRange;
    return { startDate: dateRange.endDate, endDate: dateRange.startDate };
  }, [dateRange]);

  const filteredOrders = useMemo(
    () => orders.filter((o) => isWithinRange(o.createdAt, safeRange)),
    [orders, safeRange]
  );

  const filteredProducts = useMemo(
    () => products.filter((p) => isWithinRange(p.createdAt, safeRange)),
    [products, safeRange]
  );

  const filteredUsers = useMemo(
    () => users.filter((u) => isWithinRange(u.createdAt, safeRange)),
    [users, safeRange]
  );

  const filteredReviews = useMemo(
    () => reviews.filter((r) => isWithinRange(r.created_at || r.createdAt, safeRange)),
    [reviews, safeRange]
  );

  const filteredOffers = useMemo(
    () => offers.filter((o) => isWithinRange(o.startDate, safeRange)),
    [offers, safeRange]
  );

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    orders.forEach((o) => set.add(new Date(o.createdAt).getFullYear()));
    if (set.size === 0) {
      set.add(new Date().getFullYear());
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [orders]);

  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const yearlyOrders = useMemo(
    () => orders.filter((o) => isWithinYear(o.createdAt, selectedYear)),
    [orders, selectedYear]
  );

  const yearlyRevenue = useMemo(
    () => yearlyOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    [yearlyOrders]
  );

  const monthlyRevenue = useMemo(() => {
    const byMonth = Array.from({ length: 12 }, () => ({ revenue: 0, orders: 0 }));
    yearlyOrders.forEach((order) => {
      const monthIndex = new Date(order.createdAt).getMonth();
      byMonth[monthIndex].revenue += order.totalPrice || 0;
      byMonth[monthIndex].orders += 1;
    });
    const maxRevenue = Math.max(...byMonth.map((m) => m.revenue), 0);

    return byMonth.map((item, index) => ({
      month: monthNames[index],
      revenue: item.revenue,
      orders: item.orders,
      width: maxRevenue === 0 ? 0 : Math.round((item.revenue / maxRevenue) * 100),
    }));
  }, [yearlyOrders]);

  const displayOrders = mode === "yearly" ? yearlyOrders : filteredOrders;
  const displayRevenue = mode === "yearly" ? yearlyRevenue : filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const ordersByStatus = useMemo(() => {
    const grouped = displayOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  }, [displayOrders]);

  const topProducts = useMemo(() => {
    const totals = displayOrders.reduce<Record<string, number>>((acc, order) => {
      order.items?.forEach((item) => {
        const productName =
          typeof item.productId === "string"
            ? item.productId
            : item.productId?.name || item.productId?._id || "Unknown Product";
        acc[productName] = (acc[productName] || 0) + (item.quantity || 0);
      });
      return acc;
    }, {});

    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [displayOrders]);

  const dailyRevenue = useMemo(() => {
    const grouped = displayOrders.reduce<Record<string, number>>((acc, order) => {
      const day = new Date(order.createdAt).toLocaleDateString();
      acc[day] = (acc[day] || 0) + (order.totalPrice || 0);
      return acc;
    }, {});

    const entries = Object.entries(grouped);
    const max = Math.max(...entries.map(([, value]) => value), 0);

    return entries
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-10)
      .map(([day, value]) => ({
        day,
        value,
        width: max === 0 ? 0 : Math.round((value / max) * 100),
      }));
  }, [displayOrders]);

  const componentSummary = useMemo(() => {
    const year = selectedYear;
    const inWindow = (value?: string) => (mode === "yearly" ? isWithinYear(value, year) : isWithinRange(value, safeRange));

    return [
      { name: "Products", total: products.length, inScope: products.filter((p) => inWindow(p.createdAt)).length },
      { name: "Orders", total: orders.length, inScope: mode === "yearly" ? yearlyOrders.length : filteredOrders.length },
      { name: "Users", total: users.length, inScope: users.filter((u) => inWindow(u.createdAt)).length },
      { name: "Reviews", total: reviews.length, inScope: reviews.filter((r) => inWindow(r.created_at || r.createdAt)).length },
      { name: "Offers", total: offers.length, inScope: offers.filter((o) => inWindow(o.startDate)).length },
      {
        name: "Settings",
        total: settingsData ? 1 : 0,
        inScope: settingsData?.updatedAt && inWindow(settingsData.updatedAt) ? 1 : 0,
      },
      {
        name: "Website Content",
        total: websiteContent ? 1 : 0,
        inScope: websiteContent?.updatedAt && inWindow(websiteContent.updatedAt) ? 1 : 0,
      },
    ];
  }, [
    mode,
    selectedYear,
    safeRange,
    products,
    orders,
    users,
    reviews,
    offers,
    settingsData,
    websiteContent,
    yearlyOrders.length,
    filteredOrders.length,
  ]);

  const productsInScope = mode === "yearly"
    ? products.filter((p) => isWithinYear(p.createdAt, selectedYear)).length
    : filteredProducts.length;

  const usersInScope = mode === "yearly"
    ? users.filter((u) => isWithinYear(u.createdAt, selectedYear)).length
    : filteredUsers.length;

  const reviewsInScope = mode === "yearly"
    ? reviews.filter((r) => isWithinYear(r.created_at || r.createdAt, selectedYear)).length
    : filteredReviews.length;

  const offersInScope = mode === "yearly"
    ? offers.filter((o) => isWithinYear(o.startDate, selectedYear)).length
    : filteredOffers.length;

  const createReportRows = () => {
    const rows: Array<Array<string | number>> = [];
    rows.push(["Analytics Report"]);

    if (mode === "yearly") {
      rows.push(["Mode", "Yearly"]);
      rows.push(["Year", selectedYear]);
      rows.push(["Orders", displayOrders.length]);
      rows.push(["Revenue", displayRevenue]);
      rows.push([]);
      rows.push(["Monthly Sales Revenue"]);
      rows.push(["Month", "Orders", "Revenue"]);
      monthlyRevenue.forEach((m) => rows.push([m.month, m.orders, m.revenue]));
    } else {
      rows.push(["Mode", "Date Range"]);
      rows.push(["Start Date", safeRange.startDate]);
      rows.push(["End Date", safeRange.endDate]);
      rows.push(["Orders", displayOrders.length]);
      rows.push(["Revenue", displayRevenue]);
      rows.push([]);
      rows.push(["Daily Revenue"]);
      rows.push(["Date", "Revenue"]);
      dailyRevenue.forEach((d) => rows.push([d.day, d.value]));
    }

    rows.push([]);
    rows.push(["Order Status Breakdown"]);
    rows.push(["Status", "Count"]);
    ordersByStatus.forEach(([status, count]) => rows.push([status, count]));

    rows.push([]);
    rows.push(["Component Summary"]);
    rows.push(["Component", "Total", mode === "yearly" ? "In Year" : "In Range"]);
    componentSummary.forEach((row) => rows.push([row.name, row.total, row.inScope]));

    return rows;
  };

  const downloadBlob = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const rows = createReportRows();
    const csv = rows.map((row) => row.map((cell) => escapeCsv(cell)).join(",")).join("\n");
    const suffix = mode === "yearly" ? `${selectedYear}` : `${safeRange.startDate}_to_${safeRange.endDate}`;
    downloadBlob(csv, `analytics_${suffix}.csv`, "text/csv;charset=utf-8;");
    toast.success("CSV download started");
  };

  const handleDownloadXls = () => {
    const rows = createReportRows();
    const xls = rows.map((row) => row.map((cell) => String(cell ?? "")).join("\t")).join("\n");
    const suffix = mode === "yearly" ? `${selectedYear}` : `${safeRange.startDate}_to_${safeRange.endDate}`;
    downloadBlob(xls, `analytics_${suffix}.xls`, "application/vnd.ms-excel;charset=utf-8;");
    toast.success("XLS download started");
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const rows = createReportRows();
    let y = 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Analytics Report", 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    rows.forEach((row) => {
      if (y > 285) {
        doc.addPage();
        y = 14;
      }

      if (row.length === 0) {
        y += 4;
        return;
      }

      const line = row.map((item) => String(item)).join("   |   ");
      doc.text(line.slice(0, 190), 14, y);
      y += 6;
    });

    const suffix = mode === "yearly" ? `${selectedYear}` : `${safeRange.startDate}_to_${safeRange.endDate}`;
    doc.save(`analytics_${suffix}.pdf`);
    toast.success("PDF download started");
  };

  const setPresetRange = (days: number) => {
    const end = startOfToday();
    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    setDateRange({ startDate: toInputDate(start), endDate: toInputDate(end) });
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
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-heading font-bold uppercase">Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Cross-component analytics with custom date range.</p>
        </div>

        {error && <div className="glass-card p-4 mb-6 border-destructive/40 text-destructive text-sm">{error}</div>}

        <div className="glass-card p-4 mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMode("range")}
              className={`px-3 py-2 text-[10px] font-heading uppercase tracking-widest border rounded-sm transition-colors ${
                mode === "range"
                  ? "gold-gradient text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              Date Range Analytics
            </button>
            <button
              onClick={() => setMode("yearly")}
              className={`px-3 py-2 text-[10px] font-heading uppercase tracking-widest border rounded-sm transition-colors ${
                mode === "yearly"
                  ? "gold-gradient text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              Yearly Sales Revenue
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            {mode === "range" ? (
              <>
                <div>
                  <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1">Start Date</p>
                  <input
                    type="date"
                    value={safeRange.startDate}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1">End Date</p>
                  <input
                    type="date"
                    value={safeRange.endDate}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setPresetRange(7)} className="px-3 py-2 text-[10px] font-heading uppercase tracking-widest border border-border rounded-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">Last 7D</button>
                  <button onClick={() => setPresetRange(30)} className="px-3 py-2 text-[10px] font-heading uppercase tracking-widest border border-border rounded-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">Last 30D</button>
                  <button onClick={() => setPresetRange(90)} className="px-3 py-2 text-[10px] font-heading uppercase tracking-widest border border-border rounded-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">Last 90D</button>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1">Select Year</p>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year} className="bg-card">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <button onClick={handleDownloadCsv} className="px-3 py-2 text-[10px] font-heading uppercase tracking-widest border border-border rounded-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">Download CSV</button>
              <button onClick={handleDownloadXls} className="px-3 py-2 text-[10px] font-heading uppercase tracking-widest border border-border rounded-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">Download XLS</button>
              <button onClick={handleDownloadPdf} className="px-3 py-2 text-[10px] font-heading uppercase tracking-widest border border-border rounded-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">Download PDF</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {statCard(<ShoppingCart className="w-5 h-5 text-primary" />, mode === "yearly" ? "Orders In Year" : "Orders In Range", displayOrders.length)}
          {statCard(<DollarSign className="w-5 h-5 text-primary" />, mode === "yearly" ? "Revenue In Year" : "Revenue In Range", formatPrice(displayRevenue), true)}
          {statCard(<Package className="w-5 h-5 text-primary" />, mode === "yearly" ? "Products In Year" : "Products Created", productsInScope)}
          {statCard(<Users className="w-5 h-5 text-primary" />, mode === "yearly" ? "Users In Year" : "Users Added", usersInScope)}
          {statCard(<MessageSquare className="w-5 h-5 text-primary" />, mode === "yearly" ? "Reviews In Year" : "Reviews Added", reviewsInScope)}
          {statCard(<Gift className="w-5 h-5 text-primary" />, mode === "yearly" ? "Offers In Year" : "Offers Started", offersInScope)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-5">
            <h2 className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-3">Order Status Breakdown</h2>
            {ordersByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders in selected range.</p>
            ) : (
              <div className="space-y-2">
                {ordersByStatus.map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between border border-border/60 rounded-sm px-3 py-2">
                    <span className="text-xs font-heading uppercase tracking-wider">{status}</span>
                    <span className="text-sm text-primary font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-3">Top Selling Products</h2>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No product sales in selected range.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map(([name, qty]) => (
                  <div key={name} className="flex items-center justify-between border border-border/60 rounded-sm px-3 py-2">
                    <span className="text-xs truncate pr-3">{name}</span>
                    <span className="text-sm text-primary font-semibold">{qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h2 className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-3">
              {mode === "yearly" ? `Monthly Sales Revenue (${selectedYear})` : "Daily Revenue Trend"}
            </h2>
            {mode === "yearly" ? (
              monthlyRevenue.every((row) => row.revenue === 0) ? (
                <p className="text-sm text-muted-foreground">No revenue in selected year.</p>
              ) : (
                <div className="space-y-2">
                  {monthlyRevenue.map((row) => (
                    <div key={row.month}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">{row.month}</span>
                        <span className="text-primary">{formatPrice(row.revenue)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full gold-gradient" style={{ width: `${row.width}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : dailyRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No revenue in selected range.</p>
            ) : (
              <div className="space-y-2">
                {dailyRevenue.map((row) => (
                  <div key={row.day}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">{row.day}</span>
                      <span className="text-primary">{formatPrice(row.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full gold-gradient" style={{ width: `${row.width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-3">Component Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Component</th>
                    <th className="text-left py-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Total</th>
                    <th className="text-left py-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">{mode === "yearly" ? "In Year" : "In Range"}</th>
                  </tr>
                </thead>
                <tbody>
                  {componentSummary.map((row) => (
                    <tr key={row.name} className="border-b border-border/50">
                      <td className="py-2">{row.name}</td>
                      <td className="py-2 text-muted-foreground">{row.total}</td>
                      <td className="py-2 text-primary font-semibold">{row.inScope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
