// lib/currency.js
import { unstable_cache } from "next/cache";

const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/USD";

import { SUPPORTED_CURRENCIES } from "./constants";

/**
 * Fetch latest exchange rates from open API.
 * Caches the result for 24 hours (86400 seconds) to avoid rate limits.
 */
export const getExchangeRates = unstable_cache(
  async () => {
    try {
      const response = await fetch(EXCHANGE_RATE_API);
      if (!response.ok) throw new Error("Failed to fetch exchange rates");
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.error("Exchange Rate API Error:", error);
      // Fallback rates if API fails
      return {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.3,
        CAD: 1.35,
        AUD: 1.52,
        JPY: 150.5,
      };
    }
  },
  ["exchange-rates"],
  { revalidate: 86400 } // Cache for 24 hours
);

/**
 * Convert an amount from one currency to another using the latest rates.
 */
export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  
  const rates = await getExchangeRates();
  
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // Convert to USD first (base), then to target
  return (amount / fromRate) * toRate;
}

/**
 * Get the symbol for a given currency code.
 */
export function getCurrencySymbol(currencyCode) {
  const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  return currency ? currency.symbol : "$";
}
