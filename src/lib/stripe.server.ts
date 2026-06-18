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
  logStripeEnvDebug();

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
  if (!secretKey.startsWith("sk_test_")) {
    throw new Error("STRIPE_SECRET_KEY must be a sandbox test key (starting with sk_test_).");
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

  // Validate price IDs in parallel against Stripe account
  await Promise.all(
    presentPriceIds.map(async (priceId) => {
      try {
        const price = await stripe.prices.retrieve(priceId);
        if (!price.active) {
          console.warn(`[stripe-validate] Warning: Price ID ${priceId} is inactive on Stripe.`);
        }
      } catch (err: any) {
        throw new Error(
          `Price ID ${priceId} validation failed. It may not belong to the configured Stripe sandbox account: ${err.message}`
        );
      }
    })
  );

  sandboxValidated = true;
  console.log("[stripe-validate] All configured Price IDs successfully validated against sandbox account.");
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
