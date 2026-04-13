import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOffer } from "@/context/OfferContext";
import { Loader2, ShieldCheck, Tag, X, CheckCircle2, Truck, RotateCcw, ChevronRight, Package } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { isValidIndianPhone } from "@/lib/contact";
import { useCurrency } from "@/context/CurrencyContext";

type PaymentMethod = "Razorpay";

/* ─────────────────── Razorpay script loader (unchanged) ─────────────────── */
const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });



/* ─────────────────── Sub-components ─────────────────── */
const SectionLabel: React.FC<{ step: number; title: string; subtitle?: string }> = ({ step, title, subtitle }) => (
  <div className="co-section-header">
    <span className="co-step-badge">{step}</span>
    <div>
      <h2 className="co-section-title">{title}</h2>
      {subtitle && <p className="co-section-sub">{subtitle}</p>}
    </div>
  </div>
);

const FieldGroup: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="co-field-group">
    <label className="co-label">
      {label}
      {required && <span className="co-required">*</span>}
    </label>
    {children}
    {error && <p className="co-field-error">{error}</p>}
  </div>
);

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════════ */
export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const { appliedOffer, activeOffer, removeOffer, calcDiscount, checkEligibility, applyOffer, applyManualCode } = useOffer();

  /* ── Form state ── */
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod] = useState<PaymentMethod>("Razorpay");

  /* ── UX state ── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pageReady, setPageReady] = useState(false);
  const submitLockRef = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

  /* ── Pricing calculations ── */
  const subtotal = useMemo(() => getTotal(), [getTotal, items]);
  const discountAmount = useMemo(() => calcDiscount(subtotal), [subtotal, calcDiscount]);
  const eligibility = useMemo(() => appliedOffer ? checkEligibility(subtotal) : { eligible: false }, [appliedOffer, subtotal, checkEligibility]);
  const showDiscount = !!appliedOffer && eligibility.eligible && discountAmount > 0;
  const total = subtotal - (showDiscount ? discountAmount : 0);

  const shippingAddress = `${address.trim()}, ${city.trim()}, ${stateName.trim()} - ${pincode.trim()}`;
  const orderItemsPayload = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size,
  }));

  /* ── Page ready fade-in ── */
  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* ── Field validation ── */
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "fullName": return !value.trim() ? "Full name is required" : "";
      case "phone": return !isValidIndianPhone(value) ? "Enter a valid Indian phone number" : "";
      case "email": return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Enter a valid email" : "";
      case "address": return !value.trim() ? "Address is required" : "";
      case "city": return !value.trim() ? "City is required" : "";
      case "stateName": return !value.trim() ? "State is required" : "";
      case "pincode": return !/^\d{6}$/.test(value.trim()) ? "Enter a valid 6-digit pincode" : "";
      default: return "";
    }
  };

  const handleFieldBlur = (name: string, value: string) => {
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateForm = (): boolean => {
    const fields = { fullName, phone, email, address, city, stateName, pincode };
    const errors: Record<string, string> = {};
    let valid = true;
    for (const [name, value] of Object.entries(fields)) {
      const err = validateField(name, value);
      if (err) { errors[name] = err; valid = false; }
    }
    setFieldErrors(errors);
    if (!valid) setError("Please fix the highlighted fields before continuing.");
    if (paymentMethod === "Razorpay" && !razorpayKeyId) {
      setError("Razorpay test key is not configured on frontend");
      return false;
    }
    return valid;
  };

  /* ── Order success handler (unchanged logic) ── */
  const handleOrderSuccess = async (data: any) => {
    setSuccessMessage("Order placed successfully");
    navigate("/order-success", {
      replace: true,
      state: {
        order: data?.order,
        whatsappLink: data?.whatsappLink,
        paymentStatus: data?.order?.paymentStatus,
      },
    });
    clearCart().catch(() => undefined);
  };

  /* ── Empty cart state ── */
  if (items.length === 0) {
    return (
      <Layout>
        <div className="co-empty-state">
          <div className="co-empty-card">
            <Package className="co-empty-icon" />
            <h2 className="co-empty-title">Your Bag is Empty</h2>
            <p className="co-empty-sub">Discover our latest drops and add items to continue.</p>
            <button className="co-primary-btn" onClick={() => navigate("/shop")}>
              Continue Shopping <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Place order handler (business logic preserved) ── */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || loading) return;
    setError("");
    setSuccessMessage("");
    if (!validateForm()) return;

    submitLockRef.current = true;
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Unable to load Razorpay checkout. Please check your connection.");

      const paymentOrderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: orderItemsPayload }),
      });

      if (!paymentOrderResponse.ok) {
        const paymentOrderError = await paymentOrderResponse.json();
        throw new Error(paymentOrderError.message || "Failed to initiate payment");
      }

      const paymentOrderPayload = await paymentOrderResponse.json();
      const paymentOrder = paymentOrderPayload.data;

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "BLATHEIL",
        description: "Premium Streetwear Order",
        order_id: paymentOrder.order_id,
        prefill: { name: fullName, email: user?.email || email, contact: phone },
        theme: { color: "#c8a362" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            submitLockRef.current = false;
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setLoading(true);
            const verifyResponse = await fetch(`${API_URL}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                ...response,
                items: orderItemsPayload,
                shippingAddress,
                phone,
                fullName,
                city,
                state: stateName,
                pincode,
              }),
            });

            if (!verifyResponse.ok) {
              const verifyError = await verifyResponse.json();
              throw new Error(verifyError.message || "Payment verification failed");
            }

            const verifyPayload = await verifyResponse.json();
            await handleOrderSuccess(verifyPayload.data);
          } catch (verifyErr) {
            setError(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed");
            submitLockRef.current = false;
            setLoading(false);
          }
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed. No order was created.");
        setLoading(false);
        submitLockRef.current = false;
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      submitLockRef.current = false;
    } finally {
      if (loading && !submitLockRef.current) setLoading(false);
    }
  };

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <Layout>
      {/* ── Checkout-scoped styles ── */}
      <style>{`
        /* ── Layout ── */
        .co-root {
          max-width: 1180px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          font-family: 'Inter', 'Space Grotesk', sans-serif;
          opacity: 0;
          transform: translateY(10px);
          animation: coFadeIn 0.4s ease forwards;
        }
        @keyframes coFadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Page header ── */
        .co-page-header { margin-bottom: 40px; }
        .co-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: hsl(0 0% 45%);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
          cursor: default;
        }
        .co-breadcrumb-link {
          color: hsl(0 0% 45%);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .co-breadcrumb-link:hover { color: hsl(43 74% 52%); }
        .co-page-title {
          font-size: clamp(26px, 4vw, 38px);
          font-weight: 700;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: hsl(0 0% 100%);
          margin: 0 0 6px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .co-page-sub {
          font-size: 13px;
          color: hsl(0 0% 45%);
          margin: 0;
        }

        /* ── Grid ── */
        .co-grid {
          display: grid;
          grid-template-columns: 1fr 370px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .co-grid {
            grid-template-columns: 1fr;
          }
          .co-sticky { position: static !important; }
        }

        /* ── Left column ── */
        .co-left { display: flex; flex-direction: column; gap: 24px; }

        /* ── Card base ── */
        .co-card {
          background: hsl(0 0% 6%);
          border: 1px solid hsl(0 0% 14%);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .co-card:hover {
          border-color: hsl(0 0% 20%);
          box-shadow: 0 4px 32px hsl(0 0% 0% / 0.4);
        }
        .co-card-body { padding: 28px; }

        /* ── Section header ── */
        .co-section-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 22px 28px;
          border-bottom: 1px solid hsl(0 0% 12%);
        }
        .co-step-badge {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: hsl(43 74% 52%);
          color: hsl(0 0% 0%);
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .co-section-title {
          font-size: 15px;
          font-weight: 600;
          color: hsl(0 0% 95%);
          margin: 0 0 2px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-family: 'Space Grotesk', sans-serif;
        }
        .co-section-sub {
          font-size: 12px;
          color: hsl(0 0% 45%);
          margin: 0;
        }

        /* ── Form fields ── */
        .co-form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .co-form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .co-form-grid-2, .co-form-grid-3 { grid-template-columns: 1fr; }
        }
        .co-field-group { display: flex; flex-direction: column; gap: 6px; }
        .co-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: hsl(0 0% 50%);
        }
        .co-required { color: hsl(43 74% 52%); margin-left: 2px; }
        .co-input {
          width: 100%;
          background: hsl(0 0% 9%);
          border: 1px solid hsl(0 0% 18%);
          border-radius: 10px;
          color: hsl(0 0% 95%);
          font-size: 14px;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .co-input::placeholder { color: hsl(0 0% 35%); }
        .co-input:focus {
          border-color: hsl(43 74% 52% / 0.7);
          box-shadow: 0 0 0 3px hsl(43 74% 52% / 0.10);
        }
        .co-input.has-error {
          border-color: hsl(0 70% 55% / 0.7);
          box-shadow: 0 0 0 3px hsl(0 70% 55% / 0.08);
        }
        .co-textarea {
          width: 100%;
          background: hsl(0 0% 9%);
          border: 1px solid hsl(0 0% 18%);
          border-radius: 10px;
          color: hsl(0 0% 95%);
          font-size: 14px;
          padding: 12px 14px;
          outline: none;
          resize: vertical;
          min-height: 90px;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        .co-textarea::placeholder { color: hsl(0 0% 35%); }
        .co-textarea:focus {
          border-color: hsl(43 74% 52% / 0.7);
          box-shadow: 0 0 0 3px hsl(43 74% 52% / 0.10);
        }
        .co-field-error { font-size: 11px; color: hsl(0 70% 60%); margin-top: 2px; }
        .co-form-space { display: flex; flex-direction: column; gap: 16px; }

        /* ── Delivery info card ── */
        .co-delivery-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid hsl(0 0% 11%);
        }
        .co-delivery-row:last-child { border-bottom: none; padding-bottom: 0; }
        .co-delivery-row:first-child { padding-top: 0; }
        .co-delivery-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: hsl(43 74% 52% / 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .co-delivery-info-title {
          font-size: 13px;
          font-weight: 600;
          color: hsl(0 0% 90%);
          margin: 0 0 2px;
        }
        .co-delivery-info-sub { font-size: 12px; color: hsl(0 0% 45%); margin: 0; }

        /* ── Coupon / offer card ── */
        .co-offer-auto {
          background: hsl(142 60% 12% / 0.8);
          border: 1px solid hsl(142 60% 25% / 0.5);
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: coFadeIn 0.4s ease;
        }
        .co-offer-check { color: hsl(142 60% 50%); flex-shrink: 0; margin-top: 1px; }
        .co-offer-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: hsl(142 60% 55%);
          margin: 0 0 3px;
        }
        .co-offer-code {
          font-size: 15px;
          font-weight: 700;
          color: hsl(0 0% 95%);
          letter-spacing: 0.08em;
          margin: 0 0 2px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .co-offer-desc { font-size: 12px; color: hsl(0 0% 50%); margin: 0; }
        .co-offer-remove {
          margin-left: auto;
          background: none;
          border: none;
          color: hsl(0 0% 40%);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .co-offer-remove:hover { color: hsl(0 70% 60%); background: hsl(0 70% 60% / 0.1); }
        .co-offer-empty {
          border: 1.5px dashed hsl(0 0% 20%);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .co-offer-empty-text { font-size: 13px; color: hsl(0 0% 40%); }

        /* ── Payment card ── */
        .co-payment-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px;
          border-radius: 12px;
          border: 1.5px solid hsl(43 74% 52% / 0.3);
          background: hsl(43 74% 52% / 0.06);
        }
        .co-payment-label {
          font-size: 14px;
          font-weight: 600;
          color: hsl(0 0% 92%);
          margin: 0 0 3px;
        }
        .co-payment-sub { font-size: 12px; color: hsl(0 0% 45%); margin: 0; }
        .co-payment-selected {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 2px solid hsl(43 74% 52%);
          background: hsl(43 74% 52%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .co-payment-inner {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: hsl(0 0% 0%);
        }

        /* ── Error / success alerts ── */
        .co-alert {
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          animation: coFadeIn 0.3s ease;
        }
        .co-alert-error {
          background: hsl(0 70% 55% / 0.1);
          border: 1px solid hsl(0 70% 55% / 0.3);
          color: hsl(0 70% 70%);
        }
        .co-alert-success {
          background: hsl(142 60% 50% / 0.1);
          border: 1px solid hsl(142 60% 50% / 0.3);
          color: hsl(142 60% 60%);
        }

        /* ── CTA button ── */
        .co-cta-btn {
          width: 100%;
          padding: 18px 24px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          border-radius: 12px;
          background: hsl(0 0% 98%);
          color: hsl(0 0% 4%);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.25s, transform 0.15s, box-shadow 0.25s;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .co-cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, hsl(43 74% 52% / 0.15) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .co-cta-btn:hover:not(:disabled)::after { opacity: 1; }
        .co-cta-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px hsl(0 0% 100% / 0.15);
        }
        .co-cta-btn:active:not(:disabled) { transform: translateY(0); }
        .co-cta-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }
        .co-spin { animation: coSpin 0.8s linear infinite; }
        @keyframes coSpin { to { transform: rotate(360deg); } }

        /* ── Right column: Order summary ── */
        .co-sticky { position: sticky; top: 24px; }
        .co-summary-items {
          max-height: 280px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-right: 4px;
        }
        .co-summary-items::-webkit-scrollbar { width: 3px; }
        .co-summary-items::-webkit-scrollbar-track { background: transparent; }
        .co-summary-items::-webkit-scrollbar-thumb { background: hsl(0 0% 25%); border-radius: 2px; }
        .co-item-row { display: flex; align-items: center; gap: 12px; }
        .co-item-img {
          width: 58px;
          height: 58px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid hsl(0 0% 16%);
          flex-shrink: 0;
          background: hsl(0 0% 10%);
        }
        .co-item-name {
          font-size: 13px;
          font-weight: 500;
          color: hsl(0 0% 90%);
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 155px;
        }
        .co-item-meta { font-size: 11px; color: hsl(0 0% 45%); margin: 0; }
        .co-item-price {
          margin-left: auto;
          font-size: 13px;
          font-weight: 600;
          color: hsl(0 0% 88%);
          white-space: nowrap;
        }
        .co-divider { height: 1px; background: hsl(0 0% 12%); margin: 16px 0; }
        .co-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin-bottom: 10px;
          color: hsl(0 0% 55%);
        }
        .co-price-row.discount { color: hsl(142 60% 55%); }
        .co-price-row.total {
          font-size: 17px;
          font-weight: 700;
          color: hsl(0 0% 96%);
          margin-bottom: 0;
          font-family: 'Space Grotesk', sans-serif;
        }
        .co-badge-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px;
          border-radius: 10px;
          background: hsl(0 0% 8%);
          border: 1px solid hsl(0 0% 14%);
          font-size: 12px;
          color: hsl(0 0% 45%);
          margin-top: 4px;
        }
        .co-badge-secure-icon { color: hsl(43 74% 52%); flex-shrink: 0; }

        /* ── Empty state ── */
        .co-empty-state {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .co-empty-card {
          text-align: center;
          max-width: 340px;
        }
        .co-empty-icon {
          width: 52px;
          height: 52px;
          color: hsl(0 0% 30%);
          margin: 0 auto 20px;
        }
        .co-empty-title {
          font-size: 22px;
          font-weight: 700;
          color: hsl(0 0% 90%);
          margin: 0 0 8px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .co-empty-sub {
          font-size: 14px;
          color: hsl(0 0% 45%);
          margin: 0 0 28px;
        }
        .co-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 13px 28px;
          background: hsl(0 0% 96%);
          color: hsl(0 0% 4%);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          font-family: 'Space Grotesk', sans-serif;
        }
        .co-primary-btn:hover { background: hsl(43 74% 52%); transform: translateY(-1px); }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .co-root { padding: 32px 16px 64px; }
          .co-card-body { padding: 20px; }
          .co-section-header { padding: 18px 20px; }
        }
      `}</style>

      <div className="co-root" style={{ animationDelay: pageReady ? "0ms" : "50ms" }}>

        {/* ── Page Header ── */}
        <div className="co-page-header">
          <div className="co-breadcrumb">
            <button className="co-breadcrumb-link" onClick={() => navigate("/shop")}>Shop</button>
            <ChevronRight size={12} />
            <button className="co-breadcrumb-link" onClick={() => navigate("/cart")}>Bag</button>
            <ChevronRight size={12} />
            <span style={{ color: "hsl(0 0% 70%)" }}>Checkout</span>
          </div>
          <h1 className="co-page-title">Secure Checkout</h1>
          <p className="co-page-sub">Payments powered by Razorpay · 256-bit SSL encrypted</p>
        </div>

        <form onSubmit={handlePlaceOrder} noValidate>
          <div className="co-grid">

            {/* ═══════════ LEFT COLUMN ═══════════ */}
            <div className="co-left">

              {/* ── 1. Customer Details ── */}
              <div className="co-card">
                <SectionLabel step={1} title="Customer Details" subtitle="We'll use these to contact you about your order" />
                <div className="co-card-body co-form-space">
                  <div className="co-form-grid-2">
                    <FieldGroup label="Full Name" required error={fieldErrors.fullName}>
                      <input
                        id="checkout-fullname"
                        className={`co-input${fieldErrors.fullName ? " has-error" : ""}`}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onBlur={(e) => handleFieldBlur("fullName", e.target.value)}
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </FieldGroup>
                    <FieldGroup label="Phone Number" required error={fieldErrors.phone}>
                      <input
                        id="checkout-phone"
                        type="tel"
                        className={`co-input${fieldErrors.phone ? " has-error" : ""}`}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        autoComplete="tel"
                      />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Email Address" required error={fieldErrors.email}>
                    <input
                      id="checkout-email"
                      type="email"
                      className={`co-input${fieldErrors.email ? " has-error" : ""}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={(e) => handleFieldBlur("email", e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </FieldGroup>

                  <FieldGroup label="Delivery Address" required error={fieldErrors.address}>
                    <textarea
                      id="checkout-address"
                      className="co-textarea"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onBlur={(e) => handleFieldBlur("address", e.target.value)}
                      placeholder="House / flat no., street name, landmark"
                      autoComplete="street-address"
                    />
                  </FieldGroup>

                  <div className="co-form-grid-3">
                    <FieldGroup label="City" required error={fieldErrors.city}>
                      <input
                        id="checkout-city"
                        className={`co-input${fieldErrors.city ? " has-error" : ""}`}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onBlur={(e) => handleFieldBlur("city", e.target.value)}
                        placeholder="City"
                        autoComplete="address-level2"
                      />
                    </FieldGroup>
                    <FieldGroup label="State" required error={fieldErrors.stateName}>
                      <input
                        id="checkout-state"
                        className={`co-input${fieldErrors.stateName ? " has-error" : ""}`}
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        onBlur={(e) => handleFieldBlur("stateName", e.target.value)}
                        placeholder="State"
                        autoComplete="address-level1"
                      />
                    </FieldGroup>
                    <FieldGroup label="Pincode" required error={fieldErrors.pincode}>
                      <input
                        id="checkout-pincode"
                        inputMode="numeric"
                        className={`co-input${fieldErrors.pincode ? " has-error" : ""}`}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        onBlur={(e) => handleFieldBlur("pincode", e.target.value)}
                        placeholder="6-digit pincode"
                        autoComplete="postal-code"
                      />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Delivery Notes (Optional)">
                    <textarea
                      id="checkout-notes"
                      className="co-textarea"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Special instructions for delivery (e.g. leave at door, call before delivery)"
                      style={{ minHeight: "72px" }}
                    />
                  </FieldGroup>
                </div>
              </div>

              {/* ── 2. Delivery Info ── */}
              <div className="co-card">
                <SectionLabel step={2} title="Delivery Summary" />
                <div className="co-card-body">
                  <div className="co-delivery-row">
                    <div className="co-delivery-icon-wrap">
                      <Truck size={18} color="hsl(43,74%,52%)" />
                    </div>
                    <div>
                      <p className="co-delivery-info-title">Estimated Delivery: 3–5 Business Days</p>
                      <p className="co-delivery-info-sub">Free shipping on all orders · No minimum order value</p>
                    </div>
                  </div>
                  <div className="co-delivery-row">
                    <div className="co-delivery-icon-wrap">
                      <RotateCcw size={18} color="hsl(43,74%,52%)" />
                    </div>
                    <div>
                      <p className="co-delivery-info-title">Easy 7-Day Returns</p>
                      <p className="co-delivery-info-sub">Hassle-free returns for unworn items in original packaging</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 3. Offer / Coupon Section ── */}
              <div className="co-card">
                <SectionLabel
                  step={3}
                  title="Offer Applied"
                  subtitle="Coupons selected from our offer popup are applied automatically"
                />
                <div className="co-card-body">
                  {appliedOffer ? (
                    <div className={`co-offer-auto${!eligibility.eligible ? " co-offer-warn" : ""}`}>
                      <CheckCircle2 size={20} className="co-offer-check" style={{ color: eligibility.eligible ? "hsl(142 70% 50%)" : "hsl(43 74% 52%)" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="co-offer-label" style={{ color: eligibility.eligible ? "hsl(142 70% 50%)" : "hsl(43 74% 52%)" }}>
                          {eligibility.eligible ? "✔ Offer Automatically Applied" : "⚠ Offer Ineligible"}
                        </p>
                        <p className="co-offer-code">{appliedOffer.code}</p>
                        <p className="co-offer-desc">
                          {appliedOffer.discountType === "flat"
                            ? `₹${appliedOffer.discountValue} flat discount`
                            : `${appliedOffer.discountValue}% off your order`}
                          {appliedOffer.title ? ` · ${appliedOffer.title}` : ""}
                        </p>
                        {!eligibility.eligible && eligibility.message ? (
                          <p style={{ fontSize: 11, color: "hsl(43 74% 60%)", marginTop: 4 }}>
                            ⚠ {eligibility.message}
                          </p>
                        ) : (
                          <p style={{ fontSize: 10, color: "hsl(0 0% 50%)", marginTop: 4 }}>
                            You can remove this offer anytime before paying.
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="co-offer-remove"
                        onClick={removeOffer}
                        title="Remove coupon"
                        aria-label="Remove coupon"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="co-offer-empty">
                      <Tag size={22} style={{ color: "hsl(0 0% 35%)", margin: "0 auto 8px", display: "block" }} />
                      <p className="co-offer-empty-text">
                        No active offers available right now.
                      </p>
                    </div>
                  )}

                  {/* ── Promo code manual entry ── */}
                  <div style={{ marginTop: appliedOffer ? 20 : 16, paddingTop: appliedOffer ? 20 : 0, borderTop: appliedOffer ? "1px solid hsl(0 0% 12%)" : "none" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(0 0% 40%)", marginBottom: 8 }}>
                      Have a promo code?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        id="checkout-promo-input"
                        placeholder="ENTER CODE"
                        style={{
                          flex: 1,
                          background: "hsl(0 0% 6%)",
                          border: "1px solid hsl(0 0% 15%)",
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontSize: 12,
                          color: "white",
                          fontFamily: "monospace",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase"
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.currentTarget as HTMLInputElement).value;
                            if (val) applyManualCode(val, subtotal);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById("checkout-promo-input") as HTMLInputElement;
                          if (input.value) applyManualCode(input.value, subtotal);
                        }}
                        style={{
                          background: "white",
                          color: "black",
                          border: "none",
                          borderRadius: 8,
                          padding: "0 16px",
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          cursor: "pointer"
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 4. Payment Method ── */}
              <div className="co-card">
                <SectionLabel step={4} title="Payment Method" subtitle="All transactions are 256-bit SSL encrypted" />
                <div className="co-card-body">
                  <div className="co-payment-option">
                    <ShieldCheck size={22} color="hsl(43,74%,52%)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p className="co-payment-label">Secure Online Payment</p>
                      <p className="co-payment-sub">UPI · Credit / Debit Cards · Net Banking · Wallets via Razorpay</p>
                    </div>
                    <div className="co-payment-selected">
                      <div className="co-payment-inner" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Error / Success messages ── */}
              {error && (
                <div className="co-alert co-alert-error" role="alert">
                  <span style={{ flexShrink: 0, marginTop: 1 }}>✕</span>
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="co-alert co-alert-success" role="status">
                  <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ── CTA (mobile: shows here) ── */}
              <div style={{ display: "none" }} className="co-mobile-cta">
                <button id="checkout-submit-mobile" type="submit" disabled={loading} className="co-cta-btn">
                  {loading
                    ? <><Loader2 size={18} className="co-spin" /> Processing…</>
                    : <><ShieldCheck size={17} /> Pay Securely · {formatPrice(total)}</>
                  }
                </button>
              </div>

            </div>
            {/* ── END LEFT ── */}

            {/* ═══════════ RIGHT COLUMN — Order Summary ═══════════ */}
            <div className="co-sticky">
              <div className="co-card">
                <div className="co-section-header" style={{ borderBottom: "1px solid hsl(0 0% 12%)" }}>
                  <div>
                    <h2 className="co-section-title" style={{ marginBottom: 0 }}>Order Summary</h2>
                    <p className="co-section-sub">{items.length} item{items.length !== 1 ? "s" : ""} in your bag</p>
                  </div>
                </div>

                <div className="co-card-body" style={{ paddingTop: 20 }}>
                  {/* Item list */}
                  <div className="co-summary-items">
                    {items.map((item) => (
                      <div key={`${item.productId}-${item.size}`} className="co-item-row">
                        <img
                          src={item.images?.[0] || "/placeholder.svg"}
                          alt={item.name}
                          className="co-item-img"
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="co-item-name">{item.name}</p>
                          <p className="co-item-meta">Qty {item.quantity} · Size {item.size}</p>
                        </div>
                        <span className="co-item-price">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="co-divider" />

                  {/* Price breakdown */}
                  <div className="co-price-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {showDiscount && (
                    <div className="co-price-row discount">
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Tag size={13} />
                        {appliedOffer!.discountType === "flat"
                          ? `Discount (₹${appliedOffer!.discountValue} off)`
                          : `Discount (${appliedOffer!.discountValue}% off)`}
                      </span>
                      <span>−{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  {appliedOffer && !eligibility.eligible && eligibility.message && (
                    <p style={{ fontSize: 11, color: "hsl(43 74% 60%)", marginBottom: 8 }}>
                      ⚠ {eligibility.message}
                    </p>
                  )}

                  <div className="co-price-row">
                    <span>Shipping</span>
                    <span style={{ color: "hsl(142 60% 55%)", fontWeight: 600 }}>FREE</span>
                  </div>

                  <div className="co-divider" />

                  <div className="co-price-row total">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                    <button id="checkout-submit" type="submit" disabled={loading} className="co-cta-btn">
                      {loading
                        ? <><Loader2 size={18} className="co-spin" /> Processing…</>
                        : <><ShieldCheck size={17} /> Pay Securely</>
                      }
                    </button>

                    <div className="co-badge-secure">
                      <ShieldCheck size={14} className="co-badge-secure-icon" />
                      <span>🔒 100% Secure Checkout · Powered by Razorpay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ── END RIGHT ── */}

          </div>
        </form>
      </div>
    </Layout>
  );
}
