import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ImageCarousel } from "@/components/ui/ImageCarousel";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist, pendingProductIds } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const wishlistActive = isInWishlist(product._id);
  const isPending = pendingProductIds.has(product._id);
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleAuthRequiredAction = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleToggleWishlist = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      handleAuthRequiredAction();
      return;
    }

    try {
      await toggleWishlist(product);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update wishlist");
    }
  };

  const handleAddToCart = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (product.isSoldOut) {
      toast.error("This item is sold out");
      return;
    }

    if (!isAuthenticated) {
      handleAuthRequiredAction();
      return;
    }

    try {
      const preferredSize = product.sizes?.[0] || "M";
      await addToCart(product._id, product.name, product.price, 1, preferredSize, product.images);
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-lg bg-card aspect-[3/4]">
        <Link to={`/product/${product._id}`} className="block h-full">
          <ImageCarousel
            images={product.images || []}
            alt={product.name}
            className="w-full h-full aspect-[3/4]"
            showThumbnails={false}
            enableHoverSlide
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Image count indicator for multiple images */}
          {hasMultipleImages && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-sm bg-primary/90 text-white text-xs font-semibold">
              {product.images.length} photos
            </div>
          )}

          <button
            type="button"
            aria-label={wishlistActive ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
            disabled={isPending}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-transform duration-200 hover:scale-110 disabled:opacity-60"
          >
            <motion.div
              animate={{ scale: wishlistActive ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.25 }}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${wishlistActive ? "fill-primary text-primary" : "text-white/90"}`}
              />
            </motion.div>
          </button>

          {product.isSoldOut && <span className="sold-out-badge rounded-sm">Sold Out</span>}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="inline-flex items-center gap-2 border border-primary/70 bg-background/70 px-4 py-2 rounded-sm text-xs font-heading uppercase tracking-widest text-primary">
              <Eye className="w-4 h-4" />
              View Product
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-3 space-y-2">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-heading text-sm uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-primary font-semibold">{formatPrice(product.price)}</p>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.isSoldOut}
          className="w-full inline-flex items-center justify-center gap-2 border border-primary/50 px-3 py-2 rounded-sm text-xs font-heading uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </motion.article>
  );
};

export default ProductCard;
