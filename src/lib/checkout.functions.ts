import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";
import { getStripeClient } from "./stripe.server";
import { createSupabaseServerClient } from "./supabase.server";
import { getProduct } from "./products";

// Helper to verify user from accessToken
async function verifyUser(accessToken: string) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Unauthorized: Invalid access token.");
  }
  return user;
}

export const createStripeCheckoutSession = createServerFn({ method: "POST" })
  .input(
    z.object({
      cartItems: z.array(
        z.object({
          slug: z.string(),
          quantity: z.number().min(1),
        })
      ),
      accessToken: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { cartItems, accessToken } = input;

    // 1. Verify user session
    const user = await verifyUser(accessToken);

    // 2. Validate items and get Stripe price data
    const stripe = getStripeClient();
    const lineItems = [];

    for (const item of cartItems) {
      const product = getProduct(item.slug);
      if (!product) {
        throw new Error(`Invalid product: ${item.slug}`);
      }

      // Format image URL
      // If we are on localhost, Stripe requires a public URL or it will error if we use localhost paths.
      // We will fall back to placeholder images in Stripe if it's not a public URL.
      const siteUrl = process.env.VITE_SITE_URL || "http://localhost:5173";
      let imageUrl = product.image;
      if (imageUrl.startsWith("/")) {
        imageUrl = `${siteUrl}${imageUrl}`;
      } else if (!imageUrl.startsWith("http")) {
        // Fallback placeholder image for local dev
        imageUrl = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop";
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [imageUrl],
            description: product.tagline,
          },
          unit_amount: product.price * 100, // Stripe expects cents
        },
        quantity: item.quantity,
      });
    }

    if (lineItems.length === 0) {
      throw new Error("Cart is empty.");
    }

    const siteUrl = process.env.VITE_SITE_URL || "http://localhost:5173";

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: user.email,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?cancelled=true`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      metadata: {
        userId: user.id,
        cartItems: JSON.stringify(
          cartItems.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
          }))
        ),
      },
    });

    // 4. Record session in database as pending
    const supabase = createSupabaseServerClient();
    const { error: dbError } = await supabase.from("stripe_checkout_sessions").insert({
      id: session.id,
      user_id: user.id,
      status: "pending",
      amount_total: session.amount_total || 0,
      currency: session.currency || "usd",
    });

    if (dbError) {
      console.error("Failed to insert stripe checkout session into DB", dbError);
      // We still return the session URL since payment is primary
    }

    return { url: session.url };
  });

export const getOrderDetailsBySession = createServerFn({ method: "POST" })
  .input(
    z.object({
      sessionId: z.string(),
      accessToken: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { sessionId, accessToken } = input;

    // 1. Verify user session
    const user = await verifyUser(accessToken);

    // 2. Fetch Stripe checkout session details
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // Ensure session belongs to the requesting user
    if (session.metadata?.userId !== user.id) {
      throw new Error("Unauthorized: This checkout session does not belong to your account.");
    }

    // 3. Query order from Database (if webhook has already run)
    const supabase = createSupabaseServerClient();
    const { data: order } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        payment_status,
        amount_total,
        shipping_address,
        created_at,
        order_items (
          product_slug,
          product_name,
          quantity,
          unit_price
        )
      `)
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    // 4. Return unified result
    // If database order exists, return it. If not (webhook pending), return details from Stripe session.
    if (order) {
      return {
        source: "database",
        orderId: order.id,
        status: order.status,
        paymentStatus: order.payment_status,
        amountTotal: order.amount_total / 100,
        shippingAddress: order.shipping_address,
        createdAt: order.created_at,
        items: order.order_items.map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price / 100,
        })),
      };
    }

    // Fallback: Webhook hasn't completed yet, parse Stripe Session object
    const stripeItems = session.line_items?.data.map((item) => ({
      name: item.description || "Premium Shears",
      quantity: item.quantity || 1,
      price: (item.price?.unit_amount || 0) / 100,
    })) || [];

    const shippingDetails = session.shipping_details;
    const shippingAddress = shippingDetails
      ? {
          name: shippingDetails.name,
          line1: shippingDetails.address?.line1,
          line2: shippingDetails.address?.line2,
          city: shippingDetails.address?.city,
          state: shippingDetails.address?.state,
          postal_code: shippingDetails.address?.postal_code,
          country: shippingDetails.address?.country,
        }
      : null;

    return {
      source: "stripe",
      orderId: null,
      status: "processing",
      paymentStatus: "paid",
      amountTotal: (session.amount_total || 0) / 100,
      shippingAddress,
      createdAt: new Date().toISOString(),
      items: stripeItems,
    };
  });
