# Phase 3a: how to resume (fresh session)

Written for a session that has none of the earlier conversation. Read this, then `state.md`.

## Where things stand

- Phase 3a tasks 1 to 4 are done and merged: read and decide, domain core (`src/domain/`, ADR 0003), property tests (fast-check, seed 20261122), one-page UI (`src/App.tsx`, `src/ledger.ts`, `src/money-input.ts`).
- Next is **task 5**: `pnpm verify` CLI and the verification skill (Tier 2). Then task 6 (CI `e2e` and `verify` jobs), 7 (seeded bugs, only after the ladder is complete), 8 to 10, and 3b.
- The task list and the appendices (domain spec, the 10 seeded bugs) are in `~/develop/gengar/_bootstrap/phase3-tasks.md`. That file is outside the repo; read it first.

## Before you start

1. Quota gate. Check usage (`get_usage` in the desktop app, or the `rate_limit_event` lines of a headless run). Do not start a task at weekly 85% or more. Stop at 90% and mark `paused-quota` in `state.md`. The weekly window resets 2026-11-25 09:00Z. Record the usage before and after every PR in `decisions.tsv`.
2. Use Sonnet for the lead session (`claude --model sonnet`), Claude Code 2.1.324 or newer (needed for the pinned pstack marketplace).
3. Work from `main`. `pnpm install` once, with no `--store-dir`. If `pnpm` aborts with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`, run `CI=true pnpm install --frozen-lockfile`.
4. Start the session in a small context: one task, one PR, one session, with an explicit spec taken from `phase3-tasks.md`. Long sessions cost far more per turn.

## Merge authority (decided by Luis)

I may squash-merge a PR once both checks (`check`, `conventional-title`) are SUCCESS on the current head, with `gh pr merge --squash --match-head-commit <sha>`, and I must show the output in the same turn. Not for any PR that touches a Tier 2 path: `.github/`, `verify/`, `.claude/`, `.husky/`, `scripts/`, `package.json`, `pnpm-lock.yaml`, `AGENTS.md`, `eslint.config.js`, `vite.config.ts`, `playwright.config.ts`, `commitlint.config.js`, `tsconfig.json`. Those wait for Luis. Task 5 and task 6 are Tier 2.
Ruleset changes (task 6 adds `e2e` and `verify` as required checks) are made by Luis. Give him the command, do not run it.

## Running a task as a headless session (what worked)

Each of tasks 2 to 4 ran as a fresh `claude -p "/pstack:poteto-mode <brief>"` session, about 0.5 to 0.6 USD list price each. Use the desktop app's bundled Claude Code (2.1.330 or newer) or any CLI at 2.1.324 or newer. Flags: `--model sonnet --effort medium --permission-mode acceptEdits --max-turns 120 --output-format stream-json --verbose`. Allowed tools (nothing else):

- `Read Edit Write Glob Grep Agent Skill ToolSearch TaskCreate TaskUpdate TaskList TaskGet EnterWorktree ExitWorktree`
- `Bash(git *) Bash(pnpm *) Bash(pnpm exec *) Bash(npx vitest *) Bash(npx playwright *) Bash(npx tsc *) Bash(npx eslint *) Bash(vitest *) Bash(playwright *) Bash(node_modules/.bin/*) Bash(./node_modules/.bin/*) Bash(node *) Bash(gh pr *) Bash(gh run *)`
- `Bash(cd *) Bash(ls *) Bash(cat *) Bash(rg *) Bash(grep *) Bash(head *) Bash(tail *) Bash(wc *) Bash(diff *) Bash(echo *) Bash(printf *) Bash(mkdir *) Bash(sort *) Bash(cut *) Bash(sleep *) Bash(test *) Bash(/bin/date *)`

Not allowed: `gh api`, `gh repo`, `curl`, `rm`, `sudo`. The user-level settings also deny force-push, `git reset --hard` and `git clean`.

Brief rules that worked: give the goal and the authoritative spec; say what is out of scope; fix the accessible names a journey will use; tell the agent to add files by name (never `git add -A`), to write each decision with `pnpm decision` as it is made, to **stop at a PR with green checks and not merge**, and to report the PR number, head SHA and run id with the command output. Say that the PR must touch no Tier 2 path unless the task is a Tier 2 task.

## Lessons from tasks 2 to 4

- Do not pass `--store-dir` to pnpm. It relinks `node_modules` to another store and then plain `pnpm` aborts without a TTY, which blocks the pre-commit hook. Repair: `CI=true pnpm install --frozen-lockfile`.
- Do not run git commands in the main checkout while a headless run is using it. A headless session works in the checkout (it did not use a worktree in tasks 2 to 4).
- A decision row written in the main checkout before launching a run gets committed by the agent. Write it on a branch instead.
- The headless agent runs `gh` and `git push` outside the sandbox when it must; that is expected.
- A commitlint body line that starts with `Word: ` is parsed as a footer and gives a warning. Avoid it.
- Playwright inside the sandbox is untested. Task 5 is the first task that needs a browser; check it early and record the result.

## Stray local files (Luis to clean up)

`.pnpm-store/` in the repo root (ignored by `.gitignore`), another in `~/develop/gengar/`, local branches that are already merged, and the worktrees `.claude/worktrees/feat-format-money` and `tabsplit-notes`.
