import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats two-decimal currencies", () => {
    expect(formatMoney(123456, "USD")).toBe("$1,234.56");
    expect(formatMoney(5, "USD")).toBe("$0.05");
    expect(formatMoney(100, "USD")).toBe("$1.00");
  });
  it("formats zero and negative zero without a sign", () => {
    expect(formatMoney(0, "USD")).toBe("$0.00");
    expect(formatMoney(-0, "USD")).toBe("$0.00");
  });
  it("puts the minus sign before the symbol", () => {
    expect(formatMoney(-123456, "EUR")).toBe("-€1,234.56");
    expect(formatMoney(-5, "JPY")).toBe("-¥5");
  });
  it("formats zero-decimal currencies without a decimal point", () => {
    expect(formatMoney(1234567, "JPY")).toBe("¥1,234,567");
    expect(formatMoney(999, "JPY")).toBe("¥999");
    expect(formatMoney(1000, "JPY")).toBe("¥1,000");
  });
  it("formats three-decimal currencies", () => {
    expect(formatMoney(1234567, "KWD")).toBe("KD 1,234.567");
    expect(formatMoney(1, "KWD")).toBe("KD 0.001");
  });
  it("formats the largest safe integer exactly", () => {
    expect(formatMoney(Number.MAX_SAFE_INTEGER, "USD")).toBe("$90,071,992,547,409.91");
  });
  it("rejects amounts that are not safe integers", () => {
    expect(() => formatMoney(1.5, "USD")).toThrow(RangeError);
    expect(() => formatMoney(NaN, "USD")).toThrow(RangeError);
    expect(() => formatMoney(Infinity, "USD")).toThrow(RangeError);
    expect(() => formatMoney(Number.MAX_SAFE_INTEGER + 1, "USD")).toThrow(RangeError);
  });
});
