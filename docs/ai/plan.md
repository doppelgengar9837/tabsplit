# tabsplit plan (condensed)

Condensed from the bootstrap plan v2 (2026-11-22). If this differs from the Claude Project version, the Project version wins.

## Goal
The real product is the *environment*: an agentic, pstack-style setup with verification, harness, automation and management from day one. tabsplit (a small bill-splitting tool) is only the carrier.
Success = "can go to sleep": queue tasks, wake up to merged / awaiting async approval / stopped-with-reason. Never "stuck waiting for me".

## Principles
1. Environment before product; keep features thin until verification and guardrails can stop bad changes.
2. Everything lives in the repo: plan, state, decisions, rules, skills.
3. Reproduce pstack by default; every deviation gets a decisions row with a reason. Our own additions are labelled "our design, not pstack".
4. Three identities kept apart: human (approve), admin (configure), bot (agent). The agent's environment can never hold the first two.
5. Human gates are asynchronous and never block the queue.
6. Fix failures in the harness, not only in the output (architecture > deterministic check > skill/rule > human reading a diff).

## Phases and gates
| Phase | Content | Gate |
|---|---|---|
| 0 | develop/ layout, per-folder account isolation | Done (phase0.sh verify 8/8) |
| 1 | Repo + walking skeleton, CI, ruleset, AGENTS.md, docs/ai | Empty change completes branch -> PR -> CI green -> merge; plan, state, decisions in repo |
| 1.5 | Hardening: hooks wired through tracked .husky, decision-timing rule, branch cleanup | Done 2026-11-22 (PR #3) |
| 2 | Install and reconstruct pstack (read first, pin commit, playbook checklist, trial run) | **Done 2026-11-22.** Checklist confirmed by Luis; each deviation recorded; trial matches SKILL.md apart from the recorded differences |
| 3a | Verification ladder L0 lint/type, L1 unit + property, L2 browser journey; `pnpm verify` and CI `verify` (verdict on the PR head SHA); seeded-bug set (10), written only after the ladder is complete; Feature Map and `maintain-verification-skill`; reproducibility; cold start | 10/10 seeded bugs caught; same-commit reports identical apart from timestamps; map drift detected without editing docs to hide a bug; a fresh session verifies main from the repo skill alone |
| 3b | L3 smoke against a preview deployment (Vercel, wired by Luis) | smoke passes; Vercel deployment protection tested against the verifier. May follow 3a but must finish before Phase 4 |
| 4 | Guardrails and bot identity (GitHub App, CODEOWNERS, suppression ratchet, tiers, budget, halt) | Bot can open PRs; cannot touch ruleset, approve own PR, push main, or read secrets |
| 5 | Issue queue and autopilot | 4 of 5 consecutive tasks reach mergeable; failures stop with reason |
| 6 | Overnight tests, queue 1 -> 3 -> 8 -> 15 | 3 consecutive nights; morning report readable in 5 min |
| 7 | Maintenance and feedback | — |

## Scope
Pure client, localStorage, no accounts or backend. Money = integer minor units. Time and randomness via injectable Clock.
Domain: members, expenses (payer, amount, participants, split mode), settlement (net balances; transfers that number at most one fewer than the members with a non-zero net, and leave every net at zero; global minimality is not guaranteed because it is NP-hard).
Not doing: accounts, cloud sync, payments, live exchange rates.
Tiers (our design): docs/style = Tier 0; features/fixes = Tier 1; dependencies, CI, verifier, deploy config, import/export schema = Tier 2.

## Human-is-not-a-blocker protocol
Agent never waits for an answer: choose a reasoned default, record it with rollback, continue; mark `blocked` only if truly stuck and move on. Human gates: Tier 2 PR approval, morning sampling, `halt` switch. Same failure past the retry cap -> stop and leave diagnostics. Every human intervention gets a reason code.

## Phase 3 limits (quota first)
Main session on Sonnet; opus only for judgment and review; subagents per `.claude/rules/pstack-models.md`. Anything that can be a deterministic script (seeds, CI, journeys, reproducibility) is a script, not an LLM loop. One task, one PR, one session, with an explicit spec. Stop when the weekly window passes 90% or the 5-hour window is used up: mark `paused-quota` and the next step in `state.md`. Record the measured cost and quota change at the end of every PR.

## Current status
Phase 2 is done; Phase 3a is in progress. Details and open items: `state.md`.
