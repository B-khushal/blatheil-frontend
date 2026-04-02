import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, LogOut, User, Heart, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { buildWhatsAppUrl, CONTACT_INSTAGRAM_URL } from "@/lib/contact";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { getItemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    setIsOpen(false);
    setIsAccountMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!accountMenuRef.current) {
        return;
      }

      if (!accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isAccountMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <nav className="container flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="relative z-10">
            <img src="/navbar-logo.png" alt="BLATHEIL" className="h-10 md:h-16" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-heading uppercase tracking-widest transition-colors hover:text-primary ${
                  location.pathname === link.path ? "text-primary" : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <div className="relative group">
              <button 
                className="text-xs font-heading font-medium tracking-wide flex items-center gap-1 border border-border/50 rounded-md px-2 py-1 text-foreground/80 hover:text-primary transition-colors"
              >
                {currency === "INR" ? "₹ INR" : "$ USD"}
              </button>
              <div className="absolute right-0 top-full mt-2 w-24 rounded-md border border-slate-700/90 bg-slate-900/95 backdrop-blur-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button
                  onClick={() => setCurrency("INR")}
                  className={`w-full text-left px-3 py-2 text-xs font-heading hover:bg-slate-800 transition-colors ${currency === "INR" ? "text-primary bg-slate-800/50" : "text-slate-300"}`}
                >
                  ₹ INR
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`w-full text-left px-3 py-2 text-xs font-heading hover:bg-slate-800 transition-colors ${currency === "USD" ? "text-primary bg-slate-800/50" : "text-slate-300"}`}
                >
                  $ USD
                </button>
              </div>
            </div>

            <Link to="/wishlist" className="relative group">
              <Heart className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
              {wishlistItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full gold-gradient text-[10px] font-bold flex items-center justify-center text-primary-foreground"
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative group">
              <ShoppingBag className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
              {getItemCount() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold flex items-center justify-center text-white"
                >
                  {getItemCount()}
                </motion.span>
              )}
            </Link>

            {/* Auth Links */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm text-primary hover:text-primary/80 px-2 py-1"
                  >
                    Admin
                  </Link>
                )}
                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isAccountMenuOpen}
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors ${
                      isAccountMenuOpen
                        ? "text-primary bg-secondary/70"
                        : "text-foreground/70 hover:text-primary hover:bg-secondary/50"
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {isAccountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-full mt-2.5 w-56 rounded-xl border border-slate-700/90 bg-slate-900/95 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.45)] py-2 z-50"
                      >
                        <p className="px-4 py-2.5 text-sm text-slate-300 border-b border-slate-700/80 truncate">
                          {user?.name}
                        </p>

                        <Link
                          to="/my-orders"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="mx-1.5 mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            logout();
                          }}
                          className="mx-1.5 mb-1 mt-1 flex w-[calc(100%-0.75rem)] items-center gap-2 rounded-md px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:text-primary/80 transition-colors px-2 py-1"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm text-primary hover:text-primary/80 transition-colors px-2 py-1"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-foreground/70 hover:text-primary transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 md:hidden"
          >
            <div className="flex flex-col items-center gap-8 pt-12">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`text-2xl font-heading uppercase tracking-widest ${
                      location.pathname === link.path ? "gold-text" : "text-foreground/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="flex flex-col gap-4 mt-8 w-full px-4"
              >
                <a
                  href={buildWhatsAppUrl("Hello BLATHEIL, I want to know more about your latest collection.")}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center py-2 px-4 border border-border hover:border-primary text-foreground rounded transition-colors"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={CONTACT_INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center py-2 px-4 border border-border hover:border-primary text-foreground rounded transition-colors"
                >
                  @blatheil
                </a>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/my-orders"
                      className="text-center py-2 px-4 border border-border hover:border-primary text-foreground rounded transition-colors"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
