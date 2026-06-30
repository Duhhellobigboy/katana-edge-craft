import { createSupabaseServerClient } from "../src/lib/supabase.server";
import { ensureServerEnv } from "../src/lib/env.server";

ensureServerEnv();

const supabase = createSupabaseServerClient();

async function checkDb() {
  console.log("=== DB Products ===");
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("product_key, name, stripe_price_id, stripe_product_id, active");
  if (pErr) {
    console.error("Error fetching products:", pErr);
  } else {
    for (const p of products) {
      console.log(`Product Key: ${p.product_key}`);
      console.log(`  Name: ${p.name}`);
      console.log(`  Stripe Price ID: ${p.stripe_price_id}`);
      console.log(`  Stripe Product ID: ${p.stripe_product_id}`);
      console.log(`  Active: ${p.active}`);
    }
  }

  console.log("\n=== DB Product Variants ===");
  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("variant_key, stripe_price_id, stripe_product_id, active");
  if (vErr) {
    console.error("Error fetching variants:", vErr);
  } else {
    for (const v of variants) {
      console.log(`Variant Key: ${v.variant_key}`);
      console.log(`  Stripe Price ID: ${v.stripe_price_id}`);
      console.log(`  Stripe Product ID: ${v.stripe_product_id}`);
      console.log(`  Active: ${v.active}`);
    }
  }
}

checkDb();
