import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Truck, PackageSearch } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as {
    order?: {
      _id?: string;
      paymentStatus?: string;
      shipping_status?: string;
      awb_code?: string;
    };
    whatsappLink?: string;
    paymentStatus?: string;
  };

  const order = state.order;

  if (!order?._id) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16">
          <Card className="glass-card">
            <CardContent className="pt-6 text-center space-y-4">
              <PackageSearch className="w-9 h-9 mx-auto text-primary" />
              <p className="text-muted-foreground">Order summary not found. Please check your order history.</p>
              <Button onClick={() => navigate("/my-orders")}>Go to My Orders</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="glass-card border-primary/20">
          <CardHeader className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-3xl font-heading uppercase tracking-wide">Order Confirmed</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-md border border-slate-700 bg-slate-800/50">
                <p className="text-muted-foreground text-xs">Order ID</p>
                <p className="font-mono mt-1">{order._id}</p>
              </div>
              <div className="p-3 rounded-md border border-slate-700 bg-slate-800/50">
                <p className="text-muted-foreground text-xs">Payment Status</p>
                <p className="font-semibold mt-1">{order.paymentStatus || state.paymentStatus || "Pending"}</p>
              </div>
              <div className="p-3 rounded-md border border-slate-700 bg-slate-800/50 sm:col-span-2">
                <p className="text-muted-foreground text-xs">Shipping Status</p>
                <p className="font-semibold mt-1">{order.shipping_status || "Pending"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/my-orders")}>
                <Truck className="w-4 h-4" />
                My Orders
              </Button>

              {order.awb_code && (
                <Button variant="outline" onClick={() => navigate(`/track-order/${order.awb_code}`)}>
                  Track Order
                </Button>
              )}

              {state.whatsappLink && (
                <Button variant="outline" onClick={() => window.open(state.whatsappLink || "", "_blank")}>
                  Share on WhatsApp
                </Button>
              )}

              <Link to="/shop" className="ml-auto">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
