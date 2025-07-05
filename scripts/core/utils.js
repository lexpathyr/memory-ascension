// utils.js

export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function conversionRate(from, to) {
  const rates = {
    bit: 1,
    nibble: 4,
    byte: 8,
    kilobyte: 8 * 1024,
    megabyte: 8 * 1024 * 1024,
    gigabyte: 8 * 1024 * 1024 * 1024,
    terabyte: 8 * 1024 * 1024 * 1024 * 1024
  };

  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    console.warn(`Invalid conversion rate: '${from}' to '${to}'`);
    return 1; // default fallback
  }

  return toRate / fromRate;
}