import Stripe from "stripe";
import { ensureServerEnv } from "../src/lib/env.server";

ensureServerEnv();

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(secretKey!, { apiVersion: "2024-06-20" });

async function run() {
  console.log("Creating local checkout session via API mock...");
  
  // Call Stripe API directly to create a session for microslit (price_1TkKMEEPlkX6ZtPCfhVwYwXK)
  // using the sk_live_... key from .env to see what Stripe returns!
  const priceId = process.env.STRIPE_MICROSLIT_PRICE_ID || "price_1TkKMEEPlkX6ZtPCfhVwYwXK";
  console.log("Stripe Price ID being sent:", priceId);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });

  console.log("\n=== Session Created Successfully ===");
  console.log("Session ID:", session.id);
  console.log("Session URL:", session.url);

  // Retrieve details of the line items in this session
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  console.log("\n=== Line Items in Stripe Session ===");
  for (const item of lineItems.data) {
    console.log(`Product Name: "${item.description}"`);
    console.log(`Amount Total: $${(item.amount_total || 0) / 100}`);
    console.log(`Currency: ${item.currency}`);
  }
}

run();
