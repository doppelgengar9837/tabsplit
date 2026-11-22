const KEY = "tabsplit:v1";

export interface StoredState {
  /** Free-text label of the tab; real domain model arrives in later phases. */
  title: string;
}

export function load(storage: Storage = window.localStorage): StoredState {
  const raw = storage.getItem(KEY);
  if (raw === null) return { title: "" };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { title?: unknown }).title === "string"
    ) {
      return { title: (parsed as StoredState).title };
    }
  } catch {
    // fall through to empty state
  }
  return { title: "" };
}

export function save(state: StoredState, storage: Storage = window.localStorage): void {
  storage.setItem(KEY, JSON.stringify(state));
}
