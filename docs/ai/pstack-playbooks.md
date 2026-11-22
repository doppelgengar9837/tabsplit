# pstack playbooks: restoration checklist

Status: confirmed by Luis on 2026-11-22 (Phase 2 gate 1). Trial run results: `docs/ai/pstack-trial-run.md`. Source: `docs/ai/pstack-source-review.md`.
Installed: `pstack@cursor-plugins` 0.15.46, project scope, marketplace pinned to upstream `7a583913eb1b8d1a0ee76753d1a2cf072e7b54f9`.
Rows in `docs/ai/decisions.tsv` (phase 2) hold the reason and rollback for every deviation named here.

## 1. Stance (this is our design, not pstack)

pstack drives the process. `AGENTS.md`, the ruleset and the phase gates are the hard boundary and win every conflict.
pstack's gates are prose that rely on agent discipline. Where GitHub can enforce a rule, GitHub enforces it.
Honest limit until Phase 4: the ruleset does not stop the admin account from squash-merging a green PR, so "merging is a human gate" is enforced by `AGENTS.md` text only. The first trial run checks that the text is followed.

## 2. How to start it here

- Type `/pstack:poteto-mode <goal>`. Every pstack skill except `setup-pstack` is slash-command only (`disable-model-invocation: true`), so nothing fires on its own and there is no hook.
- Needs Claude Code 2.1.324 or newer (the pin is a commit SHA). The `claude` on PATH may be older; the desktop app ships 2.1.330.
- A session started before the install does not have the skills. Then read `<plugin>/skills/<name>/SKILL.md` and follow it, as `docs/harness/claude-code.md` says. `<plugin>` is `~/.claude/plugins/cache/cursor-plugins/pstack/0.15.46`.
- Read `docs/harness/claude-code.md` (the Cursor-to-Claude-Code adapter) once per session before following any pstack skill.

## 3. Router: how `/poteto-mode` works

1. **Restate** the goal and the smallest change that meets it. Open every subagent brief, PR `## Why` and the final report with the goal.
2. **Match** the task to one playbook and open `playbooks/<title>.md` (title in kebab case). Copy its steps into the task list first. In this app the task list is `update_plan` (adapter says `TodoWrite`; see decisions). Large, cross-cutting or unattended work, or a task no playbook fits, goes to the `figure-it-out` skill.
3. **Delegate** per the playbook. Spawn `pstack:poteto-agent` for code-writing delegates. The first line of every kickoff is `Read <skill folder>/worker.md before anything else.` Pass `model` and `effort` on every `Agent` call from `.claude/rules/pstack-models.md`. Defaults: background, file pointers instead of inlined context, a fresh subagent for each fix round.
4. **Route** to other skills as triggers fire:

| Trigger | Skill |
|---|---|
| Code: name the data shape first. Crossing a function boundary | `architect` |
| Fan-out / bakeoff / contested design | `swarm` / `arena` / `interrogate` |
| Prose, replies | `unslop`. Docs, PR text, commit messages: `technical-writing` |
| Before commit | `/deslop` (not installed: skipped with a note) |
| Before review | `no-comments` |
| A measured number | `benchmark-checklist` |
| Shipping UI/CLI | `control-ui` / `control-cli` (not installed: skipped with a note) |
| PR status / landing a stack | `babysit` / `shipping` (both deferred, section 5) |
| Long or unattended work | `show-me-your-work` (we use `pnpm decision`, section 7(b)) |

5. **End** with the `opening-a-pr` playbook: ready (not draft) PR, title `type(scope): subject`, body under 40 lines with `## Why`, `## What changed`, `## Scope`, `## Tradeoffs`, `## Blast Radius`, `## Verification` (empty ones dropped).

Reply style from pstack: short declarative sentences, no long dash, no colon as a connector, evidence or a label (measured, inferred, guess) on each claim, never hand the human a check you could run.

## 4. Principles (24)

Rule: read the leaf `principle-<name>` SKILL.md in full before applying a principle. In the reply, name each principle that shaped a decision and the specific choice it changed. Cite only principles whose leaf you read this session. A principle that changed nothing is not cited.
Our addition (our design): the PR `## Why` carries one line per cited principle, `name -> what it changed`.

| Group | Principle | Apply when |
|---|---|---|
| Core | laziness-protocol | sizing a diff, tempted to add layers. Bias to deletion |
| | foundational-thinking | before logic: core types, scaffold vs feature, shared state |
| | redesign-from-first-principles | integrating a new requirement into an existing design |
| | attack-the-premise | two fixes that share a premise both failed the same gate |
| | subtract-before-you-add | sequencing an addition or rewrite: remove dead weight first |
| | minimize-reader-load | code that is hard to trace: count layers, collapse wrappers |
| | outcome-oriented-execution | planned rewrites with explicit phase boundaries |
| | experience-first | product or UX tradeoffs |
| | exhaust-the-design-space | a novel decision with no precedent: 2-3 prototypes |
| | build-the-lever | any non-trivial work: build the tool that does or proves it |
| Architecture | model-the-domain | stateful or branching logic: encode it in a structure |
| | boundary-discipline | validation and error handling at system boundaries only |
| | type-system-discipline | designing types: illegal states unrepresentable, parse at boundaries |
| | make-operations-idempotent | commands and loops that run amid crashes and retries |
| | migrate-callers-then-delete-legacy-apis | a new internal API while old callers exist |
| | separate-before-serializing-shared-state | concurrent writers to one file, branch or key |
| Verification | prove-it-works | before declaring done: verify the real artifact |
| | fix-root-causes | debugging: trace back to the first wrong place |
| | sequence-verifiable-units | multi-step work and how commits and PRs stack |
| | test-behavior-not-implementation | writing or changing a test |
| | explain-the-number | before trusting a measured number |
| Delegation | guard-the-context-window | large outputs: route bulk to subagents |
| | never-block-on-the-human | tempted to ask on reversible work: proceed, present, let them correct |
| Meta | encode-lessons-in-structure | writing the same instruction twice: make it a lint, check or script |

`never-block-on-the-human` matches our protocol. Where it meets a human gate, section 7 (C1) decides.

## 5. Playbooks (22) and status

"Read" means I read it in full in Phase 2. Anything not read is read before its first use.

| Playbook | Status | Conditions |
|---|---|---|
| `investigation` | available, read | read-only; no PR |
| `bug-fix` | available, read | the control surface is our verify skill from Phase 3. Until then proof is unit tests plus a manual check, and "inconclusive" is reported as such. Cursor `/loop` = Claude Code `/loop` |
| `feature` | available, read | mandates delegating code-writing to a subagent and `arena` when several shapes are valid. Expensive for tiny tasks. Trial: one `pstack:poteto-agent` at effort low, no arena, about 3.10 USD list price (details in `pstack-trial-run.md`) |
| `refactoring` | available, read | pin behavior first |
| `prototype` | available, read | throwaway work goes in a scratch dir outside the repo |
| `multi-phase-plan` | available, read | the plan is the deliverable; execution starts on an explicit go |
| `session-pickup` | available, read | transcripts live at `~/.claude/projects/<slug>/<session>.jsonl`; read only this workspace's folder |
| `pause-safely` | available, read | `wip:` commits become `chore(wip):` (commitlint) |
| `opening-a-pr` | available with notes, read | `/deslop` skipped; PR body format as in section 3; our attribution line goes at the end; sandboxed sessions need an unsandboxed run for `git worktree add` |
| `worktree-cleanup` | steps 1-5 only, read | step 5 deletes data: needs Luis's explicit go for each pass. Step 6 (simulators, Xcode, caches) is banned. The audit script reads Cursor transcript paths (empty here) and uses `gh pr list --author "@me"` (the active gh account) |
| `hillclimb`, `runtime-forensics`, `trace-forensics`, `visual-parity`, `eval`, `authoring-a-skill` | available by default, not read | read before first use |
| `shipping` | **deferred** | needs the Phase 3 verifier as a required check, and merging is a human gate. Step 5 needs `watch-pr` (banned). Verdicts are PR comments, which our design replaces with a required status check on the head SHA |
| `babysit` | **deferred** | status comes from `watch-pr` (banned). Manual `gh pr checks` is not this playbook |
| `autonomous-run` | **deferred to Phase 5** | needs the exit-predicate and wake mechanism design; uses `/loop` and `show-me-your-work` |
| `autopilot-full`, `autopilot-stack` | **Phase 5, not before Phase 4** | needs the bot identity and guardrails. They use `git push --force-with-lease` on own branches, swarm verifiers, and a grant mode where a countersign counts as approval: do not use the grant mode. Merge stays a human gate |

## 6. Skills, subagents, bans

- **Skills (58):** 24 principles plus 34 others: architect, arena, automate-me, benchmark-checklist, blast-radius, bro, correct, create-formal-verification-skill, create-verification-skill, figure-it-out, how, in-your-own-words, interrogate, ketchup, ketchup-video, maintain-formal-verification-skill, maintain-verification-skill, make-bot-ui, no-comments, poteto-help, poteto-mode, recall, reflect, setup-pstack, sharpen, show-me-your-work, statechart, swarm, tdd, teach, technical-writing, typescript-best-practices, unslop, why. Phase 3 uses `create-verification-skill` and `maintain-verification-skill`.
- **Subagents (2):** `pstack:poteto-agent` (delegate; no tool limits, so it inherits the session's tools and permissions; its frontmatter holds a Cursor model slug, so always pass `model` and `effort`) and `pstack:comment-sicko` (reports comments to delete; never writes application code).
- **Models:** `.claude/rules/pstack-models.md`, budget medium. Panels (`arena`, `interrogate`) fan out three agents each: avoid them for small tasks. `fable` seats return 429 on this plan (needs usage credits), so the panels fail as configured until Luis decides what to change.
- **Banned:**
  - `make-bot-ui`: runs `curl -fsSL ... | sudo sh`, `sudo tailscale up`, and binds a server to `0.0.0.0`.
  - `watch-pr` (and so `babysit`, `shipping` step 5, autopilot): its first run does a network `bun install` in the plugin directory. Needs its own review before Phase 5.
  - `statechart`: runs `mise install` for Java and TLC when they are missing.
  - `setup-pstack` writing `~/.claude/rules/`: the project file is the only one we use.
  - Anything that needs `cursor-team-kit` (`/deslop`, `control-ui`, `control-cli`): skipped with the adapter's "Skipped in Claude Code" line.
- **Cursor-only features** (Automations, Bugbot, cloud agents) are skipped by the adapter. Cloud agents map to `isolation: "worktree"`.

## 7. Compatibility with project rules

### (a) Does `poteto-mode` conflict with, or take control from, our rules?

It cannot take control by itself: no hook, no auto-activation, and it runs only when typed. Inside a run it does set its own rules, and it meets ours in these places:

| # | pstack says | Our rule | Resolution |
|---|---|---|---|
| C1 | Autonomy: "Just do it. Use any MCP tool. Reversible work and external actions proceed without asking." `worker.md`: never ask a person | `AGENTS.md` human gates: merge, approve, ruleset or settings change, publish, spend, credentials | `AGENTS.md` section "Human gates (these override pstack)": do not do it, do not ask, mark `blocked` in `state.md` naming the human gate, move to the next independent task. **Trial run must show this was followed** |
| C2 | `pause-safely`: commit as `wip:` | commit-msg hook (Conventional Commits) rejects `wip:` | use `chore(wip):` |
| C3 | `show-me-your-work`: log at `decisions.tsv` in the work dir, uncommitted, via `log.sh` | `docs/ai/decisions.tsv`, committed, via `pnpm decision` | ours wins; format mapping in 7(b) |
| C4 | `/deslop`, `control-ui`, `control-cli` from `cursor-team-kit` | not installed | skip with a note |
| C5 | "Always pause" for force-push to shared branches, deploys, data deletion, outside messages | block and move on, never stop to ask | ours wins (C1 wording) |
| C6 | `opening-a-pr`: work from a git worktree | hooks work in new worktrees (Phase 1.5) | compatible. Sandboxed sessions need an unsandboxed `git worktree add` |
| C7 | `feature`: delegate code to a subagent, `arena` for several shapes | Claude Pro quota | accepted cost; measured in the trial run |
| C8 | PR title `type(scope): subject`, body under 40 lines with fixed `##` headings, ready not draft | Conventional Commits, PR title check in CI | compatible; scope is optional for us, required by pstack's wording |
| C9 | copy steps into the todolist tool | this app's `update_plan` | mapped |
| C10 | commits: "commit liberally", small ordered commits | pre-commit runs lint and typecheck on every commit | compatible; every commit must pass both |
| C11 | Claude Code worktrees live under `.claude/worktrees/` and appear to set an absolute `core.hooksPath` | `scripts/prepare.mjs` expected the literal `.husky` and failed in a sandboxed worktree | found in the trial; `prepare.mjs` now accepts this or the main checkout's `.husky`; `.claude/worktrees/` is gitignored |

Verdict: no conflict blocks use. C1, C2 and C3 needed explicit rules (added to `AGENTS.md` and recorded). C1 is the one that matters: it is enforced only by text until Phase 4.

### (b) `decisions.tsv` vs `show-me-your-work`

Compared against the real output of the installed `scripts/log.sh` (captured in a scratch file) and our file:

| | `log.sh` | `decisions.tsv` |
|---|---|---|
| Columns | `ts, phase, decision, why, evidence, result` | `time, phase, decision, why, evidence, result` |
| Number and order | 6, same order | 6, same order |
| Time source | `date -u`, `2026-11-22T13:55:54Z` | `/bin/date`, `2026-11-22T21:21:25+0800` |
| Tabs and newlines in cells | replaced by a space | replaced by a space |
| Cell starting with `=`, `+`, `-`, `@` | prefixed with `'` | not guarded (no existing cell starts that way) |
| Location and git | `decisions.tsv` or `.audit/<slug>.tsv`, uncommitted by default | `docs/ai/decisions.tsv`, committed |

Conclusion: the schema is the same, so no new column and no conversion of existing rows. Recorded as a deviation (header `time` vs `ts`, local offset vs UTC, committed path, no formula guard). A pstack reader maps `time` to `ts` and parses the offset. Follow-up candidate: add the formula guard to `scripts/decision.mjs`.
Other `show-me-your-work` rules we keep: append-only (a wrong call gets a superseding row), phase `start` for a run that adds to an existing log, evidence is a pointer, audit the log against the transcript at the end of a run, and an "Attention" section in the final reply. The cross-model review cannot use another vendor here (decision row); substitute a fresh subagent on a different Claude model and say so.

## 8. Open items

- `watch-pr` needs a separate review before Phase 5.
- Plugin cache is user-level and keyed by version: Phase 4 decision (see decisions.tsv).
- The six unread playbooks are read before first use.
- Open for Luis: lower or change `pstack-models.md`; remove the trial worktree. See `state.md`.
