import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Search, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

const links = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Shop", path: "/shop" },
  { icon: Heart, label: "Wishlist", path: "/wishlist" },
  { icon: ShoppingBag, label: "Cart", path: "/cart" },
  { icon: User, label: "Contact", path: "/contact" },
];

const BottomNav = () => {
  const location = useLocation();
  const { getItemCount } = useCart();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-xl border-t border-border">
      <nav className="flex items-center justify-around h-16">
        {links.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={label} to={path} className="relative flex flex-col items-center gap-0.5">
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {label === "Cart" && getItemCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full gold-gradient text-[8px] font-bold flex items-center justify-center text-primary-foreground"
                  >
                    {getItemCount()}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
