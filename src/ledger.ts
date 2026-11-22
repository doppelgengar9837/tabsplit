import {
  err,
  netBalances,
  ok,
  removeMember,
  settle,
  validateExpense,
  type DomainError,
  type Result,
  type Transfer,
} from "./domain";
import { AMOUNT_MESSAGES, parseAmount } from "./money-input";
import type { StoredState } from "./storage";

export type Ledger = StoredState;

export interface ExpenseInput {
  payerId: string;
  amountText: string;
  participantIds: readonly string[];
}

export function describeError(error: DomainError): string {
  switch (error.kind) {
    case "InvalidAmount":
      return "Amount must be a positive whole number of cents.";
    case "NoParticipants":
      return "Pick at least one participant.";
    case "UnknownMember":
      return `Unknown member: ${error.memberId}.`;
    case "MemberInUse":
      return `Cannot delete ${error.memberId}: an expense still references them.`;
  }
}

export function addMember(ledger: Ledger, name: string): Result<Ledger, string> {
  const id = name.trim();
  if (id === "") return err("Member name cannot be empty.");
  if (ledger.members.includes(id)) return err(`${id} is already a member.`);
  return ok({ ...ledger, members: [...ledger.members, id] });
}

export function deleteMember(ledger: Ledger, id: string): Result<Ledger, string> {
  const result = removeMember(ledger.members, ledger.expenses, id);
  if (!result.ok) return err(describeError(result.error));
  return ok({ ...ledger, members: result.value });
}

export function addExpense(ledger: Ledger, input: ExpenseInput): Result<Ledger, string> {
  const amount = parseAmount(input.amountText);
  if (!amount.ok) return err(AMOUNT_MESSAGES[amount.error]);
  const expense = {
    id: `e${ledger.expenses.length + 1}`,
    payerId: input.payerId,
    amount: amount.value,
    participantIds: input.participantIds,
  };
  const valid = validateExpense(ledger.members, expense);
  if (!valid.ok) return err(describeError(valid.error));
  return ok({ ...ledger, expenses: [...ledger.expenses, valid.value] });
}

export interface LedgerView {
  nets: { memberId: string; net: number }[];
  transfers: Transfer[];
}

export function viewLedger(ledger: Ledger): Result<LedgerView, string> {
  const nets = netBalances(ledger.members, ledger.expenses);
  if (!nets.ok) return err(describeError(nets.error));
  return ok({
    nets: ledger.members.map((memberId) => ({ memberId, net: nets.value.get(memberId) ?? 0 })),
    transfers: settle(nets.value),
  });
}
