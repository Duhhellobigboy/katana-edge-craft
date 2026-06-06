import process from "node:process";
import type { ApplyProductKey } from "./apply-products";

const PRICE_ENV_KEYS: Record<ApplyProductKey, string> = {
  microslit: "STRIPE_MICROSLIT_PRICE_ID",
  fujisan: "STRIPE_FUJISAN_PRICE_ID",
};

export function isApplyProductKey(value: string): value is ApplyProductKey {
  return value === "microslit" || value === "fujisan";
}

export function resolveStripePriceId(productKey: ApplyProductKey): string {
  const envKey = PRICE_ENV_KEYS[productKey];
  const priceId = process.env[envKey];

  if (!priceId) {
    throw new Error(`Missing ${envKey} environment variable.`);
  }

  return priceId;
}

export function getSiteUrl(): string {
  return process.env.VITE_SITE_URL || "http://localhost:8080";
}
