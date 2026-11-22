import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { equalSplit, netBalances, settle, type Expense } from "./index";

// Fixed default seed so two runs of one commit are identical; set FC_SEED=<int> to explore other inputs.
const override = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.FC_SEED;
const seed = override === undefined ? 20261122 : Number.parseInt(override, 10);
const params = { seed, numRuns: 300 };

const memberIds = fc.uniqueArray(fc.string({ minLength: 1, maxLength: 4 }), { minLength: 1, maxLength: 8 });
const amount = fc.integer({ min: 1, max: 1_000_000_000 });

function expensesOf(ids: readonly string[]): fc.Arbitrary<Expense[]> {
  return fc
    .array(
      fc.record({
        payerId: fc.constantFrom(...ids),
        amount,
        participantIds: fc.shuffledSubarray([...ids], { minLength: 1 }),
      }),
      { maxLength: 12 },
    )
    .map((list) => list.map((e, i) => ({ id: `e${i}`, ...e })));
}

const scenario = memberIds.chain((ids) => expensesOf(ids).map((expenses) => ({ ids, expenses })));

function nets(ids: readonly string[], expenses: readonly Expense[]): Map<string, number> {
  const result = netBalances(ids, expenses);
  if (!result.ok) throw new Error(`generated scenario was rejected: ${result.error.kind}`);
  return result.value;
}

describe("domain properties", () => {
  it("equal split shares sum to the amount, differ by at most 1, extras go to the first ids ascending", () => {
    fc.assert(
      fc.property(amount, memberIds, (total, ids) => {
        const shares = equalSplit(total, ids);
        const base = Math.floor(total / ids.length);
        const extra = total - base * ids.length;
        expect(shares.reduce((sum, s) => sum + s.share, 0)).toBe(total);
        expect(shares.map((s) => s.memberId)).toEqual([...ids].sort());
        shares.forEach((s, i) => {
          expect(s.share).toBe(i < extra ? base + 1 : base);
        });
      }),
      params,
    );
  });

  it("nets of all members sum to 0", () => {
    fc.assert(
      fc.property(scenario, ({ ids, expenses }) => {
        const total = [...nets(ids, expenses).values()].reduce((a, b) => a + b, 0);
        expect(total).toBe(0);
      }),
      params,
    );
  });

  it("executing every settle transfer leaves every net at exactly 0", () => {
    fc.assert(
      fc.property(scenario, ({ ids, expenses }) => {
        const left = nets(ids, expenses);
        for (const t of settle(nets(ids, expenses))) {
          left.set(t.from, (left.get(t.from) ?? 0) + t.amount);
          left.set(t.to, (left.get(t.to) ?? 0) - t.amount);
        }
        for (const value of left.values()) expect(value).toBe(0);
      }),
      params,
    );
  });

  it("uses at most (non-zero nets) - 1 transfers, each a positive safe integer", () => {
    fc.assert(
      fc.property(scenario, ({ ids, expenses }) => {
        const balances = nets(ids, expenses);
        const nonZero = [...balances.values()].filter((v) => v !== 0).length;
        const transfers = settle(balances);
        expect(transfers.length).toBeLessThanOrEqual(Math.max(nonZero - 1, 0));
        for (const t of transfers) {
          expect(Number.isSafeInteger(t.amount)).toBe(true);
          expect(t.amount).toBeGreaterThan(0);
        }
      }),
      params,
    );
  });

  it("settle is deterministic for the same nets", () => {
    fc.assert(
      fc.property(scenario, ({ ids, expenses }) => {
        expect(settle(nets(ids, expenses))).toEqual(settle(nets(ids, expenses)));
      }),
      params,
    );
  });
});
