import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { buildWhatsAppUrl } from "@/lib/contact";

const FloatingWhatsApp = () => {
  return (
    <motion.a
      href={buildWhatsAppUrl("Hello BLATHEIL, I want to know more about your latest collection.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 right-6 md:bottom-6 z-40 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg glow-button transition-colors duration-300"
    >
      <FaWhatsapp className="w-7 h-7" />
    </motion.a>
  );
};

export default FloatingWhatsApp;
