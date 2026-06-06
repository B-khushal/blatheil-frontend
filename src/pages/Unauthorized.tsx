import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import logo from "@/assets/logo.png";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(0_70%_50%_/_0.12),transparent_40%),linear-gradient(120deg,hsl(0_0%_0%),hsl(0_0%_3%),hsl(0_0%_0%))]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md text-center z-10"
      >
        <div className="glass-card rounded-3xl border border-destructive/20 bg-card/60 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-10">
          <div className="mb-6">
            <img src={logo} alt="BLATHEIL" className="h-10 mx-auto mb-6 opacity-85" />
            <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4 text-destructive animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="font-heading text-4xl font-bold uppercase tracking-wider text-destructive mb-2">403</h1>
            <h2 className="font-heading text-lg uppercase tracking-widest text-foreground">Access Denied</h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              You do not have the required permissions to access this dashboard section. Please contact your administrator if you require access.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/50 text-xs font-heading uppercase tracking-widest hover:bg-secondary hover:text-foreground transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-xl gold-gradient text-xs font-heading uppercase tracking-widest text-primary-foreground transition-all duration-200"
            >
              <Home className="w-4 h-4 text-black" /> Return Home
            </button>
          </div>

          <p className="mt-8 text-[10px] uppercase tracking-wider text-muted-foreground/60">
            BLATHEIL security protocol active
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
