import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { HeroSection } from "@/components/ui/feature-carousel";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect, useState } from "react";
import { CONTACT_INSTAGRAM_HANDLE, CONTACT_INSTAGRAM_URL } from "@/lib/contact";
import { Product } from "@/types/product";
import { fetchProducts } from "@/lib/products";

import hoodieBlack from "@/assets/products/hoodie-black.jpg";
import cargoBlack from "@/assets/products/cargo-black.jpg";
import teeBlack from "@/assets/products/tee-black.jpg";
import bomberBlack from "@/assets/products/bomber-black.jpg";
import capGold from "@/assets/products/cap-gold.jpg";

const lookbookImages = [
  { src: hoodieBlack, alt: "Dominion Oversized Hoodie" },
  { src: bomberBlack, alt: "Sovereign Bomber Jacket" },
  { src: teeBlack, alt: "Legacy Graphic Tee" },
  { src: cargoBlack, alt: "Tactical Cargo Pants" },
  { src: capGold, alt: "Crown Snapback" },
];

const MarqueeText = () => (
  <div className="overflow-hidden py-6 border-y border-border bg-card/50">
    <div className="marquee whitespace-nowrap flex">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="mx-8 text-2xl md:text-4xl font-heading uppercase tracking-[0.3em] text-muted-foreground/30">
          Born to Lead Style ★
        </span>
      ))}
    </div>
  </div>
);

const CountdownTimer = () => {
  const [time, setTime] = useState({ days: 3, hours: 14, mins: 27, secs: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { days, hours, mins, secs } = prev;
        secs--;
        if (secs < 0) { secs = 59; mins--; }
        if (mins < 0) { mins = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
        return { days, hours, mins, secs };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const blocks = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Mins", value: time.mins },
    { label: "Secs", value: time.secs },
  ];

  return (
    <div className="flex gap-3">
      {blocks.map((b) => (
        <div key={b.label} className="glass-card px-4 py-3 text-center min-w-[60px]">
          <div className="text-xl md:text-2xl font-heading text-primary">{String(b.value).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{b.label}</div>
        </div>
      ))}
    </div>
  );
};

const testimonials = [
  { name: "Marcus J.", text: "BLATHEIL isn't just clothes — it's an identity. The quality is unmatched.", rating: 5 },
  { name: "Zara K.", text: "Finally a brand that gets it. Premium feel, bold designs. I'm hooked.", rating: 5 },
  { name: "Deon W.", text: "The Sovereign Bomber is my go-to. Every time I wear it, heads turn.", rating: 5 },
];

const Index = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts({ limit: 30 });
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
  }, []);

  const newDrops = products.slice(0, 6);
  const bestSellers = products.filter((p) => p.isFeatured).slice(0, 6);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img src={heroBg} alt="BLATHEIL Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </motion.div>
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 container h-full flex flex-col items-center justify-center text-center"
        >
          <motion.img
            src="/logo.png"
            alt="BLATHEIL"
            className="h-16 md:h-24 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.p
            className="text-sm md:text-base uppercase tracking-[0.4em] text-primary font-heading mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Born to Lead Style
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 glow-button gold-gradient px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm hover:gap-5 transition-all duration-300"
            >
              Shop the Drop
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </motion.div>
        </div>
      </section>

      <MarqueeText />

      {/* Lookbook Carousel */}
      <HeroSection
        title={
          <>
            The <span className="gold-text">Collection</span>
          </>
        }
        subtitle="Curated pieces for the bold. Explore our latest lookbook — premium streetwear designed for leaders."
        images={lookbookImages}
        className="border-b border-border"
      />

      {/* New Drops */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Latest</p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase">New Drops</h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-wider">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {newDrops.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Drop Culture Countdown */}
      <section className="container py-20">
        <div className="glass-card p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Drop Culture</p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase mb-3">Next Drop Incoming</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
              Limited pieces. Once they're gone, they're gone. Set your alarms.
            </p>
            <div className="flex justify-center mb-8">
              <CountdownTimer />
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-primary px-6 py-3 text-sm font-heading uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-sm"
            >
              Get Notified
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Most Wanted</p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase">Best Sellers</h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-wider">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {bestSellers.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      </section>

      <MarqueeText />

      {/* Testimonials */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">The Community</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase">What They Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-6"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 mb-4 leading-relaxed">"{t.text}"</p>
              <p className="text-xs font-heading uppercase tracking-widest text-primary">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Instagram Grid */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">{CONTACT_INSTAGRAM_HANDLE}</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase">Follow the Movement</h2>
        </motion.div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {products.slice(0, 6).map((p, i) => (
            <motion.a
              key={i}
              href={CONTACT_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="aspect-square overflow-hidden rounded-sm group"
            >
              <img
                src={p.images?.[0] || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </motion.a>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
