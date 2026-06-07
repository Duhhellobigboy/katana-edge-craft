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
