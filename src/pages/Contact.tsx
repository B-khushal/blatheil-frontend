import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, MessageCircle, Send } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import {
  CONTACT_EMAIL,
  CONTACT_INSTAGRAM_HANDLE,
  CONTACT_INSTAGRAM_URL,
  CONTACT_PHONE_DISPLAY,
  buildWhatsAppUrl,
} from "@/lib/contact";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.phone && !/^((\+91\s?)?[6-9]\d{9})$/.test(form.phone.replace(/[-()\s]/g, ""))) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to submit contact form");
      }

      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit form");
    }
  };

  return (
    <Layout>
      <section className="container pt-28 md:pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Get in Touch</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-md">Have a question, collab idea, or just want to connect? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2 block">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2 block">Phone (Optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                placeholder="+91 63041 97084"
              />
            </div>
            <div>
              <label className="text-xs font-heading uppercase tracking-widest text-muted-foreground mb-2 block">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent border border-border rounded-sm px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                placeholder="What's on your mind?"
              />
            </div>
            <button
              type="submit"
              className="glow-button gold-gradient px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm flex items-center gap-3"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-heading uppercase tracking-wider text-primary text-sm mb-3">Follow Us</h3>
              <div className="flex gap-4">
                <a href={CONTACT_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="glass-card p-4 hover:border-primary/50 transition-colors">
                  <Instagram className="w-5 h-5 text-foreground" />
                </a>
                <a href={buildWhatsAppUrl("Hello BLATHEIL, I want to connect with your team.")} target="_blank" rel="noreferrer" className="glass-card p-4 hover:border-primary/50 transition-colors">
                  <MessageCircle className="w-5 h-5 text-foreground" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-heading uppercase tracking-wider text-primary text-sm mb-3">Email</h3>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div>
              <h3 className="font-heading uppercase tracking-wider text-primary text-sm mb-3">WhatsApp</h3>
              <a href={buildWhatsAppUrl("Hello BLATHEIL, I want to connect with your team.")} target="_blank" rel="noreferrer" className="text-muted-foreground text-sm hover:text-primary transition-colors">
                Chat on WhatsApp ({CONTACT_PHONE_DISPLAY})
              </a>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-heading mb-2">DM us on Instagram</p>
              <p className="text-sm text-muted-foreground">The fastest way to reach us. Slide into our DMs {CONTACT_INSTAGRAM_HANDLE}.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
