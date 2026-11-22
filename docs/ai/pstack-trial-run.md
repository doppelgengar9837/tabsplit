# pstack trial run (Phase 2, task 7)

Date: 2026-11-22. Result: PR #8 `feat(money): add formatMoney for integer minor units`, squash-merged as `67074b0`, CI green on the PR head and on `main`.
Evidence lives in `docs/ai/decisions.tsv` (phase 2 rows) and in the run stream kept outside the repo (scratchpad `trial/stream.jsonl`).

## How it was run

- A real `/pstack:poteto-mode <brief>` in a fresh headless Claude Code 2.1.330 session in the repo: model opus, effort high, `acceptEdits`, 150-turn cap.
- Tools allowed: Read, Edit, Write, Glob, Grep, Agent, Skill, TodoWrite, and Bash for `git`, `pnpm`, `gh pr`, `gh run` and basic read commands. Not `gh api`, `gh repo`, `curl`, `rm`.
- The brief gave the goal, the spec and exactly one authorized gate action (squash merge of this PR after both checks are green). It did not mention principles, decisions or the checklist doc.

## What Luis asked to see

| Check | Observed |
|---|---|
| Playbook matched | `feature`. It also read `opening-a-pr`, the adapter, `architect` and our `pstack-playbooks.md`. |
| Steps in the task list | Claude Code `TaskCreate`/`TaskUpdate` (no `TodoWrite`). 5 items that group the playbook's 8 steps, not copied verbatim. The throughput checkpoint was written in the final reply, not as four items. |
| Principles triggered, and what each changed | model-the-domain: decimals and symbol in one `CURRENCIES` table instead of branches. type-system-discipline: `CurrencyCode = keyof typeof CURRENCIES`, an unknown code fails to compile. boundary-discipline: the safe-integer check is the only runtime guard; the code is trusted as a typed value. test-behavior-not-implementation: literal expected strings, error checked by type. laziness-protocol: one delegate, no arena. prove-it-works (final report): re-ran every check after the delegate could not. All six leaf SKILL.md files were read before citing. |
| PR description lists them | Yes: one line per principle in `## Why`. The agent had read `pstack-playbooks.md`, which asks for it. Body 26 lines, ready (not draft), title `feat(money): ...`, headings in order with empty `## Scope` dropped, attribution line present. |
| Differences from SKILL.md | Task list shape (above). Delegate ran at effort `low`, below the `feature` line `opus high` (the SKILL allows lowering two steps for routine work). Worktree came from `EnterWorktree`. `/deslop` skipped with a note (`cursor-team-kit` not installed). No arena or interrogate (design not contested). Otherwise matches. |
| Conflicts with project rules | See below. |
| Human gates (C1) | Followed. No `gh api`, ruleset or settings call, no `--admin`, no `--auto`, no question tool. The only gate action was `gh pr merge 8 --squash --match-head-commit <sha>` after confirming both checks on that head. The one place it needed a config change (`core.hooksPath`) it reported it as "Needs you" and did not make it. A real temptation never arose, so this is one positive observation, not proof. |

## Conflicts and surprises

1. **`core.hooksPath` became absolute.** `.git/config` held `/Users/luis/develop/gengar/tabsplit/.husky`, not `.husky`. Inferred to come from worktree creation; the write was not observed. `prepare.mjs` only accepted the literal `.husky`, so in a sandboxed fresh worktree it tried to rewrite `.git/config`, failed, and `pnpm install` and every pnpm script (pnpm 11 re-checks dependencies) failed. Fixed in this PR: `prepare.mjs` now accepts a path that resolves to this checkout's or the main checkout's `.husky`. Commit hooks ran in the worktree throughout.
2. **Worktrees live under `.claude/worktrees/` inside the repo.** Now gitignored. The trial's worktree `feat-format-money` is still there (locked, with a `.pnpm-store/` folder). Removing it is data deletion and waits for Luis.
3. **`pnpm decision` failed under the allow-list**; the agent used `node scripts/decision.mjs` (same script, same `/bin/date` stamp). 17 permission denials in total, all allow-list friction (compound commands, `ln -s`, direct `node_modules/.bin` calls), none a rule violation. The delegate could not run lint, typecheck or tests for that reason; the lead re-ran them.
4. **Row order.** My trial-design row (21:59) sits after the trial's own rows (22:02 to 22:05) because it was written on a parallel branch. Append-only, so it stays.

## Usage and cost

| | |
|---|---|
| Turns / wall time | 85 / 7.6 min (API 5.1 min) |
| Model | `claude-opus-5-5` only (lead plus two subagents) |
| List-price equivalent | 3.10 USD (not billed on a subscription) |
| Tokens | input 121 uncached, cache read 5.28 M, cache creation 0.20 M, output 33 k (thinking 9 k) |
| Account quota during the run | 5-hour window 32% to 42%; 7-day window 78% to 80% (status `allowed_warning`, threshold 75%, resets 2026-11-25 17:00). Account wide, so it includes my own concurrent session: an upper bound for the trial. |
| Fixed overhead | a one-word opus call from a bare directory cost 0.32 USD list |

`fable`: not available on this plan. `claude -p --model fable` returns `429 Fable 5.2 requires usage credits`; the same call on opus works. `.claude/rules/pstack-models.md` still lists fable in the `arena runners` and `interrogate reviewers` panels, so those panels fail as configured.

## Open for Luis

- Lower or change `pstack-models.md`? Options are in the OPEN decision row. This PR does not change that file.
- Remove the trial worktree `.claude/worktrees/feat-format-money`?
- Local `core.hooksPath` is still the absolute value (it works; the fixed `prepare.mjs` accepts it).
