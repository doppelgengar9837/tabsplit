/**
 * The only place allowed to read wall-clock time or randomness.
 * Everything else receives a Clock so tests are reproducible.
 * See docs/ai/adr/0002-integer-money-and-clock.md.
 */
export interface Clock {
  /** Current time as epoch milliseconds. */
  now(): number;
  /** Random float in [0, 1). */
  random(): number;
}

/* eslint-disable no-restricted-syntax -- sanctioned boundary: the single real clock */
export const systemClock: Clock = {
  now: () => Date.now(),
  random: () => Math.random(),
};
/* eslint-enable no-restricted-syntax */

/** Deterministic clock for tests. */
export function fixedClock(nowMs: number, randoms: readonly number[] = [0]): Clock {
  let i = 0;
  return {
    now: () => nowMs,
    random: () => randoms[i++ % randoms.length] ?? 0,
  };
}
