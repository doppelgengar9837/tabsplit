# ADR 0002: Integer money and an injectable Clock

Status: accepted (Phase 1)

## Decision
1. **Money is always an integer in the smallest currency unit** (e.g. cents). Floats are never used for amounts, shares, balances or settlements.
   - Division of an amount among N people must be deterministic and predictable: shares differ by at most one unit and always sum to the original amount. The exact remainder rule is decided with the feature that needs it (task pool item 8) and recorded in its own ADR.
   - Percentages are validated to sum to exactly 100 before use.
2. **Time and randomness come from an injectable `Clock`** (`src/clock.ts`): `now()` and `random()`.
   - `src/clock.ts` is the only file allowed to call `Date.now()`, `new Date()` (no args) or `Math.random()`.
   - ESLint `no-restricted-syntax` enforces this everywhere else. `new Date(value)` with an argument is allowed (it is deterministic).
   - Tests use `fixedClock(...)`.

## Why
Rounding drift and untestable time/randomness are the two main sources of flaky or silently wrong bill splitting. Making both impossible by construction is cheaper than catching them in review.

## Consequences
The Clock was written fresh for this repo (concept from the plan's product-scope section: injectable "now" and random). No code was copied from superboard-lite.
