import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { resolve } from "node:path";

let initialized = false;

/** Mirrors Vite loadEnv file order; later files override earlier ones. */
function loadEnvFiles(mode: string, root: string): Record<string, string> {
  const files = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
  const env: Record<string, string> = {};

  for (const file of files) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    try {
      Object.assign(env, parseEnvFile(readFileSync(path, "utf8")));
    } catch {
      // Ignore unreadable env files (permissions, etc.)
    }
  }

  return env;
}

function parseEnvFile(contents: string): Record<string, string> {
  const env: Record<string, string> = {};

  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const exportMatch = line.match(/^export\s+(.+)$/);
    const assignment = exportMatch ? exportMatch[1] : line;

    const eqIndex = assignment.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = assignment.slice(0, eqIndex).trim();
    let value = assignment.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      const hashIndex = value.indexOf(" #");
      if (hashIndex !== -1) value = value.slice(0, hashIndex).trim();
    }

    if (key) env[key] = value;
  }

  return env;
}

/** Ensure non-VITE_ server secrets from `.env` are on process.env (Nitro/Vite dev). */
export function ensureServerEnv() {
  if (initialized) return;

  const mode = process.env.NODE_ENV ?? "development";
  const env = loadEnvFiles(mode, process.cwd());

  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }

  initialized = true;
}

export function logStripeEnvDebug() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();

  console.log("[stripe-env] STRIPE_SECRET_KEY exists:", Boolean(key));
  console.log(
    "[stripe-env] STRIPE_SECRET_KEY starts with sk_test_:",
    key?.startsWith("sk_test_") ?? false,
  );
  console.log("[stripe-env] STRIPE_SECRET_KEY length:", key?.length ?? 0);
  console.log(
    "[stripe-env] STRIPE_MICROSLIT_PRICE_ID exists:",
    Boolean(process.env.STRIPE_MICROSLIT_PRICE_ID),
  );
  console.log(
    "[stripe-env] STRIPE_FUJISAN_PRICE_ID exists:",
    Boolean(process.env.STRIPE_FUJISAN_PRICE_ID),
  );
}
