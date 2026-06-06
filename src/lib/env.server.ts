import process from "node:process";
import { loadEnv } from "vite";

let initialized = false;

/** Ensure non-VITE_ server secrets from `.env` are on process.env (Nitro/Vite dev). */
export function ensureServerEnv() {
  if (initialized) return;

  const mode = process.env.NODE_ENV ?? "development";
  const env = loadEnv(mode, process.cwd(), "");

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
    key?.startsWith("sk_test_") ?? false
  );
  console.log("[stripe-env] STRIPE_SECRET_KEY length:", key?.length ?? 0);
  console.log(
    "[stripe-env] STRIPE_MICROSLIT_PRICE_ID exists:",
    Boolean(process.env.STRIPE_MICROSLIT_PRICE_ID)
  );
  console.log(
    "[stripe-env] STRIPE_FUJISAN_PRICE_ID exists:",
    Boolean(process.env.STRIPE_FUJISAN_PRICE_ID)
  );
}
