import { describe, expect, it } from "vitest";
import { removeMember, validateExpense, type Expense } from "./model";
import { settle } from "./settle";
import { equalSplit, netBalances } from "./split";

const members = ["a", "b", "c"];

function expense(over: Partial<Expense> = {}): Expense {
  return { id: "e1", payerId: "a", amount: 100, participantIds: ["a", "b", "c"], ...over };
}

describe("equalSplit", () => {
  it("splits evenly when divisible", () => {
    expect(equalSplit(300, ["a", "b", "c"])).toEqual([
      { memberId: "a", share: 100 },
      { memberId: "b", share: 100 },
      { memberId: "c", share: 100 },
    ]);
  });

  it("gives the remainder units to the first ids in ascending order", () => {
    expect(equalSplit(100, ["c", "a", "b"])).toEqual([
      { memberId: "a", share: 34 },
      { memberId: "b", share: 33 },
      { memberId: "c", share: 33 },
    ]);
    expect(equalSplit(101, ["c", "a", "b"]).map((s) => s.share)).toEqual([34, 34, 33]);
  });

  it("handles an amount smaller than the number of participants", () => {
    expect(equalSplit(2, ["z", "x", "y"])).toEqual([
      { memberId: "x", share: 1 },
      { memberId: "y", share: 1 },
      { memberId: "z", share: 0 },
    ]);
  });

  it("is independent of input order and does not mutate the input", () => {
    const ids = ["c", "b", "a"];
    expect(equalSplit(10, ids)).toEqual(equalSplit(10, ["a", "b", "c"]));
    expect(ids).toEqual(["c", "b", "a"]);
  });

  it("sums to the amount", () => {
    const total = equalSplit(Number.MAX_SAFE_INTEGER, ["a", "b", "c", "d", "e", "f", "g"]).reduce(
      (sum, s) => sum + s.share,
      0,
    );
    expect(total).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("throws when an invariant is broken", () => {
    expect(() => equalSplit(0, ["a"])).toThrow(RangeError);
    expect(() => equalSplit(10, [])).toThrow(RangeError);
  });
});

describe("validateExpense", () => {
  it("accepts a valid expense", () => {
    const e = expense();
    expect(validateExpense(members, e)).toEqual({ ok: true, value: e });
  });

  it.each([0, -5, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1])("rejects amount %s", (amount) => {
    const result = validateExpense(members, expense({ amount }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe("InvalidAmount");
  });

  it("rejects empty participants", () => {
    expect(validateExpense(members, expense({ participantIds: [] }))).toEqual({
      ok: false,
      error: { kind: "NoParticipants" },
    });
  });

  it("rejects an unknown participant or payer", () => {
    expect(validateExpense(members, expense({ participantIds: ["a", "zed"] }))).toEqual({
      ok: false,
      error: { kind: "UnknownMember", memberId: "zed" },
    });
    expect(validateExpense(members, expense({ payerId: "zed" }))).toEqual({
      ok: false,
      error: { kind: "UnknownMember", memberId: "zed" },
    });
  });
});

describe("netBalances", () => {
  it("is paid minus owed and sums to 0", () => {
    const result = netBalances(members, [expense({ amount: 100 }), expense({ id: "e2", payerId: "b", amount: 50, participantIds: ["a", "b"] })]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // e1: a paid 100, shares a34 b33 c33. e2: b paid 50, shares a25 b25.
    expect(Object.fromEntries(result.value)).toEqual({ a: 100 - 34 - 25, b: 50 - 33 - 25, c: -33 });
    expect([...result.value.values()].reduce((x, y) => x + y, 0)).toBe(0);
  });

  it("lists members without expenses at 0", () => {
    const result = netBalances(members, []);
    expect(result.ok && Object.fromEntries(result.value)).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("returns the validation error of an invalid expense", () => {
    expect(netBalances(members, [expense({ amount: 0 })])).toEqual({
      ok: false,
      error: { kind: "InvalidAmount", amount: 0 },
    });
  });
});

describe("settle", () => {
  const apply = (nets: Map<string, number>, transfers: ReturnType<typeof settle>) => {
    const left = new Map(nets);
    for (const t of transfers) {
      left.set(t.from, (left.get(t.from) ?? 0) + t.amount);
      left.set(t.to, (left.get(t.to) ?? 0) - t.amount);
    }
    return left;
  };

  it("returns nothing when everyone is square", () => {
    expect(settle(new Map([["a", 0], ["b", 0]]))).toEqual([]);
  });

  it("breaks creditor ties by id ascending", () => {
    expect(settle(new Map([["b", 10], ["a", 10], ["c", -20]]))).toEqual([
      { from: "c", to: "a", amount: 10 },
      { from: "c", to: "b", amount: 10 },
    ]);
  });

  it("breaks debtor ties by id ascending", () => {
    expect(settle(new Map([["a", 20], ["c", -10], ["b", -10]]))).toEqual([
      { from: "b", to: "a", amount: 10 },
      { from: "c", to: "a", amount: 10 },
    ]);
  });

  it("zeroes every net and stays within (non-zero nets) - 1 transfers", () => {
    const nets = new Map([["a", 4], ["b", 3], ["c", 3], ["d", -6], ["e", -4], ["f", 0]]);
    const transfers = settle(nets);
    expect([...apply(nets, transfers).values()].every((v) => v === 0)).toBe(true);
    expect(transfers.length).toBeLessThanOrEqual(5 - 1);
  });

  it("is not minimal: this case takes 4 transfers where 3 exist", () => {
    // Optimal: a<-e 4, then b and c both <- d 3. Greedy pairs a with d first.
    const transfers = settle(new Map([["a", 4], ["b", 3], ["c", 3], ["d", -6], ["e", -4]]));
    expect(transfers).toEqual([
      { from: "d", to: "a", amount: 4 },
      { from: "e", to: "b", amount: 3 },
      { from: "d", to: "c", amount: 2 },
      { from: "e", to: "c", amount: 1 },
    ]);
  });

  it("throws when the nets do not sum to 0", () => {
    expect(() => settle(new Map([["a", 5], ["b", -4]]))).toThrow(RangeError);
  });

  it("settles real expenses end to end", () => {
    const nets = netBalances(members, [expense({ amount: 100 })]);
    expect(nets.ok && settle(nets.value)).toEqual([
      { from: "b", to: "a", amount: 33 },
      { from: "c", to: "a", amount: 33 },
    ]);
  });
});

describe("removeMember", () => {
  it("removes a member no expense references", () => {
    expect(removeMember(members, [expense({ participantIds: ["a", "b"] })], "c")).toEqual({
      ok: true,
      value: ["a", "b"],
    });
  });

  it("returns MemberInUse for a payer or a participant", () => {
    expect(removeMember(members, [expense()], "a")).toEqual({ ok: false, error: { kind: "MemberInUse", memberId: "a" } });
    expect(removeMember(members, [expense()], "c")).toEqual({ ok: false, error: { kind: "MemberInUse", memberId: "c" } });
  });

  it("returns UnknownMember for an id that is not a member", () => {
    expect(removeMember(members, [], "zed")).toEqual({ ok: false, error: { kind: "UnknownMember", memberId: "zed" } });
  });
});
