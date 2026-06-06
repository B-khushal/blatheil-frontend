import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Star, XCircle, Search, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Product } from "@/types/product";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

const emptyProduct = {
  name: "",
  price: 0,
  category: "Hoodies",
  sizes: ["S", "M", "L", "XL"],
  stock: 0,
  images: [""],
  description: "",
  isFeatured: false,
  isSoldOut: false,
};

const categories = ["Hoodies", "Tees", "Bottoms", "Outerwear", "Accessories", "Sets"];
const allSizes = ["S", "M", "L", "XL", "XXL", "One Size"];

const AdminProducts = () => {
  const { token, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [page, setPage] = useState(1);
  const perPage = 6;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const fetchProducts = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProduct);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      sizes: p.sizes,
      stock: p.stock,
      images: p.images.length ? p.images : [""],
      description: p.description,
      isFeatured: p.isFeatured,
      isSoldOut: p.isSoldOut,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name required"); return; }
    if (form.price <= 0) { toast.error("Price must be positive"); return; }

    if (!token) {
      toast.error("Not authorized");
      return;
    }

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API_URL}/products/${editing._id}` : `${API_URL}/products`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save product");
      }

      toast.success(editing ? "Product updated" : "Product created");
      setShowForm(false);
      await fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted");
      await fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const toggleFeatured = async (p: Product) => {
    if (!token) return;

    await fetch(`${API_URL}/products/${p._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isFeatured: !p.isFeatured }),
    });

    await fetchProducts();
  };

  const toggleSoldOut = async (p: Product) => {
    if (!token) return;

    await fetch(`${API_URL}/products/${p._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isSoldOut: !p.isSoldOut }),
    });

    await fetchProducts();
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold uppercase">Products</h1>
            <p className="text-sm text-muted-foreground">{products.length} products</p>
          </div>
          {user?.role !== "sales_person" && (
            <button onClick={openCreate} className="glow-button gold-gradient px-5 py-2.5 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm flex items-center gap-2 w-fit">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full bg-transparent border border-border rounded-sm pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginated.map((p) => (
            <div key={p._id} className="glass-card p-4 group">
              <div className="flex gap-3">
                <div className="w-16 h-20 rounded-sm bg-secondary overflow-hidden flex-shrink-0">
                  {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-sm uppercase tracking-wide truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                  <p className="text-sm text-primary font-semibold mt-1">{formatPrice(p.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">Stock: {p.stock}</span>
                    {p.isFeatured && <span className="text-[10px] text-primary">★ Featured</span>}
                    {p.isSoldOut && <span className="text-[10px] text-destructive">Sold Out</span>}
                  </div>
                </div>
              </div>
              {user?.role !== "sales_person" && (
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                  <button onClick={() => openEdit(p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-heading uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggleFeatured(p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-heading uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <Star className="w-3 h-3" /> {p.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button onClick={() => toggleSoldOut(p)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-heading uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <XCircle className="w-3 h-3" /> {p.isSoldOut ? "Restock" : "Sold Out"}
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="ml-auto flex items-center gap-1 px-2 py-1 text-[10px] font-heading uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {loading && <p className="text-sm text-muted-foreground mb-4">Loading products...</p>}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-sm text-xs font-heading ${
                  page === i + 1 ? "gold-gradient text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Form Modal */}
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
                className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading uppercase tracking-widest text-sm">{editing ? "Edit" : "Add"} Product</h2>
                  <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Price (INR)</label>
                      <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Stock</label>
                      <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none">
                      {categories.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((s) => (
                        <button key={s} type="button" onClick={() => toggleSize(s)} className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${form.sizes.includes(s) ? "gold-gradient text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Product Images</label>
                    <p className="text-xs text-muted-foreground mb-3">
                      {form.images.length > 0 
                        ? `${form.images.length} image${form.images.length !== 1 ? 's' : ''} • Drag to add more`
                        : "Drag images to upload (Max 10)"}
                    </p>
                    <ImageUpload
                      onImagesUploaded={(imageUrls) => {
                        setForm((prev) => ({
                          ...prev,
                          images: imageUrls,
                        }));
                      }}
                      onError={(error) => {
                        toast.error(error);
                      }}
                      multiple={true}
                      maxImages={10}
                      existingImages={form.images}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
                    <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none" />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-primary" /> Featured
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" checked={form.isSoldOut} onChange={(e) => setForm({ ...form, isSoldOut: e.target.checked })} className="accent-primary" /> Sold Out
                    </label>
                  </div>
                  <button type="submit" className="w-full glow-button gold-gradient px-6 py-3 text-xs font-heading uppercase tracking-widest text-primary-foreground rounded-sm">
                    {editing ? "Update Product" : "Create Product"}
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

export default AdminProducts;
