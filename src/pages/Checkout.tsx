import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { isValidIndianPhone } from "@/lib/contact";
import { useCurrency } from "@/context/CurrencyContext";

type PaymentMethod = "Razorpay" | "COD";

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Razorpay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const submitLockRef = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
  const total = useMemo(() => getTotal(), [getTotal, items]);
  const shippingAddress = `${address.trim()}, ${city.trim()}, ${stateName.trim()} - ${pincode.trim()}`;

  const orderItemsPayload = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size,
  }));

  const validateForm = () => {
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!isValidIndianPhone(phone)) {
      setError("Please enter a valid Indian phone number");
      return false;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError("Please enter a valid 6-digit pincode");
      return false;
    }

    if (paymentMethod === "Razorpay" && !razorpayKeyId) {
      setError("Razorpay test key is not configured on frontend");
      return false;
    }

    return true;
  };

  const handleOrderSuccess = async (data: any) => {
    setSuccessMessage("Order placed successfully");
    await clearCart().catch(() => undefined);
    navigate("/order-success", {
      replace: true,
      state: {
        order: data?.order,
        whatsappLink: data?.whatsappLink,
        paymentStatus: data?.order?.paymentStatus,
      },
    });
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-400 mb-4">Your cart is empty</p>
              <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || loading) {
      return;
    }

    setError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    submitLockRef.current = true;
    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        const codResponse = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: orderItemsPayload,
            shippingAddress,
            phone,
            fullName,
            city,
            state: stateName,
            pincode,
            paymentMethod: "COD",
          }),
        });

        if (!codResponse.ok) {
          const codError = await codResponse.json();
          throw new Error(codError.message || "Failed to place COD order");
        }

        const codData = await codResponse.json();
        await handleOrderSuccess(codData.data);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout. Please check your connection.");
      }

      const paymentOrderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItemsPayload,
        }),
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
        prefill: {
          name: fullName,
          email: user?.email || "",
          contact: phone,
        },
        theme: {
          color: "#c8a362",
        },
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
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
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
      if (paymentMethod === "COD") {
        setLoading(false);
        submitLockRef.current = false;
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading uppercase tracking-wide text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-2">Secure payments powered by Razorpay test mode.</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-primary/15">
              <CardHeader>
                <CardTitle className="text-foreground">Delivery Address</CardTitle>
                <CardDescription>Add accurate details for faster dispatch and delivery updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">Full Name *</label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="bg-slate-800/70 border-slate-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">Phone Number *</label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91XXXXXXXXXX"
                      className="bg-slate-800/70 border-slate-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-foreground/90">Address *</label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House no, street, landmark"
                    className="bg-slate-800/70 border-slate-600 min-h-24"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">City *</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="bg-slate-800/70 border-slate-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">State *</label>
                    <Input
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="State"
                      className="bg-slate-800/70 border-slate-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">Pincode *</label>
                    <Input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      placeholder="6 digit pincode"
                      className="bg-slate-800/70 border-slate-600"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/15">
              <CardHeader>
                <CardTitle className="text-foreground">Payment Method</CardTitle>
                <CardDescription>Select your preferred payment option.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Razorpay")}
                  className={`w-full text-left p-4 rounded-md border transition-colors ${
                    paymentMethod === "Razorpay"
                      ? "border-primary bg-primary/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                  }`}
                >
                  <p className="font-semibold">Razorpay</p>
                  <p className="text-xs text-muted-foreground mt-1">UPI, Cards, Netbanking (Test Mode)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`w-full text-left p-4 rounded-md border transition-colors ${
                    paymentMethod === "COD"
                      ? "border-primary bg-primary/10"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                  }`}
                >
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground mt-1">Pay when the package arrives.</p>
                </button>
              </CardContent>
            </Card>

            {(error || successMessage) && (
              <div className={`p-3 rounded-md text-sm ${error ? "bg-red-500/10 border border-red-500/40 text-red-300" : "bg-green-500/10 border border-green-500/40 text-green-300"}`}>
                {error || successMessage}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 text-base gold-gradient text-primary-foreground">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Place Order • ${formatPrice(total)}`
              )}
            </Button>
          </div>

          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-4 border-primary/15">
              <CardHeader>
                <CardTitle className="text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                      <img
                        src={item.images?.[0] || "/placeholder.svg"}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-md border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity} • {item.size}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-700 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-slate-700">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-800/60 border border-slate-700 text-xs text-muted-foreground flex gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>For Razorpay, order is created only after server-side signature verification.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  );
}
