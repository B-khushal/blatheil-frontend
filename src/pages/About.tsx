import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const About = () => (
  <Layout>
    <section className="container pt-28 md:pt-32 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Our Story</p>
        <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase mb-8">Born to Lead</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-xl font-heading uppercase tracking-wider text-primary">The Vision</h3>
          <p className="text-muted-foreground leading-relaxed">
            BLATHEIL was born from a refusal to conform. In a world of fast fashion and fleeting trends, we chose to build something that lasts — a brand rooted in leadership, individuality, and unapologetic self-expression.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every piece we create is a statement. Not just of style, but of mindset. We design for the leaders — the ones who set trends, not follow them. The ones who walk into a room and own it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-heading uppercase tracking-wider text-primary">The Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            We exist to redefine what streetwear means. Premium materials, bold designs, limited drops — this isn't mass production. This is curated culture. Every collection tells a story of dominance, resilience, and forward motion.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            From the streets to the spotlight, BLATHEIL is the uniform of the next generation of leaders. We don't follow the culture — we create it.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 glass-card p-8 md:p-16 text-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-4">Our Mantra</p>
        <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase gold-text">
          Lead. Don't Follow.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Every thread, every stitch, every drop — designed for those who dare to stand apart.
        </p>
      </motion.div>
    </section>
  </Layout>
);

export default About;
