import { forwardRef } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/contact";

interface PrintItem {
  productId?: { name?: string };
  quantity: number;
  size?: string;
}

interface PrintOrder {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  userId?: { name: string; email: string };
  items: PrintItem[];
  shippingAddress?: string;
  phone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface AdminInvoicePrintProps {
  order: PrintOrder;
  currencyFormatPrice?: (price: number) => string;
}

export const AdminInvoicePrint = forwardRef<HTMLDivElement, AdminInvoicePrintProps>(({ order, currencyFormatPrice }, ref) => {
  const formatter = currencyFormatPrice || formatPrice;
  return (
    <div ref={ref} className="bg-white text-black p-10 font-sans" style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "40mm 20mm" }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">BLATHEIL</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Premium Streetwear</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-800">INVOICE</h2>
          <p className="text-sm font-semibold mt-2">Order #{order._id.slice(-8).toUpperCase()}</p>
          <p className="text-sm text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="flex justify-between mb-10 text-sm">
        <div className="w-1/2 pr-4">
          <p className="font-bold text-slate-800 uppercase tracking-widest mb-2 border-b pb-1 inline-block">Billed To / Shipped To</p>
          <p className="font-semibold text-slate-800">{order.userId?.name || "Customer"}</p>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{order.shippingAddress || "No address provided"}</p>
          <p className="text-slate-600 mt-1">Phone: {order.phone || "N/A"}</p>
        </div>
        <div className="w-1/2 pl-4 text-right">
          <p className="font-bold text-slate-800 uppercase tracking-widest mb-2 border-b pb-1 inline-block">Sold By</p>
          <p className="font-semibold text-slate-800">BLATHEIL APPARELS</p>
          <p className="text-slate-600 mt-1">Email: {CONTACT_EMAIL}</p>
          <p className="text-slate-600">Phone: {CONTACT_PHONE_DISPLAY}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-10">
        <thead>
          <tr className="bg-slate-100 uppercase text-xs tracking-widest text-slate-800">
            <th className="py-3 px-4 border">Item Description</th>
            <th className="py-3 px-4 border text-center">Qty</th>
            <th className="py-3 px-4 border text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-4 px-4 border">
                <p className="font-semibold text-slate-800">{item.productId?.name || "BLATHEIL Product"}</p>
                {item.size && <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Size: {item.size}</p>}
              </td>
              <td className="py-4 px-4 border text-center font-medium">{item.quantity}</td>
              <td className="py-4 px-4 border text-right font-semibold">--</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-12 text-sm">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600 uppercase tracking-widest">Subtotal</span>
            <span className="font-semibold">{formatter(order.totalPrice || 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200">
            <span className="text-slate-600 uppercase tracking-widest">Shipping</span>
            <span className="font-semibold text-green-600 uppercase">Free</span>
          </div>
          <div className="flex justify-between py-3 border-b-2 border-slate-800 mt-2">
            <span className="font-bold text-lg uppercase tracking-widest text-slate-800">Total</span>
            <span className="font-bold text-lg text-slate-800">{formatter(order.totalPrice || 0)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Notes */}
      <div className="flex justify-between items-end mt-12 mb-8 border-b-2 border-slate-800 pb-8">
        <div className="w-1/2">
          <p className="font-bold text-slate-800 uppercase tracking-widest mb-2 border-b pb-1 inline-block">Admin Notes</p>
          <div className="h-20 border border-dashed border-slate-400 mt-2 p-2 text-slate-500 italic text-xs">
            Admin/delivery notes can be written here.
          </div>
        </div>
        <div className="w-1/3 text-right flex flex-col items-end">
          <div className="w-48 h-16 border-2 border-black flex items-center justify-center bg-slate-100">
            {/* Barcode Placeholder */}
            <div className="flex gap-1 h-10 items-end">
              <div className="w-1 h-full bg-black"></div><div className="w-2 h-full bg-black"></div><div className="w-1 h-full bg-black"></div><div className="w-4 h-full bg-black"></div><div className="w-1 h-full bg-black"></div><div className="w-2 h-full bg-black"></div><div className="w-1 h-full bg-black"></div><div className="w-3 h-full bg-black"></div><div className="w-1 h-full bg-black"></div>
            </div>
          </div>
          <p className="text-[10px] uppercase font-mono tracking-widest mt-1">{order._id.toUpperCase()}</p>
        </div>
      </div>

      <div className="text-center pt-8 border-t border-slate-200 text-slate-500 text-xs text-center uppercase tracking-widest">
        <p className="font-bold text-slate-800 mb-2">PACKED BY BLATHEIL</p>
        <p>Thank you for choosing BLATHEIL.</p>
        <p className="mt-1">This is a computer-generated invoice and does not require a physical signature.</p>
      </div>
    </div>
  );
});

AdminInvoicePrint.displayName = "AdminInvoicePrint";
