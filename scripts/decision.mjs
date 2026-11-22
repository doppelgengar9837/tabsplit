#!/usr/bin/env node
// Append one row to docs/ai/decisions.tsv.
// The timestamp always comes from the system clock via /bin/date; it can never be passed in.
// Usage: pnpm decision <phase> <decision> <why> <evidence> <result>
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "ai", "decisions.tsv");
const HEADER = ["time", "phase", "decision", "why", "evidence", "result"];

const args = process.argv.slice(2);
if (args.length !== HEADER.length - 1) {
  console.error(`usage: pnpm decision <phase> <decision> <why> <evidence> <result>  (got ${args.length} args, need ${HEADER.length - 1})`);
  process.exit(2);
}

const time = execFileSync("/bin/date", ["+%Y-%m-%dT%H:%M:%S%z"], { encoding: "utf8" }).trim();
const clean = (s) => s.replace(/[\t\r\n]+/g, " ").trim();
const row = [time, ...args].map(clean);

if (!existsSync(FILE)) writeFileSync(FILE, HEADER.join("\t") + "\n");
appendFileSync(FILE, row.join("\t") + "\n");
console.log(row.join(" | "));
