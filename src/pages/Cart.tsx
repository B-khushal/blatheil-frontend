import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trash2, Minus, Plus, ShoppingBag, MessageCircle, ArrowLeft,
  Tag, X, CheckCircle, AlertTriangle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useOffer } from "@/context/OfferContext";
import { buildWhatsAppUrl } from "@/lib/contact";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "sonner";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { appliedOffer, removeOffer, calcDiscount, checkEligibility, applyManualCode } = useOffer();

  const subtotal = getTotal();
  const discountAmount = calcDiscount(subtotal);
  const grandTotal = subtotal - discountAmount;
  const eligibility = appliedOffer ? checkEligibility(subtotal) : { eligible: false };

  // Show discount only when offer is applied AND eligible for current cart total
  const showDiscount = !!appliedOffer && eligibility.eligible && discountAmount > 0;

  // Ref to track previous eligibility so we don't fire the toast on every render
  const prevEligibleRef = useRef<boolean | null>(null);

  // Real-time cart revalidation: auto-remove offer if cart drops below minimum
  useEffect(() => {
    if (!appliedOffer) {
      prevEligibleRef.current = null;
      return;
    }

    const wasEligible = prevEligibleRef.current;
    const isNowEligible = eligibility.eligible;

    if (wasEligible === true && !isNowEligible) {
      // Cart just dropped below minimum — fire warning
      toast.warning("Offer removed: cart no longer meets minimum order value.");
      removeOffer();
    }

    prevEligibleRef.current = isNowEligible;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, appliedOffer]);

  const whatsappMsg = `Hello BLATHEIL, I want to order:\n${items
    .map((item) => `- ${item.name} (${item.size}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join("\n")}\n\nSubtotal: ${formatPrice(subtotal)}${showDiscount ? `\nDiscount: -${formatPrice(discountAmount)}` : ""}\nTotal: ${formatPrice(grandTotal)}`;

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <Layout>
        <section className="container pt-28 md:pt-32 pb-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold uppercase mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Time to fill it with something bold.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 glow-button gold-gradient px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm"
          >
            Shop Now
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
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase mb-12">Your Cart</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Item list ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 flex gap-4"
              >
                <img
                  src={item.images?.[0] || "/placeholder.svg"}
                  alt={item.name}
                  className="w-20 h-24 md:w-24 md:h-32 object-cover rounded-sm"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-sm uppercase tracking-wide">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-heading">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-heading text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="space-y-4">

            {/* ━━ PROMO CODE INPUT (only show if no offer or to override) ━━ */}
            {!appliedOffer && (
              <div className="glass-card p-5">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">Promo Code</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="cart-promo-input"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors uppercase font-mono tracking-widest placeholder:text-white/20"
                    placeholder="Enter Code"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.currentTarget as HTMLInputElement).value;
                        if (val) applyManualCode(val, subtotal);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("cart-promo-input") as HTMLInputElement;
                      if (input.value) applyManualCode(input.value, subtotal);
                    }}
                    className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* ━━ PROMO CARD (Applied state) ━━ */}
            {appliedOffer && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border px-5 py-4 ${
                  eligibility.eligible
                    ? "border-emerald-500/30 bg-emerald-500/8"
                    : "border-amber-500/30 bg-amber-500/8"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {eligibility.eligible ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${eligibility.eligible ? "text-emerald-400" : "text-amber-400"}`}>
                        {eligibility.eligible ? "🎉 Offer Automatically Applied" : "⚠ Offer Ineligible"}
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-3.5 h-3.5 text-white/50" />
                        <span className="font-mono text-sm font-bold text-white tracking-widest">
                          {appliedOffer.code}
                        </span>
                      </div>
                      <p className="text-xs text-white/50">
                        {appliedOffer.discountType === "flat"
                          ? `₹${appliedOffer.discountValue} flat discount`
                          : `${appliedOffer.discountValue}% off your order`}
                      </p>
                      {!eligibility.eligible && eligibility.message && (
                        <p className="text-xs text-amber-300 mt-1">{eligibility.message}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={removeOffer}
                    title="Remove offer"
                    className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}


            {/* ━━ Order summary card ━━ */}
            <div className="glass-card p-6 sticky top-24">
              <h3 className="font-heading uppercase tracking-widest text-sm mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {/* Discount row */}
                {showDiscount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex justify-between text-sm text-emerald-400"
                  >
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Discount ({appliedOffer!.discountType === "flat"
                        ? `₹${appliedOffer!.discountValue}`
                        : `${appliedOffer!.discountValue}%`})
                    </span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </motion.div>
                )}

                {/* Ineligible offer warning in summary */}
                {appliedOffer && !eligibility.eligible && eligibility.message && (
                  <p className="text-xs text-amber-400/80">{eligibility.message}</p>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>

                {/* Grand total */}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-heading uppercase tracking-wider text-sm">Total</span>
                  <span className="font-heading text-lg text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to="/checkout"
                  className="text-center glow-button gold-gradient px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm w-full"
                >
                  Checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="border border-border px-8 py-3 text-xs font-heading uppercase tracking-widest text-muted-foreground rounded-sm hover:border-destructive hover:text-destructive transition-colors w-full"
                >
                  Clear Cart
                </button>
                <a
                  href={buildWhatsAppUrl(whatsappMsg)}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-border px-8 py-4 text-sm font-heading uppercase tracking-widest text-foreground rounded-sm flex items-center justify-center gap-3 hover:border-green-500 hover:text-green-500 transition-colors w-full"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
