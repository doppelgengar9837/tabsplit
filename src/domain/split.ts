import { compareIds, validateExpense, type DomainError, type Expense, type MemberId } from "./model";
import { err, ok, type Result } from "./result";

export interface Share {
  memberId: MemberId;
  share: number;
}

/**
 * Equal split of an integer amount. base = floor(amount / n); the first
 * r = amount - base * n participants (ids ascending) get one extra unit.
 * Shares always sum to amount. Throws only on a broken invariant.
 */
export function equalSplit(amount: number, participantIds: readonly MemberId[]): Share[] {
  const n = participantIds.length;
  if (!Number.isSafeInteger(amount) || amount <= 0 || n === 0) {
    throw new RangeError(`equalSplit needs a positive safe integer amount and participants, got ${amount} / ${n}`);
  }
  const base = Math.floor(amount / n);
  const remainder = amount - base * n;
  return [...participantIds]
    .sort(compareIds)
    .map((memberId, i) => ({ memberId, share: base + (i < remainder ? 1 : 0) }));
}

/** Net per member = total paid minus total owed. The nets always sum to 0. */
export function netBalances(
  memberIds: readonly MemberId[],
  expenses: readonly Expense[],
): Result<Map<MemberId, number>, DomainError> {
  const nets = new Map<MemberId, number>(memberIds.map((id) => [id, 0]));
  const add = (id: MemberId, delta: number): void => {
    const next = (nets.get(id) ?? 0) + delta;
    if (!Number.isSafeInteger(next)) throw new RangeError("net balance left the safe integer range");
    nets.set(id, next);
  };
  for (const expense of expenses) {
    const valid = validateExpense(memberIds, expense);
    if (!valid.ok) return err(valid.error);
    add(expense.payerId, expense.amount);
    for (const { memberId, share } of equalSplit(expense.amount, expense.participantIds)) {
      add(memberId, -share);
    }
  }
  return ok(nets);
}
