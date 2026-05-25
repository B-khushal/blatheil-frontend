import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CurrencyCode =
  | "INR"
  | "USD"
  | "AED"
  | "AUD"
  | "GBP"
  | "EUR"
  | "CAD"
  | "SGD"
  | "JPY"
  | "NZD"
  | "CHF"
  | "CNY"
  | "HKD"
  | "SAR"
  | "QAR";

type ExchangeRatesMap = Partial<Record<CurrencyCode, number>>;

export const CURRENCY_META: Record<CurrencyCode, { label: string; symbol: string; locale: string }> = {
  INR: { label: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  USD: { label: "US Dollar", symbol: "$", locale: "en-US" },
  AED: { label: "UAE Dirham", symbol: "د.إ", locale: "en-AE" },
  AUD: { label: "Australian Dollar", symbol: "A$", locale: "en-AU" },
  GBP: { label: "British Pound", symbol: "£", locale: "en-GB" },
  EUR: { label: "Euro", symbol: "€", locale: "en-IE" },
  CAD: { label: "Canadian Dollar", symbol: "C$", locale: "en-CA" },
  SGD: { label: "Singapore Dollar", symbol: "S$", locale: "en-SG" },
  JPY: { label: "Japanese Yen", symbol: "¥", locale: "ja-JP" },
  NZD: { label: "New Zealand Dollar", symbol: "NZ$", locale: "en-NZ" },
  CHF: { label: "Swiss Franc", symbol: "CHF", locale: "de-CH" },
  CNY: { label: "Chinese Yuan", symbol: "¥", locale: "zh-CN" },
  HKD: { label: "Hong Kong Dollar", symbol: "HK$", locale: "en-HK" },
  SAR: { label: "Saudi Riyal", symbol: "﷼", locale: "ar-SA" },
  QAR: { label: "Qatari Riyal", symbol: "﷼", locale: "ar-QA" },
};

const DEFAULT_SUPPORTED: CurrencyCode[] = [
  "INR",
  "USD",
  "AED",
  "AUD",
  "GBP",
  "EUR",
  "CAD",
  "SGD",
  "JPY",
  "NZD",
  "CHF",
  "CNY",
  "HKD",
  "SAR",
  "QAR",
];

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  usdRate: number;
  exchangeRates: ExchangeRatesMap;
  supportedCurrencies: CurrencyCode[];
  formatPrice: (amount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");
  const [usdRate, setUsdRate] = useState<number>(83); // fallback
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesMap>({ INR: 1, USD: 83 });
  const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyCode[]>(DEFAULT_SUPPORTED);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    // Load preference from local storage
    const savedCurrency = localStorage.getItem("blatheil_currency") as CurrencyCode;
    if (savedCurrency && (DEFAULT_SUPPORTED as string[]).includes(savedCurrency)) {
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
          if (data?.data?.exchangeRates) {
            setExchangeRates(data.data.exchangeRates);
          }
          if (Array.isArray(data?.data?.supportedCurrencies) && data.data.supportedCurrencies.length > 0) {
            const normalized = data.data.supportedCurrencies.filter((code: string) => code in CURRENCY_META) as CurrencyCode[];
            if (normalized.length > 0) {
              setSupportedCurrencies(normalized);
              if (!normalized.includes(savedCurrency)) {
                setCurrencyState("INR");
                localStorage.setItem("blatheil_currency", "INR");
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch USD conversion rate", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRate();

    // Keep client-side conversion fresh while app is open.
    const interval = window.setInterval(fetchRate, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    if (!supportedCurrencies.includes(c)) return;
    setCurrencyState(c);
    localStorage.setItem("blatheil_currency", c);
  };

  const formatPrice = (amount: number): string => {
    if (currency !== "INR") {
      const inrPerUnit = exchangeRates[currency];
      const safeRate = typeof inrPerUnit === "number" && inrPerUnit > 0
        ? inrPerUnit
        : currency === "USD"
          ? usdRate
          : undefined;

      if (safeRate) {
        const converted = amount / safeRate;
        return new Intl.NumberFormat(CURRENCY_META[currency].locale, {
          style: "currency",
          currency,
          minimumFractionDigits: currency === "JPY" ? 0 : 2,
          maximumFractionDigits: currency === "JPY" ? 0 : 2,
        }).format(converted);
      }
    }

    // Default to INR
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, usdRate, exchangeRates, supportedCurrencies, formatPrice, loading }}>
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
