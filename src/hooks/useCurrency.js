import { useState, useEffect, useCallback } from 'react';
import { convertCurrency, getExchangeRate, fetchExchangeRates } from '../utils/currency';

export const useCurrency = (baseCurrency = 'INR') => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRates();
  }, [baseCurrency]);

  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRates = await fetchExchangeRates(baseCurrency);
      setRates(fetchedRates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const convert = useCallback(async (amount, fromCurrency, toCurrency) => {
    try {
      return await convertCurrency(amount, fromCurrency, toCurrency);
    } catch (err) {
      console.error('Currency conversion error:', err);
      return amount;
    }
  }, []);

  const getRate = useCallback(async (fromCurrency, toCurrency) => {
    try {
      return await getExchangeRate(fromCurrency, toCurrency);
    } catch (err) {
      console.error('Exchange rate error:', err);
      return 1;
    }
  }, []);

  const refresh = useCallback(() => {
    loadRates();
  }, [baseCurrency]);

  return {
    rates,
    loading,
    error,
    convert,
    getRate,
    refresh
  };
};
