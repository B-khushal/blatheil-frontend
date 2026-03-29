import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { BadgePercent, Chrome, Eye, EyeOff, ShieldCheck, Truck, UserPlus } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const highlights = [
    {
      icon: ShieldCheck,
      title: "Protected Account",
      description: "Secure sign up and checkout built around trusted user protection.",
    },
    {
      icon: Truck,
      title: "Priority Delivery",
      description: "Get your picks shipped quickly with seamless order tracking.",
    },
    {
      icon: BadgePercent,
      title: "Members Benefits",
      description: "Access exclusive drops, early alerts, and premium savings.",
    },
  ];

  const isPasswordLongEnough = password.length >= 6;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/shop");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);
      // Navigation happens automatically via useEffect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,hsl(43_74%_52%_/_0.18),transparent_38%),radial-gradient(circle_at_88%_8%,hsl(43_74%_65%_/_0.1),transparent_26%),linear-gradient(120deg,hsl(0_0%_0%),hsl(0_0%_4%),hsl(0_0%_0%))]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="hidden px-8 pb-14 pt-10 lg:flex lg:flex-col lg:justify-between xl:px-14"
        >
          <div className="flex items-center gap-3">
            <img src={logo} alt="BLATHEIL" className="h-16 w-auto" />
          </div>

          <div className="max-w-xl space-y-7">
            <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-4 py-1 text-[11px] font-heading uppercase tracking-[0.26em] text-primary">
              Join The Blatheil Club
            </span>
            <h1 className="font-heading text-4xl leading-tight text-balance xl:text-5xl">
              Create your account and unlock premium fashion moments.
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground xl:text-base">
              Sign up once to save your favorites, checkout faster, and get access to members-only drops tailored to your style.
            </p>

            <div className="space-y-3">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
                    className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-card/50 p-4 backdrop-blur-md"
                  >
                    <div className="mt-0.5 rounded-xl border border-primary/40 bg-primary/10 p-2.5 text-primary transition-transform duration-200 group-hover:-translate-y-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Your next favorite fit starts here.</p>
        </motion.section>

        <section className="flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="glass-card rounded-3xl border border-border/80 bg-card/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between lg:hidden">
                  <img src={logo} alt="BLATHEIL" className="h-9 w-auto" />
                  <span className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-heading uppercase tracking-[0.2em] text-primary">
                    New Member
                  </span>
                </div>

                <div className="flex rounded-2xl border border-border bg-background/70 p-1">
                  <Link
                    to="/login"
                    className="flex-1 rounded-xl px-4 py-2 text-center text-xs font-heading uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 rounded-xl bg-primary px-4 py-2 text-center text-xs font-heading uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-95"
                  >
                    Sign Up
                  </Link>
                </div>

                <div className="text-center">
                  <h2 className="font-heading text-2xl">Create Account</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Join Blatheil and start shopping</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-heading uppercase tracking-[0.18em] text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border/90 bg-background/70 px-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-heading uppercase tracking-[0.18em] text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border/90 bg-background/70 px-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-heading uppercase tracking-[0.18em] text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-border/90 bg-background/70 px-4 pr-11 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className={`text-xs ${isPasswordLongEnough ? "text-primary" : "text-muted-foreground"}`}>
                    {isPasswordLongEnough ? "Password strength looks good." : "Use at least 6 characters."}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-heading uppercase tracking-[0.18em] text-muted-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 w-full rounded-xl border border-border/90 bg-background/70 px-4 pr-11 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showConfirmPw ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-xs ${passwordsMatch ? "text-primary" : "text-destructive"}`}>
                      {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="glow-button gold-gradient flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-heading uppercase tracking-[0.17em] text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Create Account
                    </>
                  )}
                </motion.button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Or continue with</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                disabled
                className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border/90 bg-background/60 px-4 text-sm font-medium text-foreground/80 transition-all duration-200"
              >
                <Chrome className="h-4 w-4 text-primary" />
                Google (coming soon)
              </button>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
