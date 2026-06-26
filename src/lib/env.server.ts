import { existsSync, readFileSync } from "node:fs";
import process from "node:process";
import { resolve } from "node:path";
import { INVALID_STRIPE_SECRET_KEY_MESSAGE } from "./checkout-messages";

let initialized = false;

const PLACEHOLDER_PATTERNS = [
  /your[_-]?stripe/i,
  /placeholder/i,
  /replace[_-]?me/i,
  /sk_test_x+$/i,
  /example/i,
  /changeme/i,
];

/** Strip quotes and accidental `KEY=value` paste mistakes from env values. */
export function sanitizeEnvValue(raw: string | undefined): string {
  if (!raw) return "";

  let value = raw.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  const prefixMatch = value.match(/^[A-Z][A-Z0-9_]*=(.+)$/);
  if (prefixMatch) {
    value = prefixMatch[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).trim();
    }
  }

  return value;
}

export function getEnvVar(name: string): string {
  ensureServerEnv();
  return sanitizeEnvValue(process.env[name]);
}

export type StripeKeyValidation = {
  valid: boolean;
  key: string | null;
  reason: string | null;
};

export function validateStripeSecretKey(
  raw: string | undefined,
): StripeKeyValidation {
  const key = sanitizeEnvValue(raw);

  if (!key) {
    return { valid: false, key: null, reason: "STRIPE_SECRET_KEY is not set." };
  }

  if (key.includes("STRIPE_SECRET_KEY=")) {
    return {
      valid: false,
      key: null,
      reason:
        "STRIPE_SECRET_KEY includes the variable name. Paste only the raw sk_ value in Vercel.",
    };
  }

  if (key.includes('"') || key.includes("'")) {
    return {
      valid: false,
      key: null,
      reason: "STRIPE_SECRET_KEY contains quotes. Remove quotes in Vercel.",
    };
  }

  if (key.startsWith("pk_test_") || key.startsWith("pk_live_")) {
    return {
      valid: false,
      key: null,
      reason:
        "STRIPE_SECRET_KEY is a publishable key (pk_). Use the secret key (sk_) instead.",
    };
  }

  if (!key.startsWith("sk_test_") && !key.startsWith("sk_live_")) {
    return {
      valid: false,
      key: null,
      reason: "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.",
    };
  }

  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(key))) {
    return {
      valid: false,
      key: null,
      reason: "STRIPE_SECRET_KEY looks like a placeholder value.",
    };
  }

  if (key.length < 32) {
    return {
      valid: false,
      key: null,
      reason: "STRIPE_SECRET_KEY is too short to be a valid Stripe secret key.",
    };
  }

  return { valid: true, key, reason: null };
}

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

/** Backfill process.env from `.env` files when vars are missing (local dev). */
export function ensureServerEnv() {
  if (initialized) return;

  const mode = process.env.NODE_ENV ?? "development";
  const env = loadEnvFiles(mode, process.cwd());

  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = sanitizeEnvValue(value);
    }
  }

  initialized = true;
}

export function getSiteUrl(): string {
  ensureServerEnv();

  // Try VITE_SITE_URL
  let url = getEnvVar("VITE_SITE_URL");

  // Try NEXT_PUBLIC_SITE_URL (fallback since user configured this in Vercel/.env)
  if (!url) {
    url = getEnvVar("NEXT_PUBLIC_SITE_URL");
  }

  // Try Vercel system-defined URL
  if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }

  // Try import.meta.env.VITE_SITE_URL
  if (!url) {
    const fromImport = typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_SITE_URL as string | undefined)
      : undefined;
    url = sanitizeEnvValue(fromImport);
  }

  if (url) {
    try {
      const parsed = new URL(url);
      // We only want the origin (e.g. "https://katana-edge-craft-o6n3.vercel.app")
      // to avoid breaking sub-routes like /success when a sub-page path is appended (e.g. /products)
      return parsed.origin;
    } catch {
      return url.replace(/\/+$/, "");
    }
  }

  return "http://localhost:8080";
}

export function logStripeEnvDebug() {
  const key = getEnvVar("STRIPE_SECRET_KEY");
  const validation = validateStripeSecretKey(process.env.STRIPE_SECRET_KEY);

  console.log("[stripe-env] STRIPE_SECRET_KEY exists:", Boolean(key));
  console.log("[stripe-env] STRIPE_SECRET_KEY starts with sk_test_:", key.startsWith("sk_test_"));
  console.log("[stripe-env] STRIPE_SECRET_KEY starts with sk_live_:", key.startsWith("sk_live_"));
  console.log("[stripe-env] STRIPE_SECRET_KEY length:", key.length);
  console.log("[stripe-env] STRIPE_SECRET_KEY valid:", validation.valid);
  if (!validation.valid) {
    console.error("[stripe-env] STRIPE_SECRET_KEY reason:", validation.reason);
    console.error("[stripe-env]", INVALID_STRIPE_SECRET_KEY_MESSAGE);
  }

  console.log("[stripe-env] VITE_SITE_URL:", getSiteUrl());
  const priceVars = [
    "STRIPE_MICROSLIT_PRICE_ID",
    "STRIPE_FUJISAN_PRICE_ID",
    "STRIPE_THUNDER_PRICE_ID",
    "STRIPE_DOUBLE_SWIVEL_PRICE_ID",
    "STRIPE_NARUTO_PRICE_ID",
    "STRIPE_KARAKURI_PRICE_ID",
    "STRIPE_BAMBOO_PRICE_ID",
    "STRIPE_BAMBOO_THINNING_PRICE_ID",
  ];
  for (const varName of priceVars) {
    console.log(`[stripe-env] ${varName} exists:`, Boolean(getEnvVar(varName)));
  }
}
