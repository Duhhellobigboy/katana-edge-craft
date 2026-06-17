import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ensureServerEnv } from "@/lib/env.server";
import { getStripeClient, logStripeError } from "@/lib/stripe.server";
import {
  getSiteUrl,
  isCheckoutProductKey,
  resolveCheckoutProduct,
} from "@/lib/checkout-products.server";
import {
  attachStripeSessionToGuest,
  upsertGuestCheckoutSession,
} from "@/lib/checkout-db.server";
import { MAX_CHECKOUT_QUANTITY } from "@/lib/product-keys";
import {
  isCheckoutConfigError,
  toClientCheckoutError,
} from "@/lib/checkout-messages";

const lineItemSchema = z.object({
  productKey: z.string(),
  variantKey: z.string().optional(),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1.")
    .max(MAX_CHECKOUT_QUANTITY, `Maximum ${MAX_CHECKOUT_QUANTITY} pieces per product.`),
  selectedSize: z.string().optional(),
  selectedHandle: z.string().optional(),
  selectedStyle: z.string().optional(),
  sku: z.string().optional(),
});

const checkoutRequestSchema = z.object({
  checkoutSessionId: z.string().uuid("A valid checkout session ID is required."),
  items: z.array(lineItemSchema).min(1, "At least one item is required."),
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().min(7, "Phone number is required."),
});

function logCheckoutFailure(err: unknown) {
  if (err instanceof Error) {
    console.error("[create-checkout-session]", err.message);
    return;
  }
  console.error("[create-checkout-session]", err);
}

export const Route = createFileRoute("/api/create-checkout-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;

        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = checkoutRequestSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.errors[0]?.message ?? "Invalid request." },
            { status: 400 },
          );
        }

        const { checkoutSessionId, items, fullName, email, phone } = parsed.data;

        try {
          ensureServerEnv();

          const stripe = getStripeClient();
          const siteUrl = getSiteUrl();
          const { createSupabaseServerClient } = await import("@/lib/supabase.server");
          const supabase = createSupabaseServerClient();

          // Resolve variant keys to Stripe Price IDs dynamically
          const resolvedLineItems = await Promise.all(
            items.map(async (item) => {
              let stripePriceId = "";
              let parentName = "";
              let stripeProductId = "";

              // 1. Resolve variant from Supabase
              const isLegacyKey = item.variantKey === "microslit" || item.variantKey === "fujisan";
              
              if (item.variantKey) {
                try {
                  const { data: variant, error: vError } = await supabase
                    .from("product_variants")
                    .select("stripe_price_id, stripe_product_id, active, size_label, handle_label, style_label, products(name, active)")
                    .eq("variant_key", item.variantKey)
                    .maybeSingle();

                  if (vError) {
                    throw new Error(`Database error querying variant: ${vError.message}`);
                  }

                  if (variant) {
                    if (!variant.active) {
                      throw new Error(`Variant ${item.variantKey} is inactive.`);
                    }
                    const parent = variant.products as any;
                    if (!parent || !parent.active) {
                      throw new Error(`Product for variant ${item.variantKey} is inactive.`);
                    }
                    
                    // Validate selected options match variant labels
                    if (variant.size_label && variant.size_label !== item.selectedSize) {
                      throw new Error(`Invalid size combination for variant ${item.variantKey}.`);
                    }
                    if (variant.handle_label && variant.handle_label !== item.selectedHandle) {
                      throw new Error(`Invalid handle combination for variant ${item.variantKey}.`);
                    }
                    if (variant.style_label && variant.style_label !== item.selectedStyle) {
                      throw new Error(`Invalid style combination for variant ${item.variantKey}.`);
                    }

                    if (!variant.stripe_price_id) {
                      throw new Error(`Stripe Price ID is missing for variant ${item.variantKey}.`);
                    }

                    stripePriceId = variant.stripe_price_id;
                    stripeProductId = variant.stripe_product_id || "";
                    parentName = parent.name;
                  } else if (!isLegacyKey) {
                    // Non-legacy key not found in variants database table
                    throw new Error(`Unknown variant key: ${item.variantKey}`);
                  }
                } catch (dbErr: any) {
                  // If it's a database error (e.g. table doesn't exist yet) but we are requesting a non-legacy key, we must reject it
                  if (!isLegacyKey) {
                    console.error("Stripe validation error for variant:", dbErr.message);
                    throw new Error(dbErr.message || "Failed to resolve variant.");
                  }
                  console.warn("DB variant resolution failed for legacy key, falling back:", dbErr.message);
                }
              }

              // 2. Fallback to codebase environment configurations for legacy keys only
              if (!stripePriceId) {
                if (!isLegacyKey) {
                  throw new Error(`Unable to resolve Stripe Price ID for variant: ${item.variantKey}`);
                }
                
                if (!isCheckoutProductKey(item.productKey)) {
                  throw new Error(`Unrecognized product: ${item.productKey}`);
                }
                const fallbackProduct = resolveCheckoutProduct(item.productKey);
                stripePriceId = fallbackProduct.priceId;
                stripeProductId = fallbackProduct.productId || "";
                parentName = fallbackProduct.name;
              }

              if (!stripePriceId) {
                throw new Error(`Unable to resolve Stripe Price ID for item: ${item.variantKey || item.productKey}`);
              }

              return {
                price: stripePriceId,
                productId: stripeProductId,
                quantity: item.quantity,
                name: parentName,
              };
            })
          );

          const lineItems = resolvedLineItems.map((r) => ({
            price: r.price,
            quantity: r.quantity,
          }));

          const primaryResolved = resolvedLineItems[0];
          const primary = items[0];

          await upsertGuestCheckoutSession({
            checkoutSessionId,
            fullName,
            email,
            phone,
            items: items.map((item) => ({
              product_key: item.productKey,
              variant_key: item.variantKey || item.productKey,
              quantity: item.quantity,
              selected_size: item.selectedSize,
              selected_handle: item.selectedHandle,
              selected_style: item.selectedStyle,
              sku: item.sku,
            })),
          });

          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: lineItems,
            customer_email: email,
            shipping_address_collection: {
              allowed_countries: ["US", "CA", "GB", "AU"],
            },
            success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/checkout?cancelled=true`,
            metadata: {
              checkout_session_id: checkoutSessionId,
              product_key: primary.productKey,
              product_name: primaryResolved.name,
              full_name: fullName,
              email,
              phone,
              stripe_product_id: primaryResolved.productId || "",
              cart_items: JSON.stringify(items),
            },
          });

          if (!session.url) {
            console.error("[create-checkout-session] Stripe returned no checkout URL.");
            return Response.json(
              { error: toClientCheckoutError("Stripe did not return a checkout URL.") },
              { status: 500 },
            );
          }

          await attachStripeSessionToGuest({
            checkoutSessionId,
            stripeCheckoutSessionId: session.id,
          });

          return Response.json({ url: session.url });
        } catch (err) {
          logStripeError(err);
          logCheckoutFailure(err);

          const serverMessage =
            err instanceof Error ? err.message : "Stripe checkout failed.";
          const status = isCheckoutConfigError(serverMessage) ? 503 : 500;

          return Response.json(
            { error: toClientCheckoutError(serverMessage) },
            { status },
          );
        }
      },
    },
  },
});
