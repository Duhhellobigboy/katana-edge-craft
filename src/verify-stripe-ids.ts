import Stripe from "stripe";
import { ensureServerEnv } from "./lib/env.server";

ensureServerEnv();

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("STRIPE_SECRET_KEY not found in environment.");
  process.exit(1);
}

const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20",
});

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

async function verify() {
  console.log("Stripe secret key prefix:", secretKey.slice(0, 12));
  for (const varName of priceVars) {
    const priceId = process.env[varName];
    if (!priceId) {
      console.log(`${varName} is missing`);
      continue;
    }
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log(`${varName} (${priceId}): VALID (Product: ${price.product}, Active: ${price.active})`);
    } catch (err: any) {
      console.error(`${varName} (${priceId}): ERROR - ${err.message}`);
    }
  }
}

verify();
