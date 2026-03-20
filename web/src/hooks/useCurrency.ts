import { useState, useEffect, useCallback } from 'react';
import { currencyApi } from '@/lib/api';

const CURRENCY_KEY = 'passaddis_currency';

// Simple conversion rates (fallback)
const FALLBACK_RATES: Record<string, number> = {
  ETB: 1,
  USD: 0.017,
  EUR: 0.016,
  GBP: 0.014,
  CAD: 0.023,
  AUD: 0.026,
};

const SYMBOLS: Record<string, string> = {
  ETB: 'ETB',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

export function useCurrency() {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem(CURRENCY_KEY) || 'ETB',
  );
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [currencies, setCurrencies] = useState<Array<{ code: string; symbol: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const [ratesRes, currRes] = await Promise.all([
          currencyApi.getRates(),
          currencyApi.getSupportedCurrencies(),
        ]);
        if (ratesRes.data) setRates(ratesRes.data.rates);
        if (currRes.data) setCurrencies(currRes.data);
      } catch {
        // Use fallbacks
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    localStorage.setItem(CURRENCY_KEY, code);
  }, []);

  const convertFromETB = useCallback(
    (amountETB: number) => {
      if (currency === 'ETB') return amountETB;
      const rate = rates[currency] || FALLBACK_RATES[currency];
      if (!rate) return amountETB;
      return Math.round(amountETB * rate * 100) / 100;
    },
    [currency, rates],
  );

  const formatPrice = useCallback(
    (amountETB: number) => {
      if (currency === 'ETB') {
        return `${amountETB.toLocaleString()} ETB`;
      }
      const converted = convertFromETB(amountETB);
      const sym = SYMBOLS[currency] || currency;
      return `${sym}${converted.toFixed(2)}`;
    },
    [currency, convertFromETB],
  );

  return {
    currency,
    symbol: SYMBOLS[currency] || currency,
    setCurrency,
    convertFromETB,
    formatPrice,
    currencies,
    isLoading,
  };
}
