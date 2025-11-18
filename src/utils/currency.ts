import { CURRENCIES, CurrencyCode, DEFAULT_CURRENCY } from '@/types/currency';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currencyCode - The currency code (defaults to GHS)
 * @param includeSymbol - Whether to include the currency symbol
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
  includeSymbol: boolean = true
): string {
  const currency = CURRENCIES[currencyCode];
  
  if (!currency) {
    console.warn(`Currency ${currencyCode} not found, using default`);
    return formatCurrency(amount, DEFAULT_CURRENCY, includeSymbol);
  }

  const formattedAmount = amount.toFixed(currency.decimalPlaces);
  
  if (!includeSymbol) {
    return formattedAmount;
  }

  if (currency.symbolPosition === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${currency.symbol}`;
  }
}

/**
 * Format currency with thousands separator
 * @param amount - The amount to format
 * @param currencyCode - The currency code (defaults to GHS)
 * @param includeSymbol - Whether to include the currency symbol
 * @returns Formatted currency string with thousands separator
 */
export function formatCurrencyWithSeparator(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
  includeSymbol: boolean = true
): string {
  const currency = CURRENCIES[currencyCode];
  
  if (!currency) {
    console.warn(`Currency ${currencyCode} not found, using default`);
    return formatCurrencyWithSeparator(amount, DEFAULT_CURRENCY, includeSymbol);
  }

  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  });
  
  if (!includeSymbol) {
    return formattedAmount;
  }

  if (currency.symbolPosition === 'before') {
    return `${currency.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount}${currency.symbol}`;
  }
}

/**
 * Get currency symbol
 * @param currencyCode - The currency code (defaults to GHS)
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: CurrencyCode = DEFAULT_CURRENCY): string {
  return CURRENCIES[currencyCode]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
}

/**
 * Parse currency string to number
 * @param value - The currency string to parse
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert amount between currencies (placeholder for future exchange rate API)
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount (currently returns same amount as placeholder)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  // TODO: Implement actual currency conversion with exchange rates API
  // For now, return the same amount
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  console.warn('Currency conversion not yet implemented, returning original amount');
  return amount;
}

