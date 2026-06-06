import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CountryCurrencyModal } from "@/components/CountryCurrencyModal";

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
  | "NZD";

type ExchangeRatesMap = Partial<Record<CurrencyCode, number>>;

const USD_CROSS_RATES: Partial<Record<CurrencyCode, number>> = {
  USD: 1,
  AED: 3.6725,
  AUD: 1.53,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  SGD: 1.35,
  JPY: 157,
  NZD: 1.66,
};

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
];

export interface CountryOption {
  code: string;
  name: string;
  currency: CurrencyCode;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "IN", name: "India", currency: "INR", flag: "🇮🇳" },
  { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { code: "JP", name: "Japan", currency: "JPY", flag: "🇯🇵" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "🇦🇺" },
  { code: "CA", name: "Canada", currency: "CAD", flag: "🇨🇦" },
  { code: "DE", name: "Germany", currency: "EUR", flag: "🇩🇪" },
  { code: "FR", name: "France", currency: "EUR", flag: "🇫🇷" },
  { code: "IT", name: "Italy", currency: "EUR", flag: "🇮🇹" },
  { code: "ES", name: "Spain", currency: "EUR", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { code: "SG", name: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { code: "NZ", name: "New Zealand", currency: "NZD", flag: "🇳🇿" },
];

export const buildFallbackInrRates = (usdRate: number): ExchangeRatesMap => {
  const fallback: ExchangeRatesMap = { INR: 1, USD: usdRate };

  for (const code of DEFAULT_SUPPORTED) {
    if (code === "INR") {
      fallback.INR = 1;
      continue;
    }
    if (code === "USD") {
      fallback.USD = usdRate;
      continue;
    }

    const usdToCurrency = USD_CROSS_RATES[code];
    if (typeof usdToCurrency === "number" && usdToCurrency > 0) {
      fallback[code] = Number((usdRate / usdToCurrency).toFixed(4));
    }
  }

  return fallback;
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  usdRate: number;
  exchangeRates: ExchangeRatesMap;
  supportedCurrencies: CurrencyCode[];
  formatPrice: (amount: number) => string;
  loading: boolean;
  country: string;
  setCountry: (country: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");
  const [country, setCountryState] = useState<string>("IN");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [usdRate, setUsdRate] = useState<number>(83); // fallback
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesMap>(buildFallbackInrRates(83));
  const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyCode[]>(DEFAULT_SUPPORTED);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    const savedCurrency = localStorage.getItem("blatheil_currency") as CurrencyCode;
    if (savedCurrency && (DEFAULT_SUPPORTED as string[]).includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    const savedCountry = localStorage.getItem("blatheil_country");
    if (savedCountry) {
      setCountryState(savedCountry);
    } else {
      setIsModalOpen(true);
    }

    const fetchRate = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          const apiUsdRate = Number(data?.data?.usdRate || 83);
          if (data?.data?.usdRate) {
            setUsdRate(apiUsdRate);
          }
          const fallbackRates = buildFallbackInrRates(apiUsdRate);
          const apiRates = (data?.data?.exchangeRates || {}) as ExchangeRatesMap;
          setExchangeRates({ ...fallbackRates, ...apiRates, INR: 1, USD: apiUsdRate });
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

    const interval = window.setInterval(fetchRate, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    if (!supportedCurrencies.includes(c)) return;
    setCurrencyState(c);
    localStorage.setItem("blatheil_currency", c);
  };

  const setCountry = (c: string) => {
    setCountryState(c);
    localStorage.setItem("blatheil_country", c);
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

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, usdRate, exchangeRates, supportedCurrencies, formatPrice, loading, country, setCountry, isModalOpen, setIsModalOpen }}>
      {children}
      <CountryCurrencyModal />
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
