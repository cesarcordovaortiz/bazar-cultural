import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '../../lib/presentation';
import type { CurrencyCode } from '../../types';

interface ExchangeRateData {
  baseCurrency: 'USD';
  quoteCurrency: 'BOB';
  rate: number;
  unit: string;
  publishedDate: string | null;
  effectiveDate: string | null;
  source: { name: string; url: string };
  retrievedAt: string;
}

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  exchangeRate: ExchangeRateData;
  isExchangeRateLoading: boolean;
  exchangeRateError: string | null;
  convertAmount: (amount: number, sourceCurrency?: CurrencyCode, targetCurrency?: CurrencyCode) => number;
  formatAmount: (amount: number, sourceCurrency?: CurrencyCode) => string;
}

const STORAGE_KEY = 'bazar_display_currency_v1';
const FALLBACK_RATE: ExchangeRateData = {
  baseCurrency: 'USD',
  quoteCurrency: 'BOB',
  rate: 11.77,
  unit: 'BOB por USD',
  publishedDate: '10 de Agosto 2026',
  effectiveDate: '11 de Agosto 2026',
  source: {
    name: 'Banco Central de Bolivia — Tipo de Cambio Oficial del dólar estadounidense',
    url: 'https://www.bcb.gob.bo/librerias/indicadores/dolar/bolsin.php',
  },
  retrievedAt: '2026-08-10T00:00:00.000Z',
};

const CurrencyContext = createContext<CurrencyState | null>(null);

function isExchangeRateData(value: unknown): value is ExchangeRateData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ExchangeRateData>;
  return candidate.baseCurrency === 'USD' && candidate.quoteCurrency === 'BOB' && typeof candidate.rate === 'number' && candidate.rate > 0 && Boolean(candidate.source?.url);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, updateCurrency] = useState<CurrencyCode>(() => localStorage.getItem(STORAGE_KEY) === 'BOB' ? 'BOB' : 'USD');
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData>(FALLBACK_RATE);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadExchangeRate = async (): Promise<void> => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}exchange-rate.json`, { signal: controller.signal, cache: 'no-cache' });
        if (!response.ok) throw new Error(`No se pudo consultar la cotización publicada (${response.status}).`);
        const data: unknown = await response.json();
        if (!isExchangeRateData(data)) throw new Error('La cotización publicada tiene un formato inválido.');
        setExchangeRate(data);
        setExchangeRateError(null);
      } catch (error) {
        if (!controller.signal.aborted) setExchangeRateError(error instanceof Error ? error.message : 'No se pudo actualizar la cotización.');
      } finally {
        if (!controller.signal.aborted) setIsExchangeRateLoading(false);
      }
    };
    void loadExchangeRate();
    return () => controller.abort();
  }, []);

  const setCurrency = useCallback((nextCurrency: CurrencyCode): void => {
    localStorage.setItem(STORAGE_KEY, nextCurrency);
    updateCurrency(nextCurrency);
  }, []);

  const convertAmount = useCallback((amount: number, sourceCurrency: CurrencyCode = 'USD', targetCurrency: CurrencyCode = currency): number => {
    if (sourceCurrency === targetCurrency) return amount;
    if (sourceCurrency === 'USD' && targetCurrency === 'BOB') return amount * exchangeRate.rate;
    return amount / exchangeRate.rate;
  }, [currency, exchangeRate.rate]);

  const formatAmount = useCallback((amount: number, sourceCurrency: CurrencyCode = 'USD'): string => formatCurrency(convertAmount(amount, sourceCurrency), currency), [convertAmount, currency]);

  const value = useMemo(() => ({ currency, setCurrency, exchangeRate, isExchangeRateLoading, exchangeRateError, convertAmount, formatAmount }), [convertAmount, currency, exchangeRate, exchangeRateError, formatAmount, isExchangeRateLoading, setCurrency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyState {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider.');
  return context;
}
