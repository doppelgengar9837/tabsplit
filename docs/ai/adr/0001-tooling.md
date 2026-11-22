# ADR 0001: Tooling choices

Status: accepted (Phase 1)

## Decision
- **Vite + React + TypeScript (strict)**: smallest path to a deployable single page; no framework features needed.
- **pnpm**: fast, strict, lockfile is reviewable; Node >= 22.
- **ESLint (flat config, typescript-eslint, react-hooks)**: also carries our determinism ban (see ADR 0002).
- **Vitest + jsdom + Testing Library**: shares Vite config; fast unit tests, including later property tests for money.
- **Playwright**: browser journeys from Phase 3. Config is wired now; no journeys yet.
- **commitlint + husky**: Conventional Commits locally; the same commitlint check runs on PR titles in CI. Hooks live in tracked `.husky/`.
- **TypeScript pinned to 6.x**: typescript-eslint 8.73 refuses to run on TypeScript 7.0. Revisit when typescript-eslint supports >= 7.1; upgrading is a Tier 2 change.

## Notes
The phase-1 task list named these tools; superboard-lite was not consulted, so "same as superboard-lite" is not claimed.
Runtime deps are React only. Everything else is a dev dependency.

## Consequences
Everything in the `check` CI job (lint, typecheck, unit, build) is reproducible with `pnpm` scripts locally.
