import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Loader2, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { CURRENCY_META, CurrencyCode } from "@/context/CurrencyContext";
import { toast } from "sonner";

type SettingsPayload = {
  usdRate: number;
  exchangeRates: Partial<Record<CurrencyCode, number>>;
  supportedCurrencies?: CurrencyCode[];
  lastRateSyncedAt?: string | null;
};

const AdminCurrencies = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [usdRate, setUsdRate] = useState<number>(83);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updatingRate, setUpdatingRate] = useState(false);

  const allCurrencies = (Object.keys(CURRENCY_META) as CurrencyCode[]);
  const displayCurrencies =
    settings?.supportedCurrencies && settings.supportedCurrencies.length > 0
      ? settings.supportedCurrencies.filter((code) => code in CURRENCY_META)
      : allCurrencies;

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings`);
      if (!res.ok) {
        throw new Error("Failed to fetch currency settings");
      }
      const data = await res.json();
      setSettings(data?.data || null);
      setUsdRate(Number(data?.data?.usdRate || 83));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load currencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [API_URL]);

  const handleForceSync = async () => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/settings/currency-sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to sync currencies");
      }
      const data = await res.json();
      setSettings(data?.data || null);
      toast.success("Currency rates synced");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Currency sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleUsdRateOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    if (!Number.isFinite(usdRate) || usdRate <= 0) {
      toast.error("Enter a valid USD rate");
      return;
    }

    setUpdatingRate(true);
    try {
      const res = await fetch(`${API_URL}/settings/currency-rate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usdRate }),
      });
      if (!res.ok) {
        throw new Error("Failed to update USD forex rate");
      }
      const data = await res.json();
      setSettings(data?.data || null);
      setUsdRate(Number(data?.data?.usdRate || usdRate));
      toast.success("USD forex rate updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Rate update failed");
    } finally {
      setUpdatingRate(false);
    }
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h1 className="text-3xl font-heading font-bold uppercase">Currencies</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">All supported currencies auto-sync daily. INR is the base currency for product pricing.</p>
          </div>
          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="glow-button gold-gradient px-4 py-2.5 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm flex items-center gap-2 disabled:opacity-60"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Now
          </button>
        </div>

        <div className="glass-card p-5 mb-6">
          <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground">Latest Sync</p>
          <p className="text-sm mt-1">{settings?.lastRateSyncedAt ? new Date(settings.lastRateSyncedAt).toLocaleString() : "Not synced yet"}</p>
          <p className="text-xs text-muted-foreground mt-2">Sync mode: Automatic daily currency sync</p>
          <p className="text-xs text-muted-foreground mt-2">Reference USD rate: {settings?.usdRate || 83} INR</p>
        </div>

        <div className="glass-card p-5 mb-6">
          <h2 className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-4">USD Forex Override (Optional)</h2>
          <form onSubmit={handleUsdRateOverride} className="max-w-sm space-y-3">
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">$1 USD = ? INR</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={usdRate}
                onChange={(e) => setUsdRate(Number(e.target.value))}
                className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-2">Use only when you need a manual override. Daily auto-sync still runs and can refresh rates.</p>
            </div>
            <button
              type="submit"
              disabled={updatingRate}
              className="glow-button gold-gradient px-4 py-2.5 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm flex items-center gap-2 disabled:opacity-60"
            >
              {updatingRate ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save USD Rate
            </button>
          </form>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-4">Supported Currencies (1 Unit = ? INR)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Currency</th>
                  <th className="text-left py-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">Code</th>
                  <th className="text-left py-2 text-xs font-heading uppercase tracking-widest text-muted-foreground">INR Rate</th>
                </tr>
              </thead>
              <tbody>
                {displayCurrencies.map((code) => (
                  <tr key={code} className="border-b border-border/50">
                    <td className="py-2">{CURRENCY_META[code]?.symbol || ""} {CURRENCY_META[code]?.label || code}</td>
                    <td className="py-2 text-muted-foreground">{code}</td>
                    <td className="py-2 text-primary font-semibold">{settings?.exchangeRates?.[code]?.toFixed(4) ?? "-"}</td>
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

export default AdminCurrencies;
