#!/usr/bin/env node
// Runs on `pnpm install` (the `prepare` lifecycle script).
// Points git at the tracked .husky directory so hooks exist the moment a clone or worktree
// is checked out. core.hooksPath is stored in the shared git config and a relative path is
// resolved against each worktree's top level, so every worktree uses its own .husky.
// Something else (seen with Claude Code worktrees) may write an absolute path to the main
// checkout's .husky instead. That also wires the hooks, so it is accepted and left alone:
// rewriting it would need a .git/config write that a sandbox refuses, and install would fail.
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const HOOKS_PATH = ".husky";
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const real = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return null;
  }
};

let top;
let mainTop;
try {
  if (git("rev-parse", "--is-inside-work-tree") !== "true") process.exit(0);
  top = git("rev-parse", "--show-toplevel");
  mainTop = dirname(git("rev-parse", "--path-format=absolute", "--git-common-dir"));
} catch {
  process.exit(0); // not a git checkout (tarball, container build): nothing to wire up
}

let current = "";
try {
  current = git("config", "--get", "core.hooksPath");
} catch {
  // unset
}

const accepted = new Set([join(top, HOOKS_PATH), join(mainTop, HOOKS_PATH)].map(real).filter((p) => p !== null));
const currentReal = current === "" ? null : real(resolve(top, current));
if (currentReal !== null && accepted.has(currentReal)) process.exit(0); // already wired; avoid needless config writes

try {
  git("config", "core.hooksPath", HOOKS_PATH);
  console.log(`prepare: core.hooksPath set to ${HOOKS_PATH}`);
} catch (err) {
  console.error(`prepare: FAILED to set core.hooksPath to ${HOOKS_PATH}; git hooks will not run.\n${err.stderr ?? err}`);
  process.exit(1);
}
