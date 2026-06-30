import Stripe from "stripe";
import { ensureServerEnv } from "../src/lib/env.server";

ensureServerEnv();

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(secretKey!, { apiVersion: "2024-06-20" });

async function listAll() {
  console.log("Listing all products and prices from Stripe account...");
  const products = await stripe.products.list({ limit: 100 });
  const prices = await stripe.prices.list({ limit: 100 });

  console.log("\n=== Stripe Products ===");
  for (const p of products.data) {
    console.log(`Product: "${p.name}" (ID: ${p.id})`);
  }

  console.log("\n=== Stripe Prices ===");
  for (const pr of prices.data) {
    const prodName = products.data.find(p => p.id === pr.product)?.name || "Unknown Product";
    console.log(`Price ID: ${pr.id}`);
    console.log(`  Product: "${prodName}" (ID: ${pr.product})`);
    console.log(`  Amount: $${(pr.unit_amount || 0) / 100}`);
    console.log(`  Nickname/Label: ${pr.nickname || "None"}`);
    console.log(`  Active: ${pr.active}`);
  }
}

listAll();
