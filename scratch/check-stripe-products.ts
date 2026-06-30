import Stripe from "stripe";
import { ensureServerEnv } from "../src/lib/env.server";

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

async function checkProducts() {
  console.log("Checking products for each environment price ID on Stripe...");
  for (const varName of priceVars) {
    const priceId = process.env[varName];
    if (!priceId) {
      console.log(`${varName} is missing`);
      continue;
    }
    try {
      const price = await stripe.prices.retrieve(priceId);
      let productName = "Unknown Product";
      if (typeof price.product === "string") {
        const product = await stripe.products.retrieve(price.product);
        productName = product.name;
      } else if (price.product && typeof price.product === "object" && !price.product.deleted) {
        productName = price.product.name;
      }
      console.log(`${varName} (${priceId}):`);
      console.log(`  Stripe Product ID: ${price.product}`);
      console.log(`  Stripe Product Name: "${productName}"`);
      console.log(`  Active: ${price.active}`);
      console.log(`  Amount: $${(price.unit_amount || 0) / 100}`);
    } catch (err: any) {
      console.error(`${varName} (${priceId}): ERROR - ${err.message}`);
    }
  }
}

checkProducts();
