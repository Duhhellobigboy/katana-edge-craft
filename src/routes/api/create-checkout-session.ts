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
  productKey: z.enum(["microslit", "fujisan"]),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1.")
    .max(MAX_CHECKOUT_QUANTITY, `Maximum ${MAX_CHECKOUT_QUANTITY} pieces per product.`),
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

          const lineItems = items.map((item) => {
            const product = resolveCheckoutProduct(item.productKey);
            return { price: product.priceId, quantity: item.quantity };
          });

          const primary = items[0];
          const primaryProduct = resolveCheckoutProduct(primary.productKey);

          await upsertGuestCheckoutSession({
            checkoutSessionId,
            fullName,
            email,
            phone,
            items: items.map((item) => ({
              product_key: item.productKey,
              quantity: item.quantity,
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
              product_name: primaryProduct.name,
              full_name: fullName,
              email,
              phone,
              stripe_product_id: primaryProduct.productId ?? "",
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
