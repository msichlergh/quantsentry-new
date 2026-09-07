// Minimal .env reader for the standalone scripts in this directory.
//
// Next.js loads .env files itself, but these scripts run under plain `node`
// with no framework around them. Adding a dotenv dependency for ~30 lines of
// parsing is not worth it.
//
// Precedence matches Next.js: .env.local wins over .env, and anything already
// in the real environment wins over both.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const FILES = [".env", ".env.local"];

export function loadEnvFiles(root = process.cwd()) {
  const loaded = [];
  for (const file of FILES) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    loaded.push(file);
    for (const [key, value] of parse(readFileSync(path, "utf8"))) {
      // Real environment always wins, so `GHL_API_TOKEN=... node script` works.
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
  return loaded;
}

function parse(text) {
  const out = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length > 1) {
      value = value.slice(1, -1);
    }
    out.push([key, value]);
  }
  return out;
}

// Never print a credential. This is the only representation of a secret any
// script in here is allowed to emit.
export function describe(name, { secret = false } = {}) {
  const value = process.env[name];
  if (value === undefined || value === "") return { name, set: false, hint: "MISSING" };
  return { name, set: true, hint: secret ? `set (${value.length} chars)` : value };
}
