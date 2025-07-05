// utils.js

// Capitalizes the first letter of a string, returns empty string for invalid input
export function capitalize(word) {
  if (typeof word !== 'string' || word.length === 0) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}


// Shared resource weights for display and conversion
export const RESOURCE_WEIGHTS = {
  bit: 1,
  nibble: 4,
  byte: 8,
  kilobyte: 8 * 1024,
  megabyte: 8 * 1024 * 1024,
  gigabyte: 8 * 1024 * 1024 * 1024,
  terabyte: 8 * 1024 * 1024 * 1024 * 1024,
  petabyte: 8 * 1024 * 1024 * 1024 * 1024 * 1024
};

// Returns the conversion rate from one resource to another, or null if invalid
export function conversionRate(from, to) {
  const fromRate = RESOURCE_WEIGHTS[from];
  const toRate = RESOURCE_WEIGHTS[to];
  if (!fromRate || !toRate) {
    console.warn(`Invalid conversion rate: '${from}' to '${to}'`);
    return null;
  }
  return toRate / fromRate;
}

// Formats a number with suffixes (K, M, B, T, P) and thousands separators
export function formatNumber(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  if (value < 1e3) return Math.floor(value).toString();
  const suffixes = [ '', 'K', 'M', 'B', 'T', 'P', 'E' ];
  let tier = Math.floor(Math.log10(value) / 3);
  if (tier === 0) return value.toString();
  const suffix = suffixes[tier] || 'e' + (tier * 3);
  const scaled = value / Math.pow(10, tier * 3);
  return scaled.toFixed(2) + suffix;
}