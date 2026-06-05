import Stripe from "stripe";
import process from "node:process";

let stripeInstance: Stripe | null = null;

export function getStripeClient() {
  if (stripeInstance) return stripeInstance;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: "2025-02-17-preview" as any,
  });

  return stripeInstance;
}
