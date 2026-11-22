import type { Expense } from "./domain";

const KEY = "tabsplit:v2";

export interface StoredState {
  members: string[];
  expenses: Expense[];
}

const EMPTY: StoredState = { members: [], expenses: [] };

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isExpense(v: unknown): v is Expense {
  if (typeof v !== "object" || v === null) return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e["id"] === "string" &&
    typeof e["payerId"] === "string" &&
    typeof e["amount"] === "number" &&
    isStringArray(e["participantIds"])
  );
}

export function load(storage: Storage = window.localStorage): StoredState {
  const raw = storage.getItem(KEY);
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      const { members, expenses } = parsed as Record<string, unknown>;
      if (isStringArray(members) && Array.isArray(expenses) && expenses.every(isExpense)) {
        return { members, expenses };
      }
    }
  } catch {
    // fall through to empty state
  }
  return EMPTY;
}

export function save(state: StoredState, storage: Storage = window.localStorage): void {
  storage.setItem(KEY, JSON.stringify(state));
}
