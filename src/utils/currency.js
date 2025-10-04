// Currency conversion utilities

const CACHE_DURATION = 3600000; // 1 hour in milliseconds
let exchangeRatesCache = {
  rates: null,
  timestamp: null,
  baseCurrency: 'USD'
};

/**
 * Fetch exchange rates from API
 * @param {string} baseCurrency - Base currency code (default: USD)
 * @returns {Promise<Object>} Exchange rates object
 */
export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Check cache first
    const now = Date.now();
    if (
      exchangeRatesCache.rates &&
      exchangeRatesCache.baseCurrency === baseCurrency &&
      exchangeRatesCache.timestamp &&
      now - exchangeRatesCache.timestamp < CACHE_DURATION
    ) {
      return exchangeRatesCache.rates;
    }

    // Fetch new rates
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // Update cache
    exchangeRatesCache = {
      rates: data.rates,
      timestamp: now,
      baseCurrency: baseCurrency
    };

    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API fails
    return getFallbackRates(baseCurrency);
  }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Converted amount
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount; // Return original amount if conversion fails
  }
};

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {Promise<number>} Exchange rate
 */
export const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    return rates[toCurrency] || 1;
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    return 1;
  }
};

/**
 * Get fallback exchange rates (static rates for common currencies)
 * @param {string} baseCurrency - Base currency code
 * @returns {Object} Fallback rates object
 */
const getFallbackRates = (baseCurrency) => {
  // Static fallback rates (approximate values)
  const fallbackRates = {
    USD: {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      INR: 83.12,
      CAD: 1.36,
      AUD: 1.52,
      JPY: 149.50,
      CNY: 7.24,
      CHF: 0.88,
      MXN: 17.08
    },
    EUR: {
      USD: 1.18,
      EUR: 1,
      GBP: 0.86,
      INR: 97.79,
      CAD: 1.60,
      AUD: 1.79,
      JPY: 175.88,
      CNY: 8.52,
      CHF: 1.04,
      MXN: 20.09
    },
    GBP: {
      USD: 1.37,
      EUR: 1.16,
      GBP: 1,
      INR: 113.86,
      CAD: 1.86,
      AUD: 2.08,
      JPY: 204.79,
      CNY: 9.92,
      CHF: 1.21,
      MXN: 23.40
    },
    INR: {
      USD: 0.012,
      EUR: 0.010,
      GBP: 0.009,
      INR: 1,
      CAD: 0.016,
      AUD: 0.018,
      JPY: 1.80,
      CNY: 0.087,
      CHF: 0.011,
      MXN: 0.206
    }
  };

  return fallbackRates[baseCurrency] || fallbackRates.USD;
};

/**
 * Get currency symbol
 * @param {string} currencyCode - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CNY: '¥',
    CAD: 'CA$',
    AUD: 'A$',
    CHF: 'CHF',
    MXN: 'MX$',
    BRL: 'R$',
    ZAR: 'R',
    KRW: '₩',
    SGD: 'S$',
    HKD: 'HK$',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    THB: '฿',
    IDR: 'Rp',
    MYR: 'RM',
    PHP: '₱',
    CZK: 'Kč',
    ILS: '₪',
    CLP: 'CLP$',
    TWD: 'NT$',
    TRY: '₺',
    AED: 'د.إ',
    SAR: '﷼'
  };

  return symbols[currencyCode] || currencyCode;
};

/**
 * Get list of supported currencies
 * @returns {Array} Array of currency objects
 */
export const getSupportedCurrencies = () => {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' }
  ];
};

/**
 * Clear exchange rates cache
 */
export const clearExchangeRatesCache = () => {
  exchangeRatesCache = {
    rates: null,
    timestamp: null,
    baseCurrency: 'USD'
  };
};
