const CURRENCIES = {
  USD: { exponent: 2, symbol: "$" },
  EUR: { exponent: 2, symbol: "€" },
  JPY: { exponent: 0, symbol: "¥" },
  KWD: { exponent: 3, symbol: "KD " },
} as const satisfies Record<string, { exponent: number; symbol: string }>;

export type CurrencyCode = keyof typeof CURRENCIES;

/** Formats integer minor units as a display string; output is locale-independent. */
export function formatMoney(minorUnits: number, currency: CurrencyCode): string {
  if (!Number.isSafeInteger(minorUnits)) {
    throw new RangeError(`minorUnits must be a safe integer, got ${minorUnits}`);
  }
  const { exponent, symbol } = CURRENCIES[currency];
  const digits = String(Math.abs(minorUnits)).padStart(exponent + 1, "0");
  const whole = digits.slice(0, digits.length - exponent).replace(/\B(?=(\d{3})+$)/g, ",");
  const fraction = exponent > 0 ? `.${digits.slice(digits.length - exponent)}` : "";
  const sign = minorUnits < 0 ? "-" : "";
  return `${sign}${symbol}${whole}${fraction}`;
}
