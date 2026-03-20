import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, MessageCircle, ArrowLeft, Minus, Plus, Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { buildWhatsAppUrl } from "@/lib/contact";
import { fetchProductById } from "@/lib/products";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatPrice";
import { ImageCarousel } from "@/components/ui/ImageCarousel";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist, pendingProductIds } = useWishlist();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await fetchProductById(id);
        setProduct(data);
        setSelectedSize(data.sizes?.[0] || "");
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container pt-32 pb-20 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container pt-32 pb-20 text-center">
          <p className="text-muted-foreground">Product not found.</p>
          <Link to="/shop" className="text-primary mt-4 inline-block">Back to Shop</Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.isSoldOut) {
      toast.error("This item is sold out");
      return;
    }
    addToCart(product._id, product.name, product.price, quantity, selectedSize, product.images)
      .then(() => toast.success("Added to cart"))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to add to cart"));
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    try {
      await toggleWishlist(product);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update wishlist");
    }
  };

  const whatsappMsg = `Hello BLATHEIL, I want to order ${product.name}. Size: ${selectedSize || "N/A"}. Qty: ${quantity}. Price: ${formatPrice(product.price * quantity)}.`;

  return (
    <Layout>
      <section className="container pt-24 md:pt-32 pb-20">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-wider mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative rounded-lg bg-card overflow-hidden"
          >
            <ImageCarousel
              images={product.images || []}
              alt={product.name}
              className="w-full aspect-[3/4]"
              showThumbnails={product.images && product.images.length > 1}
            />
            {product.isSoldOut && <span className="sold-out-badge rounded-sm">Sold Out</span>}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-heading font-bold uppercase mb-2">{product.name}</h1>
            <p className="text-2xl font-heading text-primary mb-6">{formatPrice(product.price)}</p>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Size */}
            <div className="mb-6">
              <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-sm font-heading uppercase rounded-sm transition-all duration-300 ${
                      selectedSize === size
                        ? "gold-gradient text-primary-foreground border-transparent"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-heading text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.isSoldOut}
                className="glow-button gold-gradient px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
              >
                <ShoppingBag className="w-4 h-4" />
                {product.isSoldOut ? "Sold Out" : "Add to Cart"}
              </button>
              <button
                onClick={handleToggleWishlist}
                disabled={pendingProductIds.has(product._id)}
                className="border border-primary/60 px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary rounded-sm flex items-center justify-center gap-3 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? "fill-current" : ""}`} />
                {isInWishlist(product._id) ? "Saved in Wishlist" : "Add to Wishlist"}
              </button>
              <a
                href={buildWhatsAppUrl(whatsappMsg)}
                target="_blank"
                rel="noreferrer"
                className="border border-border px-8 py-4 text-sm font-heading uppercase tracking-widest text-foreground rounded-sm flex items-center justify-center gap-3 hover:border-green-500 hover:text-green-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Order via WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
