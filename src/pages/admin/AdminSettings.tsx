import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, User } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "sonner";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_INSTAGRAM_HANDLE } from "@/lib/contact";

const AdminSettings = () => {
  const { user, changePassword } = useAdminAuth();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error("Minimum 6 characters"); return; }
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    const success = changePassword(oldPw, newPw);
    if (!success) { toast.error("Current password incorrect"); return; }
    setOldPw(""); setNewPw(""); setConfirmPw("");
    toast.success("Password updated successfully!");
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold uppercase mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-heading uppercase tracking-widest text-sm">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
                <input value={user?.name || ""} disabled className="w-full bg-secondary/50 border border-border rounded-sm px-3 py-2 text-sm text-muted-foreground" />
              </div>
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Email</label>
                <input value={user?.email || ""} disabled className="w-full bg-secondary/50 border border-border rounded-sm px-3 py-2 text-sm text-muted-foreground" />
              </div>
              <div>
                <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Role</label>
                <span className="inline-block text-[10px] font-heading uppercase tracking-widest px-3 py-1 rounded-sm gold-gradient text-primary-foreground">
                  {user?.role}
                </span>
              </div>
            </div>
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
              <button type="submit" className="glow-button gold-gradient px-6 py-3 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm w-full">
                Update Password
              </button>
            </form>
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
