# State

Last updated: 2026-11-22T22:33:39+0800 (system clock)

## Phase
Phase 3a — verification ladder (L0 to L2, seeded bugs, CI verify, Feature Map, cold start). In progress. Tasks 1 (read and decide) and 2 (domain core, PR #15) are done. Next: task 3 (property tests with fast-check, a Tier 2 change that waits for Luis) and task 4 (one-page UI). Phase 2 is done (gate met 2026-11-22). Phase 3b (L3 smoke on a Vercel preview) waits for Luis to wire Vercel and must finish before Phase 4.

Quota at the start of Phase 3 (from `get_usage`): 5-hour window 55% (resets 17:40Z), weekly 82% (resets 2026-11-25 09:00Z). Stop rule: weekly above 90% or 5-hour window used up means mark `paused-quota` here and resume next window.

## Done
- Repo: https://github.com/doppelgengar9837/tabsplit (public)
- Skeleton on main: Vite + React + TypeScript (strict, TS 6.x), ESLint with Clock-only bans, Vitest, Playwright config (no journeys), localStorage empty form, `formatMoney` in `src/money.ts` (Phase 2 trial, PR #8)
- commitlint + tracked git hooks in .husky/ (commit-msg, pre-commit lint+typecheck); `pnpm install` runs scripts/prepare.mjs, which wires core.hooksPath to .husky (a relative path, or an absolute path to this or the main checkout's .husky, is accepted)
- docs/ai: plan, state, decisions.tsv (pnpm decision), ADR 0001 tooling, ADR 0002 integer money + Clock, pstack-source-review.md, pstack-playbooks.md (restoration checklist, confirmed), pstack-trial-run.md; AGENTS.md (human gates, pstack section), CLAUDE.md pointer
- CI: check (lint, typecheck, unit, build) and conventional-title; green on main
- Ruleset main-protection active (id 27842458): PR required, squash only, linear history, strict required checks, no deletion/force-push, no bypass
- pstack: `pstack@cursor-plugins` 0.15.46 at project scope, marketplace pinned in .claude/settings.json to 7a583913eb1b8d1a0ee76753d1a2cf072e7b54f9 (needs Claude Code 2.1.324+); model rule .claude/rules/pstack-models.md at budget small, no fable seats, panels cut to one opus seat plus inherit-parent; one real /pstack:poteto-mode trial run (PR #8)

## Not started
Phase 3b and Phases 4-7. No GitHub App. No Vercel. No e2e/verify CI jobs (Phase 3). No CODEOWNERS (Phase 4).

## Open items (need Luis)
- **Re-tune `.claude/rules/pstack-models.md` after Phase 3** (open decision). Luis set it to budget small with no fable seats (fable returns 429 on this plan; the trial cost about 3.10 USD list price and moved the 5-hour quota window 32% to 42%). Revisit once Phase 3 has measured cost per PR, and re-check fable then.
- **Remove the trial worktree** `.claude/worktrees/feat-format-money` (locked, has a `.pnpm-store/`)? Deleting it is data deletion, so it waits for Luis. `.claude/worktrees/` is now gitignored.
- Phase 4 (open decision): the pstack plugin cache is user-level and keyed by version; a cloud bot needs a reinstall via the pinned marketplace or vendoring. See decisions.tsv.
- `watch-pr` needs its own review before Phase 5 (its first run does a network `bun install`).

## Known caveats
- Human-present session: PR author is gengar. Switch to a bot identity before unattended runs (Phase 4).
- "Merging is a human gate" is enforced by AGENTS.md text only until Phase 4; the trial showed it was followed once, which is not proof.
- gh must run outside the Claude sandbox (keyring is unreadable inside it).
- .claude/settings.local.json is per-machine and takes effect only for new sessions.
- Local core.hooksPath is currently the absolute path to the main checkout's .husky (set by something other than prepare.mjs, inferred to be Claude Code worktree creation). It works and prepare.mjs accepts it.
- Repo-level merge/rebase merges are still enabled; only the ruleset forces squash. Repo setting delete_branch_on_merge is on.
