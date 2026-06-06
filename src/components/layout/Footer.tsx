import { Link } from "react-router-dom";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_INSTAGRAM_HANDLE, CONTACT_INSTAGRAM_URL, buildWhatsAppUrl } from "@/lib/contact";
import { useCurrency } from "@/context/CurrencyContext";

const Footer = () => {
  const { setIsModalOpen } = useCurrency();

  return (
    <footer className="relative border-t border-primary/20 bg-black overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-20 left-1/4 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative z-10 py-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80 font-heading">Blatheil</p>
            <h3 className="text-2xl font-heading uppercase mt-3 gold-text">Born To Lead Style</h3>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Luxury streetwear for creators, dreamers, and leaders. Bold expression, premium quality, and fearless individuality.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-heading mb-4">Quick Links</p>
            <div className="space-y-3">
              <Link to="/shop" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Shop</Link>
              <Link to="/about" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Brand Story</Link>
              <Link to="/contact" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Contact</Link>
              <Link to="/my-orders" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">My Orders</Link>
              <button onClick={() => setIsModalOpen(true)} className="block text-left text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors focus:outline-none">Change Region</button>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-heading mb-4">Policies</p>
            <div className="space-y-3">
              <Link to="/privacy" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/shipping-policy" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Shipping Policy</Link>
              <Link to="/refund-policy" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Refund Policy</Link>
              <Link to="/cancellation-policy" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Cancellation and Return</Link>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-heading mb-4">Connect</p>
            <div className="space-y-3">
              <a href={`mailto:${CONTACT_EMAIL}`} className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Email: {CONTACT_EMAIL}</a>
              <a href={buildWhatsAppUrl("Hello BLATHEIL, I want to chat about an order.")} target="_blank" rel="noreferrer" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">WhatsApp: {CONTACT_PHONE_DISPLAY}</a>
              <a href={CONTACT_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">Instagram: {CONTACT_INSTAGRAM_HANDLE}</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wider text-primary/80">© 2026 Blatheil. All rights reserved.</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Lead. Build. Wear the mindset.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
