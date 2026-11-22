import { describe, expect, it } from "vitest";
import { parseAmount } from "./money-input";

describe("parseAmount", () => {
  it.each([
    ["19.99", 1999],
    ["19", 1900],
    ["0.5", 50],
    ["0.50", 50],
    ["0.1", 10],
    ["0.07", 7],
    ["1000000", 100000000],
    ["1000000.00", 100000000],
    ["  12.3 ", 1230],
    ["5.", 500],
  ])("parses %s as %i cents", (text, cents) => {
    expect(parseAmount(text)).toEqual({ ok: true, value: cents });
  });

  it.each([
    ["", "Empty"],
    ["   ", "Empty"],
    ["-5", "NotANumber"],
    ["abc", "NotANumber"],
    ["1e3", "NotANumber"],
    ["1,5", "NotANumber"],
    [".5", "NotANumber"],
    ["1.2.3", "NotANumber"],
    ["19.999", "TooManyDecimals"],
    ["0", "NotPositive"],
    ["0.00", "NotPositive"],
    ["99999999999999999999", "TooLarge"],
  ])("rejects %j as %s", (text, kind) => {
    expect(parseAmount(text)).toEqual({ ok: false, error: kind });
  });
});
