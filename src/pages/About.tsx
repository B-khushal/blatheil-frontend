import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";

const About = () => (
  <Layout>
    <section className="container pt-28 md:pt-32 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-heading mb-2">Brand Story</p>
        <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase mb-8">Born To Lead</h1>
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
            Blatheil was born from a vision to redefine modern streetwear with a touch of timeless luxury. Rooted in confidence, ambition, and individuality, the brand represents those who lead rather than follow.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every design blends bold aesthetics with refined elegance, crafted for a generation that values both style and substance. The iconic "B" symbolizes strength, identity, and legacy.
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
            Blatheil is not just clothing. It is an attitude, a mindset, and a statement of purpose. Built for creators, dreamers, and leaders, Blatheil inspires you to stand out, own your journey, and express your unique style.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            As the journey continues, Blatheil evolves with the spirit of those who dare to be different. Each collection tells a story of resilience, passion, and forward-thinking creativity, pushing boundaries beyond ordinary fashion.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Inspired by urban culture and global influences, the brand brings together comfort, quality, and innovation in every thread. With every step, every outfit, and every statement, Blatheil stands for bold expression and fearless leadership.
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
          True Fashion Begins When You Lead.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Blatheil is more than a label. It is a movement that empowers individuals to embrace identity without compromise.
        </p>
      </motion.div>
    </section>
  </Layout>
);

export default About;
