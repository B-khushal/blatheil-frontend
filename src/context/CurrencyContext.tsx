import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CurrencyType = "INR" | "USD";

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  usdRate: number;
  formatPrice: (amount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyType>("INR");
  const [usdRate, setUsdRate] = useState<number>(83); // fallback
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    // Load preference from local storage
    const savedCurrency = localStorage.getItem("blatheil_currency") as CurrencyType;
    if (savedCurrency === "USD" || savedCurrency === "INR") {
      setCurrencyState(savedCurrency);
    }

    const fetchRate = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.usdRate) {
            setUsdRate(data.data.usdRate);
          }
        }
      } catch (err) {
        console.error("Failed to fetch USD conversion rate", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, []);

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem("blatheil_currency", c);
  };

  const formatPrice = (amount: number): string => {
    if (currency === "USD") {
      // Convert INR to USD and apply $ symbol
      const converted = amount / usdRate;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    }
    
    // Default to INR
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, usdRate, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};
