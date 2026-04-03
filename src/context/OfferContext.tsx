import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════
   Types
══════════════════════════════════════════════════════════════ */
export interface ActiveOffer {
  _id: string;
  campaignId: string;
  title: string;
  subtitle?: string;
  couponCode?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minimumOrderValue?: number | null;
  isActive: boolean;
  popupDelay: number;
  showOnce: boolean;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  endDate?: string;
}

export interface AppliedOffer {
  code: string;
  campaignId: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minimumOrderValue?: number | null;
  title?: string;
  /** Legacy compat: percentage value for Checkout page reader */
  discountPercent?: number;
}

interface OfferContextType {
  /** Raw active offer fetched from API */
  activeOffer: ActiveOffer | null;
  /** Offer currently applied to cart */
  appliedOffer: AppliedOffer | null;
  /** Apply an offer — validates minimum order value */
  applyOffer: (offer: ActiveOffer, subtotal?: number) => boolean;
  /** Remove offer from cart and clear storage */
  removeOffer: () => void;
  /** Apply a manual coupon code by string */
  applyManualCode: (code: string, subtotal?: number) => Promise<{ success: boolean; message: string }>;
  /** Compute discount amount for a given subtotal */
  calcDiscount: (subtotal: number) => number;
  /** Validate if the applied offer is still eligible for the given subtotal */
  checkEligibility: (subtotal: number) => { eligible: boolean; message?: string };
  /** Whether the popup offer was accepted (not just seen) */
  offerAccepted: boolean;
}

/* ══════════════════════════════════════════════════════════════
   Storage helpers
══════════════════════════════════════════════════════════════ */
const STORAGE_KEYS = {
  COUPON_CODE:      "selectedCouponCode",
  CAMPAIGN:         "selectedOfferCampaign",
  OFFER_ACCEPTED:   "offerAccepted",
  REMOVED_PREFIX:   "blatheil_offer_removed_",
};

const readAppliedOffer = (): AppliedOffer | null => {
  try {
    const code = localStorage.getItem(STORAGE_KEYS.COUPON_CODE);
    const campaignRaw = localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
    const accepted = localStorage.getItem(STORAGE_KEYS.OFFER_ACCEPTED);
    if (!code || !campaignRaw || accepted !== "true") return null;
    const campaign = JSON.parse(campaignRaw) as AppliedOffer;
    return campaign;
  } catch {
    return null;
  }
};

const persistOffer = (offer: AppliedOffer) => {
  localStorage.setItem(STORAGE_KEYS.COUPON_CODE, offer.code);
  localStorage.setItem(STORAGE_KEYS.CAMPAIGN, JSON.stringify(offer));
  localStorage.setItem(STORAGE_KEYS.OFFER_ACCEPTED, "true");
};

const clearPersistedOffer = () => {
  localStorage.removeItem(STORAGE_KEYS.COUPON_CODE);
  localStorage.removeItem(STORAGE_KEYS.CAMPAIGN);
  localStorage.setItem(STORAGE_KEYS.OFFER_ACCEPTED, "false");
};

/* ══════════════════════════════════════════════════════════════
   Context
══════════════════════════════════════════════════════════════ */
const OfferContext = createContext<OfferContextType | undefined>(undefined);

export const OfferProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeOffer, setActiveOffer] = useState<ActiveOffer | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<AppliedOffer | null>(null);
  const [offerAccepted, setOfferAccepted] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  /* ── Fetch active offer from API + sync with localStorage ── */
  useEffect(() => {
    const fetchAndSync = async () => {
      try {
        const res = await fetch(`${API_URL}/offers/active`);
        if (!res.ok) {
          // No active offer — restore whatever is in localStorage as-is
          const persisted = readAppliedOffer();
          if (persisted) { setAppliedOffer(persisted); setOfferAccepted(true); }
          return;
        }

        const data = await res.json();
        if (!data?.success || !data?.data) {
          const persisted = readAppliedOffer();
          if (persisted) { setAppliedOffer(persisted); setOfferAccepted(true); }
          return;
        }

        const fresh = data.data as ActiveOffer;
        setActiveOffer(fresh);

        const removalKey = `${STORAGE_KEYS.REMOVED_PREFIX}${fresh.campaignId}`;
        const isPermanentlyRemoved = localStorage.getItem(removalKey) === "true";

        // ── Auto-Apply Logic ──
        if (isPermanentlyRemoved) {
          // User explicitly removed this campaign earlier. Respect their choice.
          setAppliedOffer(null);
          setOfferAccepted(false);
          return;
        }

        // Apply or Sync
        const payload: AppliedOffer = {
          code:              fresh.couponCode || fresh.campaignId,
          campaignId:        fresh.campaignId,
          discountType:      fresh.discountType,
          discountValue:     fresh.discountValue,
          minimumOrderValue: fresh.minimumOrderValue,
          title:             fresh.title,
          discountPercent:   fresh.discountType === "percentage" ? fresh.discountValue : undefined,
        };

        persistOffer(payload);
        setAppliedOffer(payload);
        setOfferAccepted(true);
      } catch {
        const persisted = readAppliedOffer();
        if (persisted) { setAppliedOffer(persisted); setOfferAccepted(true); }
      }
    };

    fetchAndSync();
  }, [API_URL]);

  /* ── Compute discount for a given subtotal ── */
  const calcDiscount = useCallback(
    (subtotal: number): number => {
      if (!appliedOffer || !appliedOffer.discountValue) return 0;
      if (appliedOffer.discountType === "flat") {
        return Math.min(appliedOffer.discountValue, subtotal);
      }
      return Math.round((subtotal * appliedOffer.discountValue) / 100);
    },
    [appliedOffer]
  );

  /* ── Check minimum order eligibility ── */
  const checkEligibility = useCallback(
    (subtotal: number): { eligible: boolean; message?: string } => {
      if (!appliedOffer) return { eligible: false };
      const minVal = appliedOffer.minimumOrderValue;
      if (minVal && minVal > 0 && subtotal < minVal) {
        return {
          eligible: false,
          message: `Offer valid on orders above ₹${minVal.toLocaleString("en-IN")}`,
        };
      }
      return { eligible: true };
    },
    [appliedOffer]
  );

  /* ── Apply offer ── */
  const applyOffer = useCallback(
    (offer: ActiveOffer, subtotal = 0): boolean => {
      // Validate minimum order
      if (offer.minimumOrderValue && offer.minimumOrderValue > 0 && subtotal < offer.minimumOrderValue) {
        toast.error(`This offer requires a minimum order of ₹${offer.minimumOrderValue.toLocaleString("en-IN")}`);
        return false;
      }

      const payload: AppliedOffer = {
        code:              offer.couponCode || offer.campaignId,
        campaignId:        offer.campaignId,
        discountType:      offer.discountType,
        discountValue:     offer.discountValue,
        minimumOrderValue: offer.minimumOrderValue,
        title:             offer.title,
        // Legacy compat for Checkout.tsx detectStoredOffer()
        discountPercent:   offer.discountType === "percentage" ? offer.discountValue : undefined,
      };

      persistOffer(payload);
      setAppliedOffer(payload);
      setOfferAccepted(true);

      // Mark popup seen
      localStorage.setItem(`blatheil_offer_seen_${offer.campaignId}`, "true");

      toast.success(
        offer.discountType === "percentage"
          ? `✔ ${offer.discountValue}% discount applied!`
          : `✔ ₹${offer.discountValue} discount applied!`
      );
      return true;
    },
    []
  );

  /* ── Apply manual code by string ── */
  const applyManualCode = useCallback(
    async (code: string, subtotal = 0): Promise<{ success: boolean; message: string }> => {
      if (!code.trim()) return { success: false, message: "Please enter a code" };

      try {
        const res = await fetch(`${API_URL}/offers/validate/${encodeURIComponent(code.trim())}`);
        const data = await res.json();

        if (!res.ok || !data?.success) {
          return { success: false, message: data?.message || "Invalid or inactive promo code" };
        }

        const freshOffer = data.data as ActiveOffer;

        // Use standard apply logic (handles storage + state + toast)
        const ok = applyOffer(freshOffer, subtotal);
        if (!ok) return { success: false, message: "Cart does not meet minimum order value" };

        return { success: true, message: "Promo code applied!" };
      } catch (err) {
        return { success: false, message: "Network error validation code" };
      }
    },
    [API_URL, applyOffer]
  );

  /* ── Remove offer ── */
  const removeOffer = useCallback(() => {
    if (appliedOffer) {
      // Mark as permanently removed for THIS campaign
      localStorage.setItem(`${STORAGE_KEYS.REMOVED_PREFIX}${appliedOffer.campaignId}`, "true");
    }
    clearPersistedOffer();
    setAppliedOffer(null);
    setOfferAccepted(false);
    toast.success("Offer removed successfully");
  }, [appliedOffer]);

  return (
    <OfferContext.Provider
      value={{ activeOffer, appliedOffer, applyOffer, applyManualCode, removeOffer, calcDiscount, checkEligibility, offerAccepted }}
    >
      {children}
    </OfferContext.Provider>
  );
};

export const useOffer = (): OfferContextType => {
  const ctx = useContext(OfferContext);
  if (!ctx) throw new Error("useOffer must be used within OfferProvider");
  return ctx;
};
