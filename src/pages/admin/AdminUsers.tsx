import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, UserPlus } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usersApi } from "@/data/adminStore";
import { AdminUser } from "@/types/admin";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { toast } from "sonner";

const AdminUsers = () => {
  const { user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>(usersApi.getAll());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "staff" as "admin" | "staff" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("All fields required");
      return;
    }
    const result = usersApi.create(form);
    if (!result) {
      toast.error("Email already exists");
      return;
    }
    setUsers(usersApi.getAll());
    setShowForm(false);
    setForm({ name: "", email: "", role: "staff" });
    toast.success(`Staff account created. Default password: password123`);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
      toast.error("Cannot delete your own account");
      return;
    }
    usersApi.delete(id);
    setUsers(usersApi.getAll());
    toast.success("User deleted");
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold uppercase">Users</h1>
            <p className="text-sm text-muted-foreground">{users.length} team members</p>
          </div>
          <button onClick={() => setShowForm(true)} className="glow-button gold-gradient px-5 py-2.5 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm flex items-center gap-2 w-fit">
            <UserPlus className="w-4 h-4" /> Add Staff
          </button>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="glass-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-heading text-sm font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading text-sm uppercase tracking-wide">{u.name}</h3>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-heading uppercase tracking-widest px-2 py-0.5 rounded-sm gold-gradient text-primary-foreground">
                      {u.role}
                    </span>
                    {u.mustChangePassword && (
                      <span className="text-[10px] font-heading uppercase tracking-widest text-yellow-500">
                        Must change password
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {u.id !== currentUser?.id && (
                <button onClick={() => handleDelete(u.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Create Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading uppercase tracking-widest text-sm">Add Staff Member</h2>
                  <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "staff" })} className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none">
                      <option value="staff" className="bg-card">Staff</option>
                      <option value="admin" className="bg-card">Admin</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Default password will be: <span className="text-primary">password123</span>. User will be forced to change it on first login.</p>
                  <button type="submit" className="w-full glow-button gold-gradient px-6 py-3 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm">
                    Create Account
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminUsers;
