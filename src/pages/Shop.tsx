import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { fetchProducts } from "@/lib/products";
import { Product } from "@/types/product";

const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under ₹2,999", min: 0, max: 2999 },
  { label: "₹3,000–₹7,999", min: 3000, max: 7999 },
  { label: "₹8,000+", min: 8000, max: Infinity },
];

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePriceRange, setActivePriceRange] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchProducts({ limit: 100 });
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((product) => product.category)));
    return ["All", ...uniqueCategories];
  }, [products]);

  const filtered = products.filter((p) => {
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const range = priceRanges[activePriceRange];
    const priceMatch = p.price >= range.min && p.price < range.max;
    return catMatch && priceMatch;
  });

  return (
    <Layout>
      <section className="container pt-28 md:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Collection</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase">Shop All</h1>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-heading uppercase tracking-widest border rounded-sm transition-all duration-300 ${
                  activeCategory === cat
                    ? "gold-gradient text-primary-foreground border-transparent"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range, i) => (
              <button
                key={range.label}
                onClick={() => setActivePriceRange(i)}
                className={`px-4 py-2 text-xs font-heading uppercase tracking-widest border rounded-sm transition-all duration-300 ${
                  activePriceRange === i
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-20 text-muted-foreground">Loading products...</div>}
        {error && <div className="text-center py-20 text-destructive">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="font-heading uppercase tracking-widest">No products found</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Shop;
