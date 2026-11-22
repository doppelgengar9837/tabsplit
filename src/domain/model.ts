import { err, ok, type Result } from "./result";

export type MemberId = string;

export interface Expense {
  id: string;
  payerId: MemberId;
  /** Integer in the smallest currency unit; a safe integer greater than 0. */
  amount: number;
  participantIds: readonly MemberId[];
}

export type DomainError =
  | { kind: "InvalidAmount"; amount: number }
  | { kind: "NoParticipants" }
  | { kind: "UnknownMember"; memberId: MemberId }
  | { kind: "MemberInUse"; memberId: MemberId };

/** Ascending by UTF-16 code unit. Deliberately not localeCompare, which depends on the locale. */
export function compareIds(a: MemberId, b: MemberId): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function validateExpense(
  memberIds: readonly MemberId[],
  expense: Expense,
): Result<Expense, DomainError> {
  if (!Number.isSafeInteger(expense.amount) || expense.amount <= 0) {
    return err({ kind: "InvalidAmount", amount: expense.amount });
  }
  if (expense.participantIds.length === 0) {
    return err({ kind: "NoParticipants" });
  }
  for (const id of [expense.payerId, ...expense.participantIds]) {
    if (!memberIds.includes(id)) return err({ kind: "UnknownMember", memberId: id });
  }
  return ok(expense);
}

/** Allowed only when no expense references the member as payer or participant. */
export function removeMember(
  memberIds: readonly MemberId[],
  expenses: readonly Expense[],
  memberId: MemberId,
): Result<MemberId[], DomainError> {
  if (!memberIds.includes(memberId)) return err({ kind: "UnknownMember", memberId });
  const inUse = expenses.some(
    (e) => e.payerId === memberId || e.participantIds.includes(memberId),
  );
  if (inUse) return err({ kind: "MemberInUse", memberId });
  return ok(memberIds.filter((id) => id !== memberId));
}
