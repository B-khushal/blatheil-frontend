import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, ChevronRight, X } from "lucide-react";
import { useCurrency, COUNTRIES, CountryOption } from "@/context/CurrencyContext";

export const CountryCurrencyModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    country,
    setCountry,
    setCurrency,
  } = useCurrency();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [loadingGeoloc, setLoadingGeoloc] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<CountryOption | null>(null);

  // Set default selection when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const current = COUNTRIES.find((c) => c.code === country);
      if (current) {
        setSelectedCountry(current);
      }
    }
  }, [isModalOpen, country]);

  // Geolocation detection
  useEffect(() => {
    const detectCountry = async () => {
      setLoadingGeoloc(true);
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          const code = data.country_code?.toUpperCase();
          if (code) {
            const matched = COUNTRIES.find((c) => c.code === code);
            if (matched) {
              setDetectedCountry(matched);
              if (!localStorage.getItem("blatheil_country")) {
                setSelectedCountry(matched);
              }
            }
          }
        }
      } catch (err) {
        console.error("IP Geolocation failed:", err);
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz) {
            let guess = "IN";
            if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("Asia/Kolkata")) guess = "IN";
            else if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("Chicago") || tz.includes("Denver") || tz.includes("America/")) guess = "US";
            else if (tz.includes("London") || tz.includes("Europe/London")) guess = "GB";
            else if (tz.includes("Europe/")) guess = "DE";
            else if (tz.includes("Dubai") || tz.includes("Asia/Dubai")) guess = "AE";
            else if (tz.includes("Tokyo") || tz.includes("Asia/Tokyo")) guess = "JP";
            else if (tz.includes("Sydney") || tz.includes("Australia/")) guess = "AU";
            else if (tz.includes("Toronto") || tz.includes("America/Toronto")) guess = "CA";

            const matched = COUNTRIES.find((c) => c.code === guess);
            if (matched) {
              setDetectedCountry(matched);
              if (!localStorage.getItem("blatheil_country")) {
                setSelectedCountry(matched);
              }
            }
          }
        } catch { /* ignore */ }
      } finally {
        setLoadingGeoloc(false);
      }
    };

    detectCountry();
  }, []);

  const handleContinue = () => {
    if (selectedCountry) {
      setCountry(selectedCountry.code);
      setCurrency(selectedCountry.currency);
      setIsModalOpen(false);
    }
  };

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (localStorage.getItem("blatheil_country")) {
              setIsModalOpen(false);
            }
          }}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-lg overflow-hidden glass-card rounded-3xl border border-primary/20 bg-card/75 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          {localStorage.getItem("blatheil_country") && (
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Icon + Title */}
          <div className="text-center mb-6 pt-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-xl uppercase tracking-wider text-foreground">
              Select Your Country & Currency
            </h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              We’ll personalize prices and shopping experience based on your location.
            </p>
          </div>

          {/* Auto Detection Suggestion */}
          {detectedCountry && selectedCountry?.code !== detectedCountry.code && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedCountry(detectedCountry)}
              className="mb-4 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{detectedCountry.flag}</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-primary/80 font-semibold font-heading">
                    Detected Location
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {detectedCountry.name} ({detectedCountry.currency})
                  </p>
                </div>
              </div>
              <span className="text-xs font-heading uppercase tracking-widest text-primary flex items-center gap-1">
                Select <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>
          )}

          {/* Country Selection Area */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full bg-transparent border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="max-h-48 overflow-y-auto border border-border/60 rounded-xl p-1 bg-background/30 backdrop-blur-sm divide-y divide-border/20 custom-scrollbar">
              {filtered.map((c) => {
                const isSelected = selectedCountry?.code === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-secondary/40 text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="text-xs font-heading uppercase tracking-wider">{c.name}</span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-muted-foreground">
                      {c.currency}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground font-heading uppercase tracking-wider">
                  No countries supported
                </div>
              )}
            </div>

            {selectedCountry && (
              <div className="bg-secondary/25 border border-border/50 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Selected Country</span>
                  <span className="font-semibold text-foreground">{selectedCountry.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Currency Mapping</span>
                  <span className="font-mono font-semibold text-primary">{selectedCountry.currency}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!selectedCountry}
              className="w-full glow-button gold-gradient flex h-12 items-center justify-center gap-2 rounded-xl text-xs font-heading uppercase tracking-[0.2em] text-primary-foreground transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
