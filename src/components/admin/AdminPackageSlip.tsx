import { forwardRef } from "react";
import { formatPrice } from "@/lib/formatPrice";

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

interface AdminPackageSlipProps {
  order: PrintOrder;
  currencyFormatPrice?: (price: number) => string;
}

export const AdminPackageSlip = forwardRef<HTMLDivElement, AdminPackageSlipProps>(({ order, currencyFormatPrice }, ref) => {
  const formatter = currencyFormatPrice || formatPrice;
  return (
    <div ref={ref} className="bg-white text-black p-4 font-mono text-sm" style={{ width: "100mm", minHeight: "150mm", margin: "0 auto", padding: "10mm" }}>
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter mix-blend-difference pb-1">BLATHEIL</h1>
        <h2 className="text-lg font-bold uppercase border border-black inline-block px-3 py-1 mt-2">PACKAGE SLIP</h2>
      </div>

      <div className="mb-6">
        <p><span className="font-bold uppercase">Order:</span> #{order._id.slice(-8).toUpperCase()}</p>
        <p><span className="font-bold uppercase">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
        <p><span className="font-bold uppercase">Total:</span> {formatter(order.totalPrice || 0)}</p>
        <p className="mt-1 font-bold">
          [ PREPAID ]
        </p>
      </div>

      <div className="border border-black p-3 mb-6">
        <p className="font-bold uppercase border-b border-black pb-1 mb-2">Ship To:</p>
        <p className="font-bold text-base">{order.userId?.name || "Customer"}</p>
        <p className="mt-1 whitespace-pre-wrap">{order.shippingAddress || "No address provided"}</p>
        <p className="mt-2 font-bold uppercase">PH: {order.phone || "N/A"}</p>
      </div>

      <div className="mb-6">
        <p className="font-bold uppercase border-b-2 border-black pb-1 mb-2">Items Included:</p>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start mb-2 pb-2 border-b border-gray-300 border-dashed">
            <div className="w-4/5">
              <p className="font-bold uppercase">{item.productId?.name || "BLATHEIL Product"}</p>
              {item.size && <p className="text-xs">SIZE: {item.size}</p>}
            </div>
            <div className="w-1/5 text-right font-bold text-lg">
              x{item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 text-xs">
        <p className="font-bold border border-black p-2 italic inline-block">
          DELIVERY NOTES: Leave at door if no response.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="w-full h-12 border-2 border-black flex items-center justify-center bg-gray-100">
           {/* Barcode Placeholder */}
           <div className="flex gap-1 h-8 items-end">
             <div className="w-1 h-full bg-black"></div><div className="w-2 h-full bg-black"></div><div className="w-1 h-full bg-black"></div><div className="w-4 h-full bg-black"></div><div className="w-1 h-full bg-black"></div><div className="w-2 h-full bg-black"></div><div className="w-1 h-full bg-black"></div><div className="w-3 h-full bg-black"></div><div className="w-1 h-full bg-black"></div>
           </div>
        </div>
      </div>

      <div className="text-center pt-4 text-xs font-sans uppercase">
        <p className="font-bold border-b border-black inline-block mb-1">PACKED BY BLATHEIL</p>
        <p className="font-bold">HANDLE WITH CARE</p>
        <p>BLATHEIL.COM</p>
      </div>
    </div>
  );
});

AdminPackageSlip.displayName = "AdminPackageSlip";
