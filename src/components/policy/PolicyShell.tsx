import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

type PolicySection = {
  title: string;
  body: string;
  bullets?: string[];
};

type PolicyShellProps = {
  badge: string;
  title: string;
  lead: string;
  updatedOn: string;
  sections: PolicySection[];
};

const policyLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Shipping", href: "/shipping-policy" },
  { label: "Refund", href: "/refund-policy" },
  { label: "Cancellation", href: "/cancellation-policy" },
];

const SectionCard = ({ title, body, bullets }: PolicySection) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    className="glass-card p-6 md:p-8"
  >
    <h2 className="text-lg md:text-xl font-heading uppercase tracking-wider text-primary mb-3">{title}</h2>
    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{body}</p>
    {bullets && bullets.length > 0 && (
      <ul className="mt-4 space-y-2 list-disc pl-5 text-sm md:text-base text-muted-foreground leading-relaxed">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )}
  </motion.article>
);

const PolicyShell = ({ badge, title, lead, updatedOn, sections }: PolicyShellProps) => (
  <Layout>
    <section className="relative overflow-hidden pt-28 md:pt-32 pb-20">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-3">{badge}</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase leading-tight">{title}</h1>
          <p className="text-muted-foreground mt-4 max-w-3xl leading-relaxed">{lead}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mt-6">Updated: {updatedOn}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 md:gap-8 mt-8">
          <div className="space-y-6">
            {sections.map((section) => (
              <SectionCard key={section.title} {...section} />
            ))}
          </div>

          <aside className="glass-card p-6 h-fit lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-heading mb-4">All Policies</p>
            <nav className="space-y-3">
              {policyLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block text-sm uppercase tracking-widest text-primary/80 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </section>
  </Layout>
);

export default PolicyShell;
