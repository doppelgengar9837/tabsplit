import { describe, expect, it } from "vitest";
import { fixedClock } from "./clock";

describe("fixedClock", () => {
  it("returns the injected time", () => {
    expect(fixedClock(1234).now()).toBe(1234);
  });
  it("cycles through injected randoms", () => {
    const c = fixedClock(0, [0.1, 0.2]);
    expect([c.random(), c.random(), c.random()]).toEqual([0.1, 0.2, 0.1]);
  });
});
