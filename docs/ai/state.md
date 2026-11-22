# State

Last updated: 2026-11-22T21:24:47+0800 (system clock)

## Phase
Phase 1 — repo birth and skeleton. **Complete** (gate met). Next: Phase 2 (install and reconstruct pstack), to be started by Luis.

## Done
- Repo: https://github.com/doppelgengar9837/tabsplit (public)
- Skeleton on main: Vite + React + TypeScript (strict, TS 6.x), ESLint with Clock-only bans, Vitest, Playwright config (no journeys), localStorage empty form
- commitlint + tracked husky hooks (commit-msg, pre-commit lint+typecheck)
- docs/ai: plan, state, decisions.tsv (pnpm decision), ADR 0001 tooling, ADR 0002 integer money + Clock; AGENTS.md (44 lines), CLAUDE.md pointer
- CI: check (lint, typecheck, unit, build) and conventional-title; green on main
- Ruleset main-protection active (id 27842458): PR required, squash only, linear history, strict required checks, no deletion/force-push, no bypass
- Drill: PR #1 squash-merged; direct push to main rejected

## Not started
Phases 2-7. pstack is NOT installed. No GitHub App. No Vercel. No e2e/verify CI jobs (Phase 3). No CODEOWNERS (Phase 4).

## Known caveats
- Human-present session: PR author is gengar. Switch to a bot identity before unattended runs (Phase 4).
- gh must run outside the Claude sandbox (keyring is unreadable inside it).
- .claude/settings.local.json is per-machine and takes effect only for new sessions.
- Repo-level merge/rebase merges are still enabled; only the ruleset forces squash.
