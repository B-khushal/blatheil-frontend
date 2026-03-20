import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatPrice";
import { toast } from "sonner";

const Wishlist = () => {
  const navigate = useNavigate();
  const { items, loading, removeFromWishlist, pendingProductIds } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (
    productId: string,
    name: string,
    price: number,
    images: string[],
    sizes: string[]
  ) => {
    const preferredSize = sizes[0] || "M";

    try {
      await addToCart(productId, name, price, 1, preferredSize, images);
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
      if (error instanceof Error && error.message === "Not authenticated") {
        navigate("/login");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="container pt-28 md:pt-32 pb-20">
          <div className="text-center text-muted-foreground">Loading wishlist...</div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <section className="container pt-28 md:pt-32 pb-20 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold uppercase mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">Save pieces you love and come back anytime.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 glow-button gold-gradient px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm"
          >
            Browse Collection
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container pt-28 md:pt-32 pb-20">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-wider mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase mb-12">Wishlist</h1>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product, i) => (
            <motion.article
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <Link to={`/product/${product._id}`} className="block aspect-[3/4] overflow-hidden bg-card">
                <img
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>

              <div className="p-4 space-y-3">
                <div>
                  <h2 className="font-heading text-sm uppercase tracking-wide">{product.name}</h2>
                  <p className="text-primary font-semibold">{formatPrice(product.price)}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleMoveToCart(
                        product._id,
                        product.name,
                        product.price,
                        product.images,
                        product.sizes
                      )
                    }
                    disabled={product.isSoldOut}
                    className="inline-flex items-center justify-center gap-2 border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-2 rounded-sm text-xs font-heading uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Move to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    disabled={pendingProductIds.has(product._id)}
                    className="inline-flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-destructive hover:border-destructive/60 transition-colors px-3 py-2 rounded-sm text-xs font-heading uppercase tracking-widest disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Wishlist;
