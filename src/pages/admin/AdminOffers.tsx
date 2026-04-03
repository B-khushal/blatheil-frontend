import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X, Eye, EyeOff, Percent, Tag } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

interface Offer {
  _id: string;
  title: string;
  subtitle: string;
  couponCode: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  campaignId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  popupDelay: number;
  showOnce: boolean;
  discountType: "percentage" | "flat";
  discountValue: number;
  minimumOrderValue: number | null;
}

const DEFAULT_FORM = {
  title: "",
  subtitle: "",
  couponCode: "",
  buttonText: "SHOP NOW",
  buttonLink: "/shop",
  image: "",
  campaignId: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  isActive: false,
  popupDelay: 3000,
  showOnce: true,
  discountType: "percentage" as "percentage" | "flat",
  discountValue: 0,
  minimumOrderValue: "" as number | "",
};

export default function AdminOffers() {
  const { token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOffers(data.data || []);
      }
    } catch {
      toast.error("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleToggleActive = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleEdit = (offer: Offer) => {
    setFormData({
      title:             offer.title,
      subtitle:          offer.subtitle || "",
      couponCode:        offer.couponCode || "",
      buttonText:        offer.buttonText || "SHOP NOW",
      buttonLink:        offer.buttonLink || "/shop",
      image:             offer.image || "",
      campaignId:        offer.campaignId,
      startDate:         offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 10) : "",
      endDate:           offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 10) : "",
      isActive:          offer.isActive,
      popupDelay:        offer.popupDelay || 3000,
      showOnce:          offer.showOnce !== undefined ? offer.showOnce : true,
      discountType:      offer.discountType || "percentage",
      discountValue:     offer.discountValue ?? 0,
      minimumOrderValue: offer.minimumOrderValue ?? "",
    });
    setCurrentOfferId(offer._id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      ...DEFAULT_FORM,
      campaignId: `camp_${Math.floor(Math.random() * 100000)}`,
    });
    setCurrentOfferId(null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side guard: discountValue must be a valid non-negative number
    const dv = Number(formData.discountValue);
    if (isNaN(dv) || dv < 0) {
      toast.error("Discount value must be a valid number (0 or above)");
      return;
    }

    try {
      const url = currentOfferId ? `${API_URL}/offers/${currentOfferId}` : `${API_URL}/offers`;
      const method = currentOfferId ? "PUT" : "POST";

      const payload = {
        ...formData,
        discountValue:     dv,
        minimumOrderValue: formData.minimumOrderValue === "" || Number(formData.minimumOrderValue) === 0
          ? null
          : Number(formData.minimumOrderValue),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Surface the real server error message
        let errMsg = "Failed to save offer";
        try {
          const errBody = await res.json();
          errMsg = errBody?.message || errBody?.error || errMsg;
        } catch { /* ignore parse errors */ }
        throw new Error(errMsg);
      }

      toast.success(`Offer ${currentOfferId ? "updated" : "created"} successfully`);
      setIsEditing(false);
      fetchOffers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving offer");
    }
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`${API_URL}/offers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { toast.success("Offer deleted"); fetchOffers(); }
      else throw new Error("Failed to delete offer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting offer");
    }
  };

  const handleToggleState = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/offers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) { toast.success(`Offer ${!currentStatus ? "activated" : "deactivated"}`); fetchOffers(); }
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading uppercase text-foreground">Offers &amp; Popups</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage promotional popups and discount campaigns</p>
          </div>
          {!isEditing && (
            <Button onClick={resetForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Create Offer
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── FORM ── */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{currentOfferId ? "Edit Offer" : "Create New Offer"}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Campaign ID */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Internal Campaign ID *</label>
                    <Input name="campaignId" value={formData.campaignId} onChange={handleChange} placeholder="e.g. spring_sale_2025" required />
                    <p className="text-xs text-muted-foreground">Changing this resets the "Seen" status for all users!</p>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Headline *</label>
                    <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. 20% OFF YOUR FIRST ORDER" required />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subtitle</label>
                    <Textarea name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="e.g. Join the club and receive exclusive benefits." rows={2} />
                  </div>

                  {/* Coupon code + Popup delay */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Coupon Code</label>
                      <Input name="couponCode" value={formData.couponCode} onChange={handleChange} placeholder="e.g. WELCOME20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Popup Delay (ms)</label>
                      <Input type="number" name="popupDelay" value={formData.popupDelay} onChange={handleChange} min="0" />
                    </div>
                  </div>

                  {/* ── DISCOUNT SECTION ── */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                      Discount Configuration
                    </p>

                    {/* Discount type */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Type</label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="percentage">Percentage (% off)</option>
                        <option value="flat">Flat Amount (₹ off)</option>
                      </select>
                    </div>

                    {/* Discount value */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Discount Value{" "}
                        <span className="text-muted-foreground font-normal">
                          ({formData.discountType === "percentage" ? "%" : "₹"})
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {formData.discountType === "percentage" ? <Percent className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                        </div>
                        <Input
                          type="number"
                          name="discountValue"
                          value={formData.discountValue}
                          onChange={handleChange}
                          placeholder={formData.discountType === "percentage" ? "e.g. 15" : "e.g. 500"}
                          min="0"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Minimum order value */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Minimum Order Value{" "}
                        <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                      </label>
                      <Input
                        type="number"
                        name="minimumOrderValue"
                        value={formData.minimumOrderValue}
                        onChange={handleChange}
                        placeholder="Leave empty for no minimum limit"
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground">
                        If set, discount applies only when cart ≥ this value.
                      </p>
                    </div>
                  </div>

                  {/* Button text + link */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Button Text</label>
                      <Input name="buttonText" value={formData.buttonText} onChange={handleChange} placeholder="e.g. SHOP NOW" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Button Link</label>
                      <Input name="buttonLink" value={formData.buttonLink} onChange={handleChange} placeholder="e.g. /shop" />
                    </div>
                  </div>

                  {/* Image upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Background Image</label>
                    <ImageUpload
                      onImagesUploaded={(imageUrls) => setFormData((prev) => ({ ...prev, image: imageUrls[0] || "" }))}
                      onError={(err) => toast.error(err)}
                      multiple={false}
                      maxImages={1}
                      existingImages={formData.image ? [formData.image] : []}
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date (Optional)</label>
                      <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch checked={formData.isActive} onCheckedChange={handleToggleActive} id="active-mode" />
                    <label htmlFor="active-mode" className="text-sm font-medium">
                      Enable this campaign (Active)
                    </label>
                  </div>

                  {/* Show Once toggle */}
                  <div className="flex items-center space-x-2 pt-2 pb-4 border-b border-white/5">
                    <Switch
                      checked={formData.showOnce}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, showOnce: checked }))}
                      id="show-once-mode"
                    />
                    <label htmlFor="show-once-mode" className="text-sm font-medium">
                      Show Once Per User (Recommended)
                    </label>
                    <p className="text-[10px] text-muted-foreground ml-auto">
                      {formData.showOnce ? "User sees popup 1x only" : "User sees popup every refresh"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" /> Save Offer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ── PREVIEW ── */}
            <div>
              <Card className="glass-card mb-4 bg-slate-950 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm text-slate-400">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
                    <div className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white/60">
                      <X className="h-4 w-4" />
                    </div>

                    {formData.image ? (
                      <div className="relative h-40 w-full bg-slate-800">
                        <img src={formData.image} alt="preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                      </div>
                    ) : (
                      <div className="h-10 w-full" />
                    )}

                    <div className={`p-6 text-center ${formData.image ? "pt-0 -mt-6 relative" : "pt-8"}`}>
                      {formData.discountValue > 0 && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold tracking-widest text-amber-400">
                          <Tag className="h-3 w-3" />
                          {formData.discountType === "percentage"
                            ? `${formData.discountValue}% OFF`
                            : `₹${formData.discountValue} OFF`}
                        </div>
                      )}

                      <h2 className="font-heading text-xl uppercase tracking-wider text-white">
                        {formData.title || "YOUR HEADLINE"}
                      </h2>
                      {formData.subtitle && (
                        <p className="mt-2 text-xs text-slate-400">{formData.subtitle}</p>
                      )}
                      {formData.minimumOrderValue !== "" && formData.minimumOrderValue !== null && (
                        <p className="mt-1 text-xs text-zinc-500">
                          Min. order: ₹{Number(formData.minimumOrderValue).toLocaleString("en-IN")}
                        </p>
                      )}
                      {formData.couponCode && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/8 px-4 py-2">
                          <span className="text-xs tracking-widest text-amber-400/70 uppercase">Code</span>
                          <span className="font-mono font-bold text-amber-400">{formData.couponCode}</span>
                        </div>
                      )}
                      <div className="mt-5">
                        {formData.discountValue > 0 ? (
                          <div className="w-full rounded-xl bg-white py-3 text-xs font-bold uppercase tracking-widest text-black">
                            Apply Offer
                          </div>
                        ) : (
                          <div className="w-full rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8323] py-3 text-xs font-bold uppercase tracking-widest text-slate-950">
                            {formData.buttonText || "SHOP NOW"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        ) : (
          /* ── CAMPAIGN LIST TABLE ── */
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Campaign List</CardTitle>
              <CardDescription>
                Multiple campaigns can be active. The **newest** active campaign will be used for the store's popup.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : offers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No offers found. Create one.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Campaign ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Coupon</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Min. Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer._id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={offer.isActive ? "text-green-500 hover:text-green-600 bg-green-500/10" : "text-slate-500"}
                              onClick={() => handleToggleState(offer._id, offer.isActive)}
                            >
                              {offer.isActive ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                              {offer.isActive ? "Active" : "Inactive"}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{offer.campaignId}</TableCell>
                          <TableCell className="font-medium">{offer.title}</TableCell>
                          <TableCell>
                            {offer.couponCode ? (
                              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-mono">{offer.couponCode}</span>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            {offer.discountValue > 0 ? (
                              <span className="bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded text-xs font-semibold">
                                {offer.discountType === "flat" ? `₹${offer.discountValue}` : `${offer.discountValue}%`}
                              </span>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${offer.showOnce ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}>
                              {offer.showOnce ? "Once" : "Repeated"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {offer.minimumOrderValue ? (
                              <span className="text-xs text-muted-foreground">₹{offer.minimumOrderValue.toLocaleString("en-IN")}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">None</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(offer)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDelete(offer._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
