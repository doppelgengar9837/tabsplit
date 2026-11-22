#!/usr/bin/env node
// Runs on `pnpm install` (the `prepare` lifecycle script).
// Points git at the tracked .husky directory so hooks exist the moment a clone or worktree
// is checked out. core.hooksPath is stored in the shared git config and a relative path is
// resolved against each worktree's top level, so every worktree uses its own .husky.
import { execFileSync } from "node:child_process";

const HOOKS_PATH = ".husky";
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

try {
  if (git("rev-parse", "--is-inside-work-tree") !== "true") process.exit(0);
} catch {
  process.exit(0); // not a git checkout (tarball, container build): nothing to wire up
}

let current = "";
try {
  current = git("config", "--get", "core.hooksPath");
} catch {
  // unset
}
if (current === HOOKS_PATH) process.exit(0); // already wired; avoid needless config writes

try {
  git("config", "core.hooksPath", HOOKS_PATH);
  console.log(`prepare: core.hooksPath set to ${HOOKS_PATH}`);
} catch (err) {
  console.error(`prepare: FAILED to set core.hooksPath to ${HOOKS_PATH}; git hooks will not run.\n${err.stderr ?? err}`);
  process.exit(1);
}
