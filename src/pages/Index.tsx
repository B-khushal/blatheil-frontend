import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { HeroSection } from "@/components/ui/feature-carousel";
import heroBgPattern from "@/assets/hero-bg.jpg";
import { CONTACT_INSTAGRAM_HANDLE, CONTACT_INSTAGRAM_URL } from "@/lib/contact";
import { fetchProducts } from "@/lib/products";
import type { Product } from "@/types/product";

type HomeReview = {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  customer_name: string;
  is_verified_purchase?: boolean;
  is_featured?: boolean;
  is_pinned?: boolean;
};

const MarqueeText = () => (
  <div className="overflow-hidden py-6 border-y border-border bg-card/50">
    <div className="marquee whitespace-nowrap flex">
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="mx-8 text-2xl md:text-4xl font-heading uppercase tracking-[0.3em] text-muted-foreground/30"
        >
          Born to Lead Style ★
        </span>
      ))}
    </div>
  </div>
);

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTime({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      setTime({ days, hours, mins, secs });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {[
        { label: "Days", value: time.days },
        { label: "Hours", value: time.hours },
        { label: "Mins", value: time.mins },
        { label: "Secs", value: time.secs },
      ].map((block) => (
        <div key={block.label} className="glass-card px-4 py-3 text-center min-w-[60px]">
          <div className="text-xl md:text-2xl font-heading text-primary">
            {String(block.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{block.label}</div>
        </div>
      ))}
    </div>
  );
};

interface IndexProps {
  cmsDraft?: any;
  isPreviewMode?: boolean;
}

const Index = ({ cmsDraft, isPreviewMode = false }: IndexProps) => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<HomeReview[]>([]);
  const [cmsData, setCmsData] = useState<any>(cmsDraft || null);
  const [loadingCms, setLoadingCms] = useState(!cmsDraft);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (isPreviewMode && cmsDraft) {
      setCmsData(cmsDraft);
    }
  }, [cmsDraft, isPreviewMode]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

    const loadProducts = async () => {
      try {
        const data = await fetchProducts({ limit: 30 });
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    const loadCms = async () => {
      if (isPreviewMode) {
        setLoadingCms(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/admin/website-content`);
        const data = await res.json();
        setCmsData(data);
      } catch (error) {
        console.error("Failed to load CMS data", error);
      } finally {
        setLoadingCms(false);
      }
    };

    const loadFeaturedReviews = async () => {
      if (isPreviewMode) {
        setLoadingReviews(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/reviews/admin/all?limit=12&sortBy=latest`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });

        if (!res.ok) {
          setReviews([]);
          return;
        }

        const data = await res.json();
        const list: HomeReview[] = Array.isArray(data?.reviews) ? data.reviews : [];
        const featured = list.filter((r) => r.is_featured || r.is_pinned).slice(0, 3);
        setReviews(featured);
      } catch (error) {
        console.error("Failed to load featured reviews:", error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadProducts();
    loadCms();
    loadFeaturedReviews();
  }, [isPreviewMode]);

  if (loadingCms) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const heroTitle = cmsData?.heroSection?.title || "Born to Lead Style";
  const heroSubtitle = cmsData?.heroSection?.subtitle || "";
  const heroButton = cmsData?.heroSection?.buttonText || "Shop the Drop";
  const heroLink = cmsData?.heroSection?.buttonLink || "/shop";
  const heroBg = cmsData?.heroSection?.desktopImage || heroBgPattern;
  const collections =
    cmsData?.collectionsSection?.sort((a: any, b: any) => a.displayOrder - b.displayOrder) || [];
  const lookbookImages = collections.map((c: any) => ({ src: c.image || "/placeholder.svg", alt: c.title }));

  const newDrops = products.slice(0, 6);
  const bestSellers = products.filter((p) => p.isFeatured).slice(0, 6);

  const LayoutWrapper = isPreviewMode
    ? ({ children }: { children: React.ReactNode }) => <div className="min-h-screen bg-background">{children}</div>
    : Layout;

  return (
    <LayoutWrapper>
      {cmsData?.heroSection?.isActive !== false && (
        <section className="relative h-screen overflow-hidden">
          <motion.div style={{ y: heroY }} className="absolute inset-0">
            <img src={heroBg} alt="BLATHEIL Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
          </motion.div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="relative z-10 container h-full flex flex-col items-center justify-center text-center px-4"
          >
            <motion.img
              src="/logo.png"
              alt="BLATHEIL"
              className="h-16 md:h-24 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />

            {heroTitle && (
              <motion.p
                className="text-sm md:text-xl uppercase tracking-[0.4em] text-primary font-heading mb-4 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {heroTitle}
              </motion.p>
            )}

            {heroSubtitle && (
              <motion.p
                className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {heroSubtitle}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                to={heroLink}
                className="inline-flex items-center gap-3 glow-button gold-gradient px-8 py-4 text-sm font-heading uppercase tracking-widest text-primary-foreground rounded-sm hover:gap-5 transition-all duration-300"
              >
                {heroButton}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      )}

      {cmsData?.heroSection?.isActive !== false && <MarqueeText />}

      {lookbookImages.length > 0 && (
        <HeroSection
          title={
            <>
              The <span className="gold-text">Collection</span>
            </>
          }
          subtitle="Curated pieces for the bold. Explore our latest lookbook."
          images={lookbookImages}
          className="border-b border-border"
        />
      )}

      {newDrops.length > 0 && (
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
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-wider"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {newDrops.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {cmsData?.nextDropSection?.isVisible !== false && (
        <section className="container py-20">
          <div className="glass-card p-8 md:p-16 text-center relative overflow-hidden">
            {cmsData?.nextDropSection?.image && (
              <img
                src={cmsData.nextDropSection.image}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
                alt="Drop Background"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent/50" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Drop Culture</p>
              <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase mb-3">
                {cmsData?.nextDropSection?.title || "Next Drop Incoming"}
              </h2>
              <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
                {cmsData?.nextDropSection?.description ||
                  "Limited pieces. Once they are gone, they are gone. Set your alarms."}
              </p>
              <div className="flex justify-center mb-8">
                {cmsData?.nextDropSection?.countdownDate && (
                  <CountdownTimer targetDate={cmsData.nextDropSection.countdownDate} />
                )}
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border border-primary px-6 py-3 text-sm font-heading uppercase tracking-widest text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-sm bg-background/50 backdrop-blur-md"
              >
                Get Notified
              </Link>
            </div>
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
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
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-wider"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {bestSellers.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <MarqueeText />

      {!loadingReviews && reviews.length > 0 && (
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
            {reviews.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                {r.title && <p className="text-xs font-heading uppercase tracking-wider text-primary mb-2">{r.title}</p>}
                <p className="text-sm text-foreground/80 mb-4 leading-relaxed">"{r.comment}"</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-heading uppercase tracking-widest text-primary">{r.customer_name}</p>
                  {r.is_verified_purchase && (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded uppercase tracking-wider font-heading">
                      Verified
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">{CONTACT_INSTAGRAM_HANDLE}</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase">Follow the Drops</h2>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {products.slice(0, 6).map((p, i) => (
            <motion.a
              key={p._id}
              href={CONTACT_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="aspect-square overflow-hidden rounded-sm group"
            >
              <img
                src={p.images?.[0] || "/placeholder.svg"}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </motion.a>
          ))}
        </div>
      </section>
    </LayoutWrapper>
  );
};

export default Index;
