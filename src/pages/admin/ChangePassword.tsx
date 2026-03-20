import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "sonner";

const ChangePassword = () => {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const { changePassword } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    const success = changePassword(oldPw, newPw);
    if (!success) {
      toast.error("Current password is incorrect");
      return;
    }
    toast.success("Password changed successfully!");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="BLATHEIL" className="h-10 mx-auto mb-4" />
            <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-heading uppercase tracking-widest">Change Password</h1>
            <p className="text-xs text-muted-foreground mt-1">You must change your default password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2 block">Current Password</label>
              <input
                type="password"
                required
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2 block">New Password</label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2 block">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full glow-button gold-gradient px-8 py-3.5 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm"
            >
              Update Password
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
