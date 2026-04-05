import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, MessageCircle, ArrowLeft, Minus, Plus, Heart, Share2, Copy, Check, Send } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { buildWhatsAppUrl } from "@/lib/contact";
import { fetchProductById, fetchProducts } from "@/lib/products";
import { Product } from "@/types/product";
import { useCurrency } from "@/context/CurrencyContext";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { ReviewSection } from "@/components/ReviewSection";
import { ReviewForm } from "@/components/ReviewForm";
import ProductCard from "@/components/shop/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
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
        setShowReviewForm(false);

        // Product suggestions: same category first, then featured fallback.
        const sameCategory = await fetchProducts({ category: data.category, limit: 10 });
        const filteredSameCategory = sameCategory.filter((p) => p._id !== data._id).slice(0, 4);

        if (filteredSameCategory.length > 0) {
          setRecommendedProducts(filteredSameCategory);
        } else {
          const featured = await fetchProducts({ isFeatured: true, limit: 8 });
          setRecommendedProducts(featured.filter((p) => p._id !== data._id).slice(0, 4));
        }
      } catch {
        setProduct(null);
        setRecommendedProducts([]);
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
  const productUrl = `${window.location.origin}/product/${product._id}`;

  const handleNativeShare = async () => {
    const sharePayload = {
      title: `${product.name} | BLATHEIL`,
      text: `Check out ${product.name} by BLATHEIL`,
      url: productUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }
    } catch {
      // If native share is canceled or fails, fallback to copy link below.
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedLink(true);
      toast.success("Product link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      toast.error("Unable to share right now. Please copy the link manually.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopiedLink(true);
      toast.success("Product link copied");
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const encodedUrl = encodeURIComponent(productUrl);
  const encodedText = encodeURIComponent(`Check out ${product.name} by BLATHEIL`);

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

              {/* Professional share section */}
              <div className="mt-2 border border-border rounded-sm p-4 bg-card/50">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-xs font-heading uppercase tracking-[0.25em] text-muted-foreground">Share Product</p>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center gap-2 text-xs font-heading uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Quick Share
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <a
                    href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-border px-3 py-2 text-xs font-heading uppercase tracking-wider text-center hover:border-green-500 hover:text-green-500 transition-colors rounded-sm"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-border px-3 py-2 text-xs font-heading uppercase tracking-wider text-center hover:border-primary hover:text-primary transition-colors rounded-sm"
                  >
                    X / Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-border px-3 py-2 text-xs font-heading uppercase tracking-wider text-center hover:border-primary hover:text-primary transition-colors rounded-sm"
                  >
                    Facebook
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full border border-primary/50 px-4 py-2 text-xs font-heading uppercase tracking-wider text-primary rounded-sm hover:bg-primary hover:text-primary-foreground transition-colors inline-flex items-center justify-center gap-2"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? "Link Copied" : "Copy Product Link"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Review Section */}
      {product && (
        <section className="container pb-20">
          <ReviewSection
            productId={product._id}
            onWriteReview={() => {
              setShowReviewForm(true);
              requestAnimationFrame(() => {
                const el = document.getElementById(`review-form-${product._id}`);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              });
            }}
          />
        </section>
      )}

      {/* Review Form */}
      {product && showReviewForm && (
        <section className="container pb-20">
          <ReviewForm productId={product._id} onReviewSubmitted={() => window.location.reload()} />
        </section>
      )}

      {/* Recommended Products */}
      {product && recommendedProducts.length > 0 && (
        <section className="container pb-24">
          <div className="border-t border-border pt-12">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Suggestions</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold uppercase">Recommended For You</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendedProducts.map((item, index) => (
                <ProductCard key={item._id} product={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
