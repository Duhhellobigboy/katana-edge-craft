import Stripe from "stripe";
import process from "node:process";
import { ensureServerEnv } from "./env.server";

let stripeInstance: Stripe | null = null;
let cachedSecretKey: string | null = null;

export function getStripeClient() {
  ensureServerEnv();

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  if (
    !stripeSecretKey.startsWith("sk_test_") &&
    !stripeSecretKey.startsWith("sk_live_")
  ) {
    throw new Error(
      "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_. Use the Secret key from Stripe Dashboard, not the Publishable key."
    );
  }

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
