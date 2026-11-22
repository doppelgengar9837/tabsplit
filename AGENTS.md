# AGENTS.md — rules for humans and agents working on tabsplit

This file is the only source of rules. `CLAUDE.md` just points here.

## What this is
tabsplit is a small, client-only bill-splitting web app (members, expenses, settlement).
The product is deliberately small: the real product is the development environment around it.
Plan: `docs/ai/plan.md`. Current status: `docs/ai/state.md`. Decisions: `docs/ai/decisions.tsv`. ADRs: `docs/ai/adr/`.

## Stack
Vite + React + TypeScript (strict, TS pinned to 6.x), pnpm, ESLint, Vitest, Playwright.
Data lives in browser localStorage. No backend, no accounts.

## Commands
- `pnpm dev` — dev server
- `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` — the `check` CI job runs all four
- `pnpm test:e2e` — Playwright (journeys arrive in Phase 3)
- `pnpm decision <phase> <decision> <why> <evidence> <result>` — append a row to decisions.tsv

## Hard rules
1. Money is an integer in the smallest currency unit. Never use floats for money (ADR 0002).
2. Never call `Date.now()`, `new Date()` (no args) or `Math.random()` outside `src/clock.ts`.
   Inject a `Clock` instead. ESLint enforces this.
3. No credentials, tokens, keys or `.env` content in the repo, ever. `.claude/settings.local.json` is gitignored.
4. Never push to `main`. Work on a branch and open a PR. Squash merge only.
5. Commit messages and PR titles use Conventional Commits: `type(scope): description`
   (types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert). Scope is optional.
   commitlint checks commits locally (husky) and PR titles in CI.
6. Do not weaken checks: no `@ts-ignore`, `eslint-disable`, `.skip` or loosened config to make a check pass.
7. Do not edit CI, ruleset, hooks or lint/type config unless the task is explicitly about them.

## Decisions and deviations
- Every important decision gets one row in `docs/ai/decisions.tsv` via `pnpm decision`.
  Never write the time yourself: the command stamps it from `/bin/date`.
- Deviating from `docs/ai/plan.md` requires a decision row that states the reason and how to roll back.
- When unsure, pick a reasoned default, record it, and continue. Do not stall waiting for an answer.
  If truly blocked, say so in `docs/ai/state.md` and move to the next independent task.

## Definition of done
Branch -> PR with a Conventional Commits title -> `check` and `conventional-title` green -> squash merge.
Update `docs/ai/state.md` when a phase gate or the current status changes.

## Not installed yet
pstack (`/poteto-mode`, playbooks, verification skills) arrives in Phase 2. Until then work is guided by hand.
