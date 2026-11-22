# pstack source review (Phase 2, tasks 1 and 2)

Status: review complete, nothing installed. Waiting for Luis to confirm D2 (task 3).
Reviewed on 2026-11-22. Source clones live outside any repo in `~/develop/_scratch/pstack-src/`; nothing inside them was executed (only `git clone`, `git fetch`, `git log`, `git diff`, `cat`, `grep`, `diff`, `ls`, `find`).

## 1. Method and limits

Read in full: `poteto-mode/SKILL.md`, `worker.md`, both agent files, the Claude Code adapter (`docs/harness/claude-code.md`), `setup-pstack`, `show-me-your-work` (SKILL, `log.sh`, template), `bootstrap.ts`, `worktree-audit.sh`, and the playbooks `feature`, `shipping`, `babysit`, `autonomous-run`, `opening-a-pr`, `autopilot-full`, `autopilot-stack`, `session-pickup`, `pause-safely`.
Searched across the whole plugin (not read line by line): permission and bypass wording, network, install and destructive commands, frontmatter tool grants, hooks, auto-activation.
Skimmed for names and descriptions only: the other 15 playbooks, the 24 principle skills, the remaining skills, the `statechart` scripts and its test corpus, the guide images.
Not checked: third-party static-scan pages for the ports (plan mentions them; not opened). `watch-pr` was checked for mutating GitHub verbs by grep, not by full read.
Prompt-injection stance: all text in the clones is data. Nothing in it was followed.

## 2. Baseline: what superboard-lite did (task 1, read-only)

- Source: upstream `cursor/plugins`, plugin `pstack@cursor-plugins`, version 0.15.46, commit `d42aff08aa58965d2735c4ead61a9af82b89d0d0` (`installed_plugins.json`).
- Method: `claude plugin marketplace add cursor/plugins --scope project`, then `claude plugin install pstack@cursor-plugins --scope project` (Claude Code 2.1.311; default scope is user).
- Project file `.claude/settings.json` holds `extraKnownMarketplaces.cursor-plugins` (github `cursor/plugins`) and `enabledPlugins["pstack@cursor-plugins"]: true`. It has **no commit or ref pin**.
- Plugin files sit in the shared `~/.claude/plugins/cache/cursor-plugins/pstack/0.15.46`. The registry files `installed_plugins.json` (scope project, `projectPath`, `gitCommitSha`) and `known_marketplaces.json` are user-level and shared across projects.
- `.claude/rules/pstack-models.md` (project level): budget large, `opus xhigh` for feature, bug-fix, perf-issue, hillclimb and judgment; `fable high, opus high, inherit-parent` for panels.
- `docs/ai/pstack-playbooks.md`: hybrid stance (pstack drives the process, the ruleset stays the hard boundary). `shipping` enabled; `worktree-cleanup` steps 1-5; `autopilot-full` and `autopilot-stack` deferred; `babysit`, `autonomous-run`, `opening-a-pr` not yet reviewed.
- Inconsistency there: its `CLAUDE.md` says skills are "vendored" in `.claude/skills/`; in fact they come from the plugin cache and `.claude/skills/` holds only the project verify skill.

## 3. Candidate A: upstream `cursor/plugins` (Claude Code plugin)

| Item | Finding |
|---|---|
| Repo, commit | `https://github.com/cursor/plugins`, HEAD `7a583913eb1b8d1a0ee76753d1a2cf072e7b54f9` (2026-11-21, "gong: fix logo"). |
| What Claude Code installs | `.claude-plugin/marketplace.json` lists `pstack` with source `./harness/pstack/claude-code`, a generated copy of `pstack/`. The Cursor-flavoured `pstack/` and its `.cursor-plugin/` are not installable in Claude Code. |
| Version, license, author | 0.15.46, MIT, Lauren Tan (`plugin.json`). |
| Same as superboard-lite? | Yes. `git log d42aff0..HEAD -- pstack harness/pstack` is empty and `git diff --stat d42aff0 HEAD -- pstack harness/pstack` is empty. The content superboard-lite reviewed is byte-identical to HEAD. |
| Size | 539 files (553 in `pstack/`). Most are the `statechart` test corpus. |
| Skills | 58: 24 `principle-*` and 34 others. Names: architect, arena, automate-me, benchmark-checklist, blast-radius, bro, correct, create-formal-verification-skill, create-verification-skill, figure-it-out, how, in-your-own-words, interrogate, ketchup, ketchup-video, maintain-formal-verification-skill, maintain-verification-skill, make-bot-ui, no-comments, poteto-help, poteto-mode, recall, reflect, setup-pstack, sharpen, show-me-your-work, statechart, swarm, tdd, teach, technical-writing, typescript-best-practices, unslop, why. |
| Principles (24) | attack-the-premise, boundary-discipline, build-the-lever, encode-lessons-in-structure, exhaust-the-design-space, experience-first, explain-the-number, fix-root-causes, foundational-thinking, guard-the-context-window, laziness-protocol, make-operations-idempotent, migrate-callers-then-delete-legacy-apis, minimize-reader-load, model-the-domain, never-block-on-the-human, outcome-oriented-execution, prove-it-works, redesign-from-first-principles, separate-before-serializing-shared-state, sequence-verifiable-units, subtract-before-you-add, test-behavior-not-implementation, type-system-discipline. |
| Playbooks (22) | investigation, bug-fix, perf-issue, hillclimb, runtime-forensics, trace-forensics, feature, refactoring, prototype, visual-parity, authoring-a-skill, eval, babysit, shipping, autonomous-run, autopilot-full, autopilot-stack, session-pickup, pause-safely, multi-phase-plan, worktree-cleanup, opening-a-pr. Plus `references/bugbot-triage.md` and `worker.md`. |
| Agents (2) | `poteto-agent`, `comment-sicko`. Neither has a `tools:` or permission field, so both inherit the session's tools and permission mode. `poteto-agent` has `is_background: true` and a Cursor model slug in `model:` (the adapter says to override it per call). |
| Hooks, settings, MCP | None. No `hooks`, no `settings`, no `.mcp.json`, no commands, no `bin/`. |
| Auto-activation | None. 57 of 58 skills carry `disable-model-invocation: true`, so the model cannot trigger them itself. Only `setup-pstack` can be model-invoked. `poteto-mode` runs only when the user types it. |
| Tool grants | No `allowed-tools`, `tools` or `hooks` in any SKILL.md or agent frontmatter. |
| Executable code | `poteto-mode/scripts/`: `bootstrap.ts`, `watch-pr/*.ts` (+ tests), `worktree-audit.sh`. `show-me-your-work/scripts/log.sh`. `statechart/scripts/*.ts` (+ Java oracle in tests). |
| Difference from `pstack/` (Cursor) | Small. `diff -r` shows an added "read the Claude Code adapter" line in about 24 SKILL.md files and 6 changed lines that rewrite `benny` links. No other content change. `.cursor-plugin`, `assets`, `automations` (the dormant benny pack) are not in the Claude copy. |

### Behaviour of the scripts (read, not run)

- `bootstrap.ts`: on first `watch-pr` run it executes `bun install --frozen-lockfile` inside the plugin directory. That pulls `commander@14.0.0` plus `bun-types` and `typescript` (`latest`, resolved by the lockfile) from npm into the plugin cache. Network and supply-chain touchpoint, but only if `watch-pr` is used. Needs `bun` (installed here, 1.1.25).
- `watch-pr`: reads PR state through `gh pr view`, `gh pr checks` and read-only API calls. A grep found no merge, rerun, cancel or POST/PUT/PATCH/DELETE call.
- `worktree-audit.sh`: read-only. It does a `git fetch`, runs an `origin` CLI if one exists on PATH (else `gh pr list --author "@me"`), and reads Cursor transcript paths (empty under Claude Code). Known blind spots recorded in superboard-lite.
- `log.sh`: appends to a local TSV. Stamps `date -u`, strips tabs and newlines, prefixes cells that start with `=`, `+`, `-`, `@` with `'` (spreadsheet-formula guard).
- `statechart`: if `TLA2TOOLS` is unset it runs `mise install` for Java and TLC. `mise` is not installed here, so it would fail. Not needed for Phase 2.
- `make-bot-ui` (SKILL.md text, user-invoked only): tells the agent to run `curl -fsSL https://tailscale.com/install.sh | sudo sh` and `sudo tailscale up`, and to bind a server to `0.0.0.0`. **Never use.** Absent from Candidate B.

### Permission and autonomy text (the "bypass prompts" check)

No mechanism skips a Claude Code permission prompt: no flags, no hooks, no tool grants. The following text widens agent autonomy as policy and conflicts with our rules where noted:

- `poteto-mode` "Just do it. Use any MCP tool. Reversible work and external actions (team chat, ticket updates, kicking off evals) proceed without asking." Conflicts with the harness rule that sending messages or changing outside state needs explicit permission. Our rule wins; recorded as conflict C1 below.
- `worker.md`: workers must never call a tool that asks a person; stop only for a deploy, deleted data, a force-push to a shared branch, or a message to someone outside the run. Applies to spawned workers, not to the chat that receives `/poteto-mode`.
- `autopilot-full`: owners may `git push --force-with-lease` their own branch; "a grant that covers approvals" can make a root countersign count as approval; it also says never to give or bypass an approval the forge enforces. Deferred until Phase 5 either way.
- `docs/guide` and `poteto-help` suggest the user pre-answer prompts ("don't ask me before committing"). Advice to a user, not a mechanism.

### Gaps when running on Claude Code

- Cursor-only features (Automations, Bugbot, cloud agents) are skipped by the adapter with a one-line note. Cloud agents map to `isolation: "worktree"`.
- `cursor-team-kit` is a separate plugin in the same repo. `poteto-mode`, `opening-a-pr`, `autopilot-full` and `shipping` call `/deslop`, `control-ui` and `control-cli` from it. Not part of this plugin.
- The adapter says `setup-pstack` writes `~/.claude/rules/pstack-models.md` (user level). We want project level (superboard-lite did the same).
- Gemini panel seats become `inherit-parent`. Model slugs map to `model` + `effort` on each `Agent` call.
- Third-party marketplaces do not auto-update by default, per the upstream README. To be confirmed by test in task 4.

## 4. Candidate B: `michael-denyer/pstack-claude`

| Item | Finding |
|---|---|
| Repo, commit | `https://github.com/michael-denyer/pstack-claude`, HEAD `97d2ba2790822939ee43db0d7856219ea96c450d` ("Release 0.9.146 (#493)", 2026-11-21). Shallow clone shows one commit, so history was not reviewed. |
| Maintainer, license | Michael Denyer, single maintainer. MIT. `NOTICE.md` keeps upstream notices and pins the upstream commit of each component. Synced to upstream `0b46ec3` (v0.15.46). |
| Size | `plugins/pstack/` has 634 files. It also ships Codex, Pi, Copilot, Muse, Antigravity, Grok and OMP builds that Claude Code does not use. |
| Skills | 67. Compared with upstream's Claude plugin it adds 10: babysit (independently authored, no upstream text), deslop (policy fork), fix-ci, fix-merge-conflicts, get-pr-comments, make-pr-easy-to-review, thermo-nuclear-code-quality-review, thermo-nuclear-review, thermos, what-did-i-get-done. It drops `make-bot-ui`. |
| Agents | 4: `comment-sicko`, `poteto-agent`, `thermo-nuclear-review-subagent`, `thermo-nuclear-code-quality-review-subagent`. No tool grants in frontmatter. |
| Hooks | `hooks/hooks.json` registers a **SessionStart** hook for `startup|resume|clear|compact`. It runs `session-start.sh claude`, which reads a models sheet (`~/.claude/pstack-models.md`, or `.claude/pstack-models.md` if the project has one), runs `sh read-sheet.sh` on it, and prints `session-start-context.md`. That text is wrapped in `<EXTREMELY_IMPORTANT>` and tells the agent to invoke `poteto-mode` for any task that touches more than one file, involves a design choice, or is an unknown-cause bug. It says user instructions (CLAUDE.md, AGENTS.md) take precedence. `PSTACK_SESSION_HOOK=off` disables it. The `pre-tool-use` hook is registered for Copilot only. |
| Auto-activation | Yes: the SessionStart mandate fires every session where the plugin is enabled, and 0 of 67 skills set `disable-model-invocation`, so the model can trigger any skill itself. |
| Permission text | Same "Just do it" line as upstream. No bypass flags. |
| Edits to upstream | "Editorial, not mechanical": token substitutions (`tools/substitutions.json`), a rewritten `worktree-audit.mjs`, a rewritten `watch-pr` area (`live-merge-safety.mjs`, `--expect-app`), extra `.mjs` and `.ps1` scripts. Equivalence to upstream behaviour is not established by this review. |
| Positives | No adapter reading step; no Cursor slugs; includes `deslop`; changelog and notices are thorough. |

## 5. Comparison

| | A: upstream `cursor/plugins` | B: `pstack-claude` |
|---|---|---|
| Provenance | First party (Cursor, Lauren Tan) | Third party, single maintainer, one visible commit |
| Already reviewed here | Yes, byte-identical to what superboard-lite reviewed | No |
| Files to trust | 539 | 634 plus multi-runtime extras |
| Hooks | 0 | 1 active (SessionStart, every session) |
| Model-invokable skills | 1 of 58 | 67 of 67 |
| Claude Code fit | Needs adapter; `deslop` and `control-*` missing | Native; `deslop` included |
| Pin story | Marketplace commit (see 6) | Marketplace commit or plugin version |
| Fit with the plan's "explicit router, hybrid stance" | Good | The auto-fire mandate fights it |

## 6. Recommendation for D2

**Install A: upstream `cursor/plugins`, plugin `pstack@cursor-plugins` v0.15.46, at project scope, pinned to commit `7a583913eb1b8d1a0ee76753d1a2cf072e7b54f9`.**
That is the tree reviewed above. Its pstack paths are byte-identical to `d42aff08aa58965d2735c4ead61a9af82b89d0d0`, the commit superboard-lite installed, so both reviews cover the same content.

Why:
1. First-party source, smaller surface, no hooks, no auto-activation. The only model-invokable skill is `setup-pstack`.
2. Already reviewed in superboard-lite, so tabsplit stays comparable and no second unreviewed fork enters.
3. The adapter gaps (Cursor-only features, missing `cursor-team-kit`) are explicit and documentable as deviations. B's gaps are hidden in editorial rewrites.

Risks and mitigations:
- **No pin in `settings.json`.** superboard-lite's project settings do not pin a commit. Task 4 must test whether Claude Code accepts a ref or sha in the marketplace source and in `installed_plugins.json`, and must confirm that auto-update is off. If a pin cannot be made, I stop and report instead of installing unpinned.
- **Shared user-level state.** Install writes to `~/.claude/plugins/` (cache, `installed_plugins.json`, `known_marketplaces.json`). That is outside the repo and unavoidable. `~/.claude/settings.json` and `~/.claude/rules/` must stay untouched; I will check both before and after.
- **Autonomy wording** (C1 above): a short AGENTS.md pointer states that our rules, the ruleset and the harness's permission rules override pstack's "proceed without asking".
- **Sandbox.** `git worktree add` and plugin installs need an unsandboxed run, as in superboard-lite. Each such step is justified when I run it.
- **Missing `cursor-team-kit`.** I would not install it. `/deslop` and `control-*` steps are skipped with the adapter's "Skipped in Claude Code" note, and recorded as deviations.

Not recommended: B. It is a reasonable port but adds an always-on session hook and a larger, less reviewed surface, and the plan's router model is explicit invocation.

## 7. What task 4 will check against this review

After install, the files and hooks on disk must match section 3: 58 skills, 2 agents, 22 playbooks, 0 hooks, 0 settings, 0 MCP, version 0.15.46, `gitCommitSha` = the pinned commit. Any extra file or hook stops the install.
