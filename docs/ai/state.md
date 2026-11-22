# State

Last updated: 2026-11-22T21:45:39+0800 (system clock)

## Phase
Phase 2 — install and reconstruct pstack. **Paused at task 3** (human gate): waiting for Luis to confirm D2. Nothing is installed yet.

## Done
- Repo: https://github.com/doppelgengar9837/tabsplit (public)
- Skeleton on main: Vite + React + TypeScript (strict, TS 6.x), ESLint with Clock-only bans, Vitest, Playwright config (no journeys), localStorage empty form
- commitlint + tracked git hooks in .husky/ (commit-msg, pre-commit lint+typecheck); `pnpm install` runs scripts/prepare.mjs to set core.hooksPath=.husky (Phase 1.5)
- docs/ai: plan, state, decisions.tsv (pnpm decision), ADR 0001 tooling, ADR 0002 integer money + Clock; AGENTS.md (44 lines), CLAUDE.md pointer
- CI: check (lint, typecheck, unit, build) and conventional-title; green on main
- Ruleset main-protection active (id 27842458): PR required, squash only, linear history, strict required checks, no deletion/force-push, no bypass
- Drill: PR #1 squash-merged; direct push to main rejected

## Not started
Phases 2-7. pstack is NOT installed. No GitHub App. No Vercel. No e2e/verify CI jobs (Phase 3). No CODEOWNERS (Phase 4).

## Open items
- Task 3 / D2: confirm pstack source and pin. Recommendation and evidence: `docs/ai/pstack-source-review.md` (A: upstream cursor/plugins pstack 0.15.46 at 7a583913eb1b8d1a0ee76753d1a2cf072e7b54f9).
- (none) Task 10 passed 2026-11-22: Luis confirmed `gh auth status` shows doppelgengar9837 in a normal terminal, with `GH_CONFIG_DIR` provided by `.claude/settings.local.json`.

## Known caveats
- Human-present session: PR author is gengar. Switch to a bot identity before unattended runs (Phase 4).
- gh must run outside the Claude sandbox (keyring is unreadable inside it).
- .claude/settings.local.json is per-machine and takes effect only for new sessions.
- Repo-level merge/rebase merges are still enabled; only the ruleset forces squash.
- Repo setting delete_branch_on_merge is on: merged PR head branches are deleted automatically.
