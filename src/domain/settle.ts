import { compareIds, type MemberId } from "./model";

export interface Transfer {
  from: MemberId;
  to: MemberId;
  amount: number;
}

/**
 * Greedy settlement: repeatedly pair the largest creditor with the most
 * negative debtor (ties by id ascending) and transfer min(|a|, |b|).
 * At most (members with a non-zero net) - 1 transfers; not guaranteed minimal.
 * Throws only if the nets are not integers summing to 0.
 */
export function settle(nets: ReadonlyMap<MemberId, number>): Transfer[] {
  const remaining = new Map(nets);
  let sum = 0;
  for (const value of remaining.values()) {
    if (!Number.isSafeInteger(value)) throw new RangeError("nets must be safe integers");
    sum += value;
  }
  if (sum !== 0) throw new RangeError(`nets must sum to 0, got ${sum}`);

  const transfers: Transfer[] = [];
  for (;;) {
    let creditor: MemberId | undefined;
    let debtor: MemberId | undefined;
    for (const [id, net] of remaining) {
      if (net > 0 && (creditor === undefined || beats(net, id, remaining.get(creditor) ?? 0, creditor, 1))) {
        creditor = id;
      }
      if (net < 0 && (debtor === undefined || beats(net, id, remaining.get(debtor) ?? 0, debtor, -1))) {
        debtor = id;
      }
    }
    if (creditor === undefined || debtor === undefined) return transfers;
    const credit = remaining.get(creditor) ?? 0;
    const debt = -(remaining.get(debtor) ?? 0);
    const amount = Math.min(credit, debt);
    transfers.push({ from: debtor, to: creditor, amount });
    remaining.set(creditor, credit - amount);
    remaining.set(debtor, amount - debt);
  }
}

/** Is (net, id) a better pick than (bestNet, bestId)? direction 1 = largest, -1 = smallest; id ascending on ties. */
function beats(net: number, id: MemberId, bestNet: number, bestId: MemberId, direction: 1 | -1): boolean {
  if (net !== bestNet) return (net - bestNet) * direction > 0;
  return compareIds(id, bestId) < 0;
}
