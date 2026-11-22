import { err, ok, type Result } from "./domain";

export type AmountError = "Empty" | "NotANumber" | "TooManyDecimals" | "NotPositive" | "TooLarge";

const AMOUNT = /^(\d+)(?:\.(\d*))?$/;

/** Parses a USD amount like "19.99" into integer cents using integer logic only. */
export function parseAmount(text: string): Result<number, AmountError> {
  const trimmed = text.trim();
  if (trimmed === "") return err("Empty");
  const match = AMOUNT.exec(trimmed);
  if (match === null) return err("NotANumber");
  const whole = match[1] ?? "";
  const fraction = match[2] ?? "";
  if (fraction.length > 2) return err("TooManyDecimals");
  const cents = Number(whole + fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return err("TooLarge");
  if (cents === 0) return err("NotPositive");
  return ok(cents);
}

export const AMOUNT_MESSAGES: Record<AmountError, string> = {
  Empty: "Enter an amount.",
  NotANumber: "Amount must be a positive number like 19.99.",
  TooManyDecimals: "Amount can have at most 2 decimals.",
  NotPositive: "Amount must be greater than 0.",
  TooLarge: "Amount is too large.",
};
