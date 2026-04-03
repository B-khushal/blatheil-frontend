import React, { useEffect, useState } from "react";
import { X, Clock, Tag, ShoppingBag, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOffer, ActiveOffer } from "@/context/OfferContext";
import { useCart } from "@/context/CartContext";

export default function OfferPopup() {
  const [offer, setOffer] = useState<ActiveOffer | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  const { applyOffer, appliedOffer } = useOffer();
  const { getTotal, items } = useCart();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await fetch(`${API_URL}/offers/active`);
        if (!response.ok) { setLoading(false); return; }

        const data = await response.json();
        if (data?.success && data?.data) {
          const currentOffer = data.data as ActiveOffer;

          // Show frequency logic
          const seenKey = `blatheil_offer_seen_${currentOffer.campaignId}`;
          const isSeen = localStorage.getItem(seenKey);
          const shouldSkip = currentOffer.showOnce && isSeen;

          if (!shouldSkip) {
            setOffer(currentOffer);
            setTimeout(() => setShow(true), currentOffer.popupDelay || 3000);
          }
        }
      } catch (error) {
        console.error("Error fetching offer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [API_URL]);

  const handleDismiss = () => {
    setShow(false);
    if (offer && offer.showOnce) {
      // Mark as seen so it won't appear again ONLY if showOnce is enabled
      localStorage.setItem(`blatheil_offer_seen_${offer.campaignId}`, "true");
    }
  };

  if (loading || !offer || appliedOffer) return null;

  const hasCoupon = !!offer.couponCode;
  const hasDiscount = offer.discountValue > 0;
  const discountLabel =
    offer.discountType === "flat"
      ? `₹${offer.discountValue} OFF`
      : `${offer.discountValue}% OFF`;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
            style={{ boxShadow: "0 0 60px rgba(200,163,98,0.12), 0 25px 50px rgba(0,0,0,0.8)" }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss popup"
              className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white/60 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Hero image */}
            {offer.image ? (
              <div className="relative h-52 w-full overflow-hidden bg-zinc-900">
                <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              </div>
            ) : (
              <div className="flex h-20 w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                <Zap className="h-8 w-8 text-amber-400/60" />
              </div>
            )}

            <div className={`px-8 pb-8 text-center ${offer.image ? "pt-0 -mt-6 relative" : "pt-6"}`}>
              {/* Discount badge */}
              {hasDiscount && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-bold tracking-widest text-amber-400 mb-4">
                  <Tag className="h-3.5 w-3.5" />
                  {discountLabel}
                </div>
              )}

              {/* Title */}
              <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white leading-tight">
                {offer.title}
              </h2>

              {/* Subtitle */}
              {offer.subtitle && (
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{offer.subtitle}</p>
              )}

              {/* Minimum order note */}
              {offer.minimumOrderValue && offer.minimumOrderValue > 0 && (
                <p className="mt-2 text-xs text-zinc-500">
                  Valid on orders above{" "}
                  <span className="text-amber-400/80 font-semibold">
                    ₹{offer.minimumOrderValue.toLocaleString("en-IN")}
                  </span>
                </p>
              )}

              {/* Coupon chip */}
              {hasCoupon && (
                <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-amber-400/25 bg-amber-400/8 px-5 py-3">
                  <span className="text-xs tracking-[0.2em] text-amber-400/70 uppercase">Code</span>
                  <span className="font-mono text-lg font-bold text-amber-400 tracking-widest">
                    {offer.couponCode}
                  </span>
                </div>
              )}

              {/* Expiry */}
              {offer.endDate && (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Limited time offer</span>
                </div>
              )}

              {/* CTAs */}
              <div className="mt-8 space-y-3">
                {/* Primary — CONTINUE SHOPPING */}
                <button
                  onClick={handleDismiss}
                  className="w-full rounded-xl border border-white/10 bg-white py-4 text-sm font-bold uppercase tracking-[0.15em] text-black transition-all hover:bg-amber-400 hover:border-amber-400 hover:shadow-[0_0_24px_rgba(200,163,98,0.4)] active:scale-[0.98]"
                >
                  Continue Shopping
                </button>

                {/* If no discount, show navigate to shop button */}
                {!hasDiscount && (
                  <a
                    href={offer.buttonLink || "/shop"}
                    onClick={handleDismiss}
                    className="block w-full rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8323] py-4 text-sm font-bold uppercase tracking-[0.15em] text-slate-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {offer.buttonText || "SHOP NOW"}
                  </a>
                )}


              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
