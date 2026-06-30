import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ensureServerEnv } from "@/lib/env.server";
import { getStripeClient, logStripeError, validateSandboxAccount } from "@/lib/stripe.server";
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

function logTiming(
  operationName: string,
  elapsedMs: number,
  productKey?: string,
  priceId?: string,
  errorMessage?: string
) {
  const priceSuffix = priceId ? priceId.slice(-6) : undefined;
  console.log(
    `[Checkout Timing] Operation: ${operationName}` +
    ` | Elapsed: ${elapsedMs}ms` +
    (productKey ? ` | Product: ${productKey}` : "") +
    (priceSuffix ? ` | Price Suffix: ${priceSuffix}` : "") +
    (errorMessage ? ` | Error: ${errorMessage}` : "")
  );
}

function logCheckoutFailure(err: unknown) {
  if (err instanceof Error) {
    console.error("[create-checkout-session] Failure details:", err.message);
    return;
  }
  console.error("[create-checkout-session] Unknown failure:", err);
}

export const Route = createFileRoute("/api/create-checkout-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const handlerStartTime = Date.now();

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Checkout request timed out. Please try again.")), 15000)
        );

        const checkoutLogic = async () => {
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
          const validationTime = Date.now() - handlerStartTime;
          logTiming("request_validation", validationTime);

          ensureServerEnv();

          const stripe = getStripeClient();
          await validateSandboxAccount(stripe);
          const siteUrl = new URL(request.url).origin || getSiteUrl();
          const { createSupabaseServerClient } = await import("@/lib/supabase.server");
          const supabase = createSupabaseServerClient();

          // Resolve variant keys to Stripe Price IDs dynamically
          const dbStartTime = Date.now();
          const resolvedLineItems = await Promise.all(
            items.map(async (item) => {
              let stripePriceId = "";
              let parentName = "";
              let stripeProductId = "";
              let prodKey = item.productKey || "";
              if (!prodKey && item.variantKey) {
                const sortedKeys = [
                  "bamboo_thinning",
                  "double_swivel",
                  "microslit",
                  "fujisan",
                  "thunder",
                  "naruto",
                  "karakuri",
                  "bamboo",
                ];
                for (const k of sortedKeys) {
                  if (item.variantKey.startsWith(k)) {
                    prodKey = k;
                    break;
                  }
                }
              }

              if (!prodKey || !isCheckoutProductKey(prodKey)) {
                throw new Error(`Invalid or missing product key: ${prodKey || "unknown"}`);
              }

              // 1. Resolve Stripe Price ID from environment variables first (Source of Truth)
              const PRODUCT_ENV_VAR_MAPPING: Record<string, string> = {
                microslit: "STRIPE_MICROSLIT_PRICE_ID",
                fujisan: "STRIPE_FUJISAN_PRICE_ID",
                thunder: "STRIPE_THUNDER_PRICE_ID",
                double_swivel: "STRIPE_DOUBLE_SWIVEL_PRICE_ID",
                naruto: "STRIPE_NARUTO_PRICE_ID",
                karakuri: "STRIPE_KARAKURI_PRICE_ID",
                bamboo: "STRIPE_BAMBOO_PRICE_ID",
                bamboo_thinning: "STRIPE_BAMBOO_THINNING_PRICE_ID",
              };

              const envVarName = PRODUCT_ENV_VAR_MAPPING[prodKey];
              if (!envVarName) {
                throw new Error(`No environment variable mapping defined for product: ${prodKey}`);
              }

              const envPriceId = process.env[envVarName];
              if (!envPriceId) {
                throw new Error(`Missing Stripe price ID environment variable: ${envVarName} for product ${prodKey}`);
              }

              stripePriceId = envPriceId;

              // 2. Resolve variant details from Supabase if possible (timeout after 2s)
              const isLegacyKey = item.variantKey === "microslit" || item.variantKey === "fujisan";
              
              if (item.variantKey) {
                try {
                  const dbLookup = async () => {
                    const { data: variant, error: vError } = await supabase
                      .from("product_variants")
                      .select("stripe_price_id, stripe_product_id, active, size_label, handle_label, style_label, products(name, active)")
                      .eq("variant_key", item.variantKey)
                      .maybeSingle();

                    if (vError) {
                      throw new Error(vError.message);
                    }
                    return variant;
                  };

                  const variant = await Promise.race([
                    dbLookup(),
                    new Promise<null>((_, reject) =>
                      setTimeout(() => reject(new Error("Database variant lookup timed out")), 2000)
                    )
                  ]);

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

                    stripeProductId = variant.stripe_product_id || "";
                    if (!stripePriceId) {
                      stripePriceId = variant.stripe_price_id || "";
                    }
                    parentName = parent.name;
                  } else {
                    // Try looking up the product itself
                    const dbLookupProduct = async () => {
                      const { data: dbProduct, error: pError } = await supabase
                        .from("products")
                        .select("stripe_price_id, stripe_product_id, name, active")
                        .eq("product_key", prodKey)
                        .maybeSingle();
                      if (pError) throw new Error(pError.message);
                      return dbProduct;
                    };
                    const dbProduct = await Promise.race([
                      dbLookupProduct(),
                      new Promise<null>((_, reject) =>
                        setTimeout(() => reject(new Error("Database product lookup timed out")), 2000)
                      )
                    ]).catch(() => null);

                    if (dbProduct) {
                      if (!dbProduct.active) {
                        throw new Error(`Product ${prodKey} is inactive.`);
                      }
                      if (!stripePriceId) {
                        stripePriceId = dbProduct.stripe_price_id || "";
                      }
                      stripeProductId = dbProduct.stripe_product_id || "";
                      parentName = dbProduct.name;
                    }
                  }
                } catch (dbErr: any) {
                  logTiming("supabase_variant_lookup_fallback", Date.now() - dbStartTime, item.productKey, undefined, dbErr.message);
                }
              }

              // 3. Resolve fallback parentName and stripeProductId from codebase configuration if database lookup was skipped or failed
              const isProductKeyValid = isCheckoutProductKey(prodKey);
              if (!parentName && isProductKeyValid) {
                const fallbackProduct = resolveCheckoutProduct(prodKey);
                stripeProductId = fallbackProduct.productId || "";
                parentName = fallbackProduct.name;
              }
              if (!parentName) {
                parentName = prodKey.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              }

              // 4. Absolute fallback if still empty
              if (!stripePriceId) {
                throw new Error(`Missing Stripe Price ID for product: ${prodKey}`);
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

          // Run Supabase guest session upsert in the background (fire-and-forget) to not block the redirect
          const upsertStartTime = Date.now();
          upsertGuestCheckoutSession({
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
          }).then(() => {
            logTiming("supabase_insert", Date.now() - upsertStartTime, primary.productKey, primaryResolved.price);
          }).catch((dbErr: any) => {
            logTiming("supabase_insert", Date.now() - upsertStartTime, primary.productKey, primaryResolved.price, dbErr.message || "Failed");
          });

          // Build a compact cart summary array for Stripe metadata
          const cartSummary = items.map((item, index) => {
            const resolved = resolvedLineItems[index];
            return {
              productName: resolved.name,
              variantKey: item.variantKey || item.productKey,
              selectedSize: item.selectedSize || "",
              selectedHandle: item.selectedHandle || "",
              selectedStyle: item.selectedStyle || "",
              quantity: item.quantity,
              sku: item.sku || "",
            };
          });

          let cartSummaryJson = JSON.stringify(cartSummary);
          if (cartSummaryJson.length > 500) {
            const compressed = cartSummary.map(({ productName, ...rest }) => rest);
            cartSummaryJson = JSON.stringify(compressed);
          }
          if (cartSummaryJson.length > 500) {
            const ultraCompressed = cartSummary.map((s) => ({
              vKey: s.variantKey,
              qty: s.quantity,
            }));
            cartSummaryJson = JSON.stringify(ultraCompressed);
          }
          if (cartSummaryJson.length > 500) {
            cartSummaryJson = cartSummaryJson.slice(0, 500);
          }

          const metadata = {
            order_reference: checkoutSessionId,
            checkout_session_id: checkoutSessionId, // legacy support
            cart_item_count: items.reduce((acc, item) => acc + item.quantity, 0).toString(),
            cart_summary_json: cartSummaryJson,
            product_key: primary.productKey,
            product_name: primaryResolved.name,
            full_name: fullName,
            email,
            phone,
            stripe_product_id: primaryResolved.productId || "",
            cart_items: JSON.stringify(items).slice(0, 500), // legacy support
            selected_size: primary.selectedSize || "",
            selected_handle: primary.selectedHandle || "",
            selected_style: primary.selectedStyle || "",
            sku: primary.sku || "",
            // Root-level camelCase fields for verification checks
            selectedSize: primary.selectedSize || "",
            selectedHandle: primary.selectedHandle || "",
            selectedStyle: primary.selectedStyle || "",
            variantKey: primary.variantKey || primary.productKey,
            productName: primaryResolved.name,
            quantity: primary.quantity.toString(),
          };

          const stripeStartTime = Date.now();
          const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: lineItems,
            customer_email: email,
            allow_promotion_codes: true,
            shipping_address_collection: {
              allowed_countries: ["US", "CA", "GB", "AU"],
            },
            success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${siteUrl}/checkout?cancelled=true`,
            metadata,
            payment_intent_data: {
              metadata,
            },
          });
          const stripeTime = Date.now() - stripeStartTime;
          logTiming("stripe_session_create", stripeTime, primary.productKey, primaryResolved.price);

          if (!session.url) {
            throw new Error("Stripe did not return a checkout URL.");
          }

          // Run Database associations update in the background (fire-and-forget) to not block the redirect
          const attachStartTime = Date.now();
          attachStripeSessionToGuest({
            checkoutSessionId,
            stripeCheckoutSessionId: session.id,
          }).then(() => {
            logTiming("attach_session_db", Date.now() - attachStartTime, primary.productKey, primaryResolved.price);
          }).catch((dbErr: any) => {
            logTiming("attach_session_db", Date.now() - attachStartTime, primary.productKey, primaryResolved.price, dbErr.message || "Failed");
          });

          const totalElapsed = Date.now() - handlerStartTime;
          logTiming("final_response", totalElapsed, primary.productKey, primaryResolved.price);

          return Response.json({ url: session.url });
        };

        try {
          return await Promise.race([checkoutLogic(), timeoutPromise]);
        } catch (err: any) {
          const totalElapsed = Date.now() - handlerStartTime;
          logTiming("final_response", totalElapsed, undefined, undefined, err.message || "Checkout failed");
          logStripeError(err);
          logCheckoutFailure(err);

          const serverMessage = err instanceof Error ? err.message : "Stripe checkout failed.";
          const status = serverMessage.includes("timed out")
            ? 504
            : isCheckoutConfigError(serverMessage)
              ? 503
              : 500;

          return Response.json(
            { error: toClientCheckoutError(serverMessage) },
            { status },
          );
        }
      },
    },
  },
});
