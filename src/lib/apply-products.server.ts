import type { ApplyProductKey } from "./apply-products";
import { getEnvVar, getSiteUrl as getServerSiteUrl } from "./env.server";

const PRICE_ENV_KEYS: Record<ApplyProductKey, string> = {
  microslit: "STRIPE_MICROSLIT_PRICE_ID",
  fujisan: "STRIPE_FUJISAN_PRICE_ID",
  thunder: "STRIPE_THUNDER_PRICE_ID",
  double_swivel: "STRIPE_DOUBLE_SWIVEL_PRICE_ID",
  naruto: "STRIPE_NARUTO_PRICE_ID",
  karakuri: "STRIPE_KARAKURI_PRICE_ID",
  bamboo: "STRIPE_BAMBOO_PRICE_ID",
  bamboo_thinning: "STRIPE_BAMBOO_THINNING_PRICE_ID",
};

export function isApplyProductKey(value: string): value is ApplyProductKey {
  return [
    "microslit",
    "fujisan",
    "thunder",
    "double_swivel",
    "naruto",
    "karakuri",
    "bamboo",
    "bamboo_thinning"
  ].includes(value);
}

export function resolveStripePriceId(productKey: ApplyProductKey): string {
  const envKey = PRICE_ENV_KEYS[productKey];
  const priceId = getEnvVar(envKey);

  if (!priceId) {
    throw new Error(`Missing ${envKey} environment variable.`);
  }

  return priceId;
}

export function getSiteUrl(): string {
  return getServerSiteUrl();
}
