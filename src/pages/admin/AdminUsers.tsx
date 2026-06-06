import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, UserPlus, Loader2, Pencil } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminUser } from "@/types/admin";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const AdminUsers = () => {
  const { user: currentUser } = useAdminAuth();
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "password123",
    role: "sales_person" as "admin" | "manager" | "sales_person"
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const fetchTeamMembers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }
      const data = await response.json();
      
      const adapted = (data.data || []).map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        mustChangePassword: u.mustChangePassword,
        createdAt: u.createdAt
      }));
      
      setUsers(adapted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [token]);

  const handleEditClick = (u: AdminUser) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role
    });
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm({ name: "", email: "", password: "password123", role: "sales_person" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and Email are required");
      return;
    }
    if (!editingUser && !form.password.trim()) {
      toast.error("Password is required for new accounts");
      return;
    }
    if (!token) return;

    try {
      if (editingUser) {
        // Edit flow
        const response = await fetch(`${API_URL}/users/team/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update account");
        }

        toast.success("Staff account updated successfully!");
      } else {
        // Create flow
        const response = await fetch(`${API_URL}/users/team`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create account");
        }

        toast.success("Staff account created successfully!");
      }

      handleClose();
      await fetchTeamMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error("Cannot delete your own account");
      return;
    }
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/users/team/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete account");
      }

      toast.success("User deleted");
      await fetchTeamMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    }
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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Users List */
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id || u.email} className="glass-card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-heading text-sm font-bold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading text-sm uppercase tracking-wide">{u.name}</h3>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-heading uppercase tracking-widest px-2 py-0.5 rounded-sm font-semibold ${
                        u.role === "admin"
                          ? "gold-gradient text-primary-foreground"
                          : u.role === "manager"
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {u.role === "sales_person" ? "Sales Person" : u.role}
                      </span>
                      {u.mustChangePassword && (
                        <span className="text-[10px] font-heading uppercase tracking-widest text-yellow-500">
                          Must change password
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {u.email !== "blatheil134@gmail.com" && (
                    <button onClick={() => handleEditClick(u)} className="text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-4.5 h-4.5" />
                    </button>
                  )}
                  {u.id !== currentUser?.id && u.email !== "blatheil134@gmail.com" && (
                    <button onClick={() => handleDelete(u.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={handleClose}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading uppercase tracking-widest text-sm">{editingUser ? "Edit Staff Member" : "Add Staff Member"}</h2>
                  <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={editingUser?.email === "blatheil134@gmail.com"} className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50" />
                  </div>
                  {!editingUser && (
                    <div>
                      <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Initial Password</label>
                      <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "manager" | "sales_person" })} disabled={editingUser?.email === "blatheil134@gmail.com" || editingUser?.id === currentUser?.id} className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-50">
                      <option value="sales_person" className="bg-card">Sales Person</option>
                      <option value="manager" className="bg-card">Manager</option>
                      <option value="admin" className="bg-card">Admin</option>
                    </select>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{editingUser ? "Role cannot be demoted/edited for your own account." : "User will be forced to change password on first login."}</p>
                  <button type="submit" className="w-full glow-button gold-gradient px-6 py-3 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm">
                    {editingUser ? "Update Account" : "Create Account"}
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
