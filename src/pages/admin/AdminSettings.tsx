import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, User, DollarSign, Loader2, Save } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_INSTAGRAM_HANDLE } from "@/lib/contact";

const AdminSettings = () => {
  const { user, token, changePassword, updateProfile } = useAuth();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPwUpdating, setIsPwUpdating] = useState(false);

  const [usdRate, setUsdRate] = useState<number>(83);
  const [lastRateSyncedAt, setLastRateSyncedAt] = useState<string | null>(null);
  const [rateProvider, setRateProvider] = useState<string>("manual/default");
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [isFetchingRate, setIsFetchingRate] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.usdRate) {
            setUsdRate(data.data.usdRate);
          }
          setLastRateSyncedAt(data?.data?.lastRateSyncedAt || null);
          setRateProvider(data?.data?.rateProvider || "manual/default");
        }
      } catch (err) {
        toast.error("Failed to load currency settings");
      } finally {
        setIsFetchingRate(false);
      }
    };
    fetchRate();
  }, [API_URL]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
  }, [user]);

  const handleRateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
       toast.error("Not authenticated");
       return;
    }
    setIsRateLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/currency-rate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ usdRate })
      });
      if (!res.ok) throw new Error("Failed to update rate");
      const data = await res.json();
      setLastRateSyncedAt(data?.data?.lastRateSyncedAt || new Date().toISOString());
      setRateProvider(data?.data?.rateProvider || "manual/admin");
      toast.success("Currency rate updated globally!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating rate");
    } finally {
      setIsRateLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error("Minimum 6 characters"); return; }
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    setIsPwUpdating(true);
    try {
      await changePassword(oldPw, newPw);
      setOldPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password update failed");
    } finally {
      setIsPwUpdating(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileUpdating(true);
    try {
      await updateProfile(profileName, profileEmail);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Profile update failed");
    } finally {
      setIsProfileUpdating(false);
    }
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold uppercase mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-heading uppercase tracking-widest text-sm">Profile Details</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4 flex-1 flex flex-col">
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Full Name</label>
                <input 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  required
                  className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Valid Email</label>
                <input 
                  type="email"
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)} 
                  required
                  className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors" 
                />
              </div>
              <div className="pb-4">
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">System Role</label>
                <span className="inline-block text-[10px] font-heading uppercase tracking-widest px-3 py-1 rounded-sm bg-secondary text-muted-foreground border border-border">
                  {user?.role || "Staff"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-2 italic">Roles cannot be modified directly from this dashboard.</p>
              </div>
              
              <div className="mt-auto pt-2">
                <button type="submit" disabled={isProfileUpdating || !user} className="glow-button px-6 py-3 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 text-black font-bold">
                  {isProfileUpdating ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4" />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-heading uppercase tracking-widest text-sm">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Current Password</label>
                <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">New Password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Confirm</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <button type="submit" disabled={isPwUpdating} className="glow-button border border-border px-6 py-3 text-xs font-heading uppercase tracking-widest hover:border-primary hover:text-primary transition-colors rounded-sm w-full flex justify-center items-center gap-2 mt-4 disabled:opacity-50">
                {isPwUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Update Password
              </button>
            </form>
          </div>

          {/* Currency Configuration */}
          <div className="glass-card p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="font-heading uppercase tracking-widest text-sm">Currency Configuration</h2>
            </div>
            {isFetchingRate ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading configuration...
              </div>
            ) : (
              <form onSubmit={handleRateUpdate} className="space-y-4 max-w-sm">
                <div>
                  <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Base Currency</label>
                  <input value="INR (₹)" disabled className="w-full bg-secondary/50 border border-border rounded-sm px-3 py-2 text-sm text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground mt-1">All products in the database default to INR.</p>
                </div>
                <div>
                  <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">USD Conversion Rate ($1 USD = ? INR)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    value={usdRate} 
                    onChange={(e) => setUsdRate(Number(e.target.value))} 
                    required 
                    className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Auto-updates daily from forex provider. Example: A rate of 83 means ₹1000 becomes ${(1000/83).toFixed(2)} USD.</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Last synced: {lastRateSyncedAt ? new Date(lastRateSyncedAt).toLocaleString() : "Not synced yet"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Source: {rateProvider}</p>
                </div>
                <button type="submit" disabled={isRateLoading} className="glow-button gold-gradient px-6 py-3 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm w-full flex justify-center items-center gap-2">
                  {isRateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Optional Manual Override
                </button>
              </form>
            )}
          </div>

          <div className="glass-card p-6 lg:col-span-2">
            <h2 className="font-heading uppercase tracking-widest text-sm mb-4 text-primary">Brand Contact Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                <p className="text-foreground">{CONTACT_EMAIL}</p>
              </div>
              <div>
                <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1">WhatsApp</p>
                <p className="text-foreground">Chat on WhatsApp ({CONTACT_PHONE_DISPLAY})</p>
              </div>
              <div>
                <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1">Instagram</p>
                <p className="text-foreground">{CONTACT_INSTAGRAM_HANDLE}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSettings;
