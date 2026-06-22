import Stripe from "stripe";
import process from "node:process";
import { INVALID_STRIPE_SECRET_KEY_MESSAGE } from "./checkout-messages";
import {
  ensureServerEnv,
  logStripeEnvDebug,
  validateStripeSecretKey,
} from "./env.server";

let stripeInstance: Stripe | null = null;
let cachedSecretKey: string | null = null;

export function getStripeClient() {
  ensureServerEnv();

  const validation = validateStripeSecretKey(process.env.STRIPE_SECRET_KEY);

  if (!validation.valid || !validation.key) {
    console.error("[stripe-env] Stripe client init failed:", validation.reason);
    throw new Error(INVALID_STRIPE_SECRET_KEY_MESSAGE);
  }

  const stripeSecretKey = validation.key;

  if (!stripeInstance || cachedSecretKey !== stripeSecretKey) {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });
    cachedSecretKey = stripeSecretKey;
  }

  return stripeInstance;
}

let sandboxValidated = false;

export async function validateSandboxAccount(stripe: Stripe) {
  if (sandboxValidated) return;

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET is invalid (must start with whsec_).");
  }

  const priceIdEnvVars = [
    "STRIPE_MICROSLIT_PRICE_ID",
    "STRIPE_FUJISAN_PRICE_ID",
    "STRIPE_THUNDER_PRICE_ID",
    "STRIPE_DOUBLE_SWIVEL_PRICE_ID",
    "STRIPE_NARUTO_PRICE_ID",
    "STRIPE_KARAKURI_PRICE_ID",
    "STRIPE_BAMBOO_PRICE_ID",
    "STRIPE_BAMBOO_THINNING_PRICE_ID",
  ];

  const presentPriceIds = priceIdEnvVars
    .map((name) => process.env[name])
    .filter(Boolean) as string[];

  // Mark as validated immediately to prevent concurrent validation runs
  sandboxValidated = true;

  // Run validation in the background (fire-and-forget) to avoid network latency on the critical checkout path
  Promise.all(
    presentPriceIds.map(async (priceId) => {
      try {
        const price = await stripe.prices.retrieve(priceId);
        if (!price.active) {
          const suffix = priceId.slice(-6);
          console.warn(`[stripe-validate] Warning: Price ID suffix ${suffix} is inactive on Stripe.`);
        }
      } catch (err: any) {
        const suffix = priceId.slice(-6);
        console.error(
          `[stripe-validate] Price ID suffix ${suffix} validation failed. It may not belong to the configured Stripe sandbox account: ${err.message}`
        );
      }
    })
  ).then(() => {
    console.log("[stripe-validate] Background validation of configured Price IDs completed.");
  }).catch((err) => {
    console.error("[stripe-validate] Background Price ID validation failed:", err.message || err);
  });
}

export function logStripeError(err: unknown) {
  if (err && typeof err === "object" && "type" in err) {
    const stripeErr = err as {
      type?: string;
      code?: string;
      message?: string;
      statusCode?: number;
    };
    console.error("[stripe-error]", {
      type: stripeErr.type,
      code: stripeErr.code,
      message: stripeErr.message,
      statusCode: stripeErr.statusCode,
    });
    return;
  }

  console.error("[stripe-error]", err);
}
