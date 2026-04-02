import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Truck, PackageCheck, Navigation, CalendarClock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrackingActivity {
  activity?: string;
  date?: string;
  location?: string;
}

interface TrackingResponse {
  awb_code: string;
  courier_name: string | null;
  current_status: string;
  shipping_status: string;
  etd: string | null;
  tracking_url: string | null;
  activities: TrackingActivity[];
}

const statusIcon = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("delivered")) return <PackageCheck className="w-4 h-4 text-green-500" />;
  if (normalized.includes("out for delivery")) return <Navigation className="w-4 h-4 text-orange-400" />;
  if (normalized.includes("transit") || normalized.includes("shipped")) {
    return <Truck className="w-4 h-4 text-indigo-400" />;
  }

  return <CalendarClock className="w-4 h-4 text-blue-400" />;
};

export default function TrackOrder() {
  const { awb } = useParams<{ awb: string }>();
  const [tracking, setTracking] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const fetchTracking = useCallback(async (silent = false) => {
    if (!awb) return;

    if (!silent) {
      setLoading(true);
    }

    try {
      const response = await fetch(`${API_URL}/shiprocket/track/${awb}`);
      if (!response.ok) {
        throw new Error("Unable to fetch tracking details");
      }

      const payload = await response.json();
      setTracking(payload.data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch tracking details");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [API_URL, awb]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchTracking(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [fetchTracking]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-heading uppercase tracking-wide">Track Order</CardTitle>
            <p className="text-sm text-muted-foreground">AWB: {awb}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading && (
              <div className="min-h-[25vh] flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
            )}

            {!loading && error && (
              <div className="p-4 rounded-md border border-red-500/40 bg-red-500/10 text-red-300">{error}</div>
            )}

            {!loading && !error && tracking && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-md border border-slate-700 bg-slate-800/50">
                    <p className="text-xs text-muted-foreground">Shipping Status</p>
                    <p className="font-semibold mt-1">{tracking.shipping_status || tracking.current_status}</p>
                  </div>
                  <div className="p-3 rounded-md border border-slate-700 bg-slate-800/50">
                    <p className="text-xs text-muted-foreground">Courier</p>
                    <p className="font-semibold mt-1">{tracking.courier_name || "Awaiting assignment"}</p>
                  </div>
                  <div className="p-3 rounded-md border border-slate-700 bg-slate-800/50">
                    <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                    <p className="font-semibold mt-1">{tracking.etd || "Will be updated soon"}</p>
                  </div>
                  <div className="p-3 rounded-md border border-slate-700 bg-slate-800/50">
                    <p className="text-xs text-muted-foreground">AWB Code</p>
                    <p className="font-semibold mt-1">{tracking.awb_code}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-heading uppercase text-sm tracking-widest">Shipment Timeline</h2>
                    <Button variant="outline" size="sm" onClick={() => fetchTracking()}>
                      Refresh
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(tracking.activities || []).length === 0 && (
                      <div className="text-sm text-muted-foreground p-3 border border-slate-700 rounded-md">
                        Timeline is not available yet. Please check again shortly.
                      </div>
                    )}

                    {(tracking.activities || []).map((activity, index) => (
                      <div key={`${activity.activity || "activity"}-${index}`} className="flex items-start gap-3 p-3 border border-slate-700 rounded-md bg-slate-800/40">
                        {statusIcon(activity.activity || "")}
                        <div>
                          <p className="text-sm font-medium">{activity.activity || "Status Updated"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {[activity.location, activity.date].filter(Boolean).join(" • ") || "Awaiting details"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {tracking.tracking_url && (
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => window.open(tracking.tracking_url || "", "_blank")}
                    >
                      Open Courier Tracking Page
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
