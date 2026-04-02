import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, MessageCircle, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppUrl } from "@/lib/contact";
import { useCurrency } from "@/context/CurrencyContext";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const totalPrice = getTotal();

  const whatsappMsg = `Hello BLATHEIL, I want to order:\n${items
    .map((item) => `- ${item.name} (${item.size}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join("\n")}\n\nTotal: ${formatPrice(totalPrice)}`;

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
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-wider mb-8">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase mb-12">Your Cart</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 flex gap-4"
              >
                <img src={item.images?.[0] || "/placeholder.svg"} alt={item.name} className="w-20 h-24 md:w-24 md:h-32 object-cover rounded-sm" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-sm uppercase tracking-wide">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-heading">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-heading text-primary">{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.productId, item.size)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-6 h-fit sticky top-24">
            <h3 className="font-heading uppercase tracking-widest text-sm mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-heading uppercase tracking-wider text-sm">Total</span>
                <span className="font-heading text-lg text-primary">{formatPrice(totalPrice)}</span>
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
      </section>
    </Layout>
  );
};

export default Cart;
