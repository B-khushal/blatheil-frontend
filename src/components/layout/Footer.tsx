import { Link } from "react-router-dom";
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_INSTAGRAM_HANDLE, CONTACT_INSTAGRAM_URL, buildWhatsAppUrl } from "@/lib/contact";

const Footer = () => (
  <footer className="border-t border-primary/20 bg-black">
    <div className="container py-10 text-center">
      <div className="mb-4 space-y-1">
        <a href={`mailto:${CONTACT_EMAIL}`} className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
          Email: {CONTACT_EMAIL}
        </a>
        <a href={buildWhatsAppUrl("Hello BLATHEIL, I want to chat about an order.")} target="_blank" rel="noreferrer" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
          WhatsApp: {CONTACT_PHONE_DISPLAY}
        </a>
        <a href={CONTACT_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="block text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
          Instagram: {CONTACT_INSTAGRAM_HANDLE}
        </a>
      </div>

      <p className="text-sm tracking-wide text-primary">© 2026 BLATHEIL. All rights reserved.</p>
      <div className="mt-4 flex items-center justify-center gap-6">
        <Link to="/privacy" className="text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
          Privacy Policy
        </Link>
        <Link to="/terms" className="text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
          Terms of Service
        </Link>
        <Link to="/contact" className="text-xs uppercase tracking-widest text-primary/80 hover:text-primary transition-colors">
          Contact
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
