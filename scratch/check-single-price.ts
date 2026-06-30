import Stripe from "stripe";
import { ensureServerEnv } from "../src/lib/env.server";

ensureServerEnv();

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(secretKey!, { apiVersion: "2024-06-20" });

async function check() {
  const p1 = await stripe.prices.retrieve("price_1Tf6lG2MuPGmYXKi9Gzn1o1q");
  const prod1 = await stripe.products.retrieve(p1.product as string);
  console.log("Price ID: price_1Tf6lG2MuPGmYXKi9Gzn1o1q");
  console.log("  Name:", prod1.name);
  console.log("  Amount:", p1.unit_amount! / 100);

  const p2 = await stripe.prices.retrieve("price_1Tf6it2MuPGmYXKi91hvTQpj");
  const prod2 = await stripe.products.retrieve(p2.product as string);
  console.log("Price ID: price_1Tf6it2MuPGmYXKi91hvTQpj");
  console.log("  Name:", prod2.name);
  console.log("  Amount:", p2.unit_amount! / 100);
}
check();
