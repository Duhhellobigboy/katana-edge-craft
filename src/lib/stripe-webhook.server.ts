import process from "node:process";
import type Stripe from "stripe";
import { getStripeClient } from "./stripe.server";
import { createSupabaseServerClient } from "./supabase.server";
import { isCheckoutProductKey, PRODUCTS } from "./checkout-products.server";

export async function handleStripeWebhookRequest(request: Request): Promise<Response> {
  const stripe = getStripeClient();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing Stripe signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET is not configured. Webhook verification skipped.");
      event = JSON.parse(payload) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    console.error(`Webhook signature verification failed: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await processCheckoutSessionCompleted(session);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function processCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = createSupabaseServerClient();
  const stripeSessionId = session.id;

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  if (existingOrder) {
    console.log(`Order already exists for Stripe session ${stripeSessionId}`);
    return;
  }

  const metadata = session.metadata ?? {};
  const checkoutSessionId = metadata.checkout_session_id ?? "";
  const productKey = metadata.product_key ?? "";
  const productName = metadata.product_name ?? "Katana Edge Shears";
  const fullName = metadata.full_name ?? session.customer_details?.name ?? "";
  const email = metadata.email ?? session.customer_details?.email ?? "";
  const phone = metadata.phone ?? "";

  const subtotalCents = session.amount_subtotal ?? session.amount_total ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const shippingCents = session.shipping_cost?.amount_total ?? 0;
  const totalCents = session.amount_total ?? 0;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      checkout_session_id: checkoutSessionId,
      stripe_session_id: stripeSessionId,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      customer_name: fullName,
      customer_email: email,
      phone,
      subtotal_cents: subtotalCents,
      tax_cents: taxCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      currency: session.currency ?? "usd",
      payment_status: "paid",
      fulfillment_status: "pending",
      raw_stripe_session: session,
    })
    .select("id")
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    throw new Error(orderError.message);
  }

  type CartMetaItem = { productKey: string; quantity: number };
  let cartMetaItems: CartMetaItem[] = [];

  try {
    if (metadata.cart_items) {
      cartMetaItems = JSON.parse(metadata.cart_items) as CartMetaItem[];
    }
  } catch {
    cartMetaItems = [];
  }

  if (cartMetaItems.length === 0 && isCheckoutProductKey(productKey)) {
    cartMetaItems = [{ productKey, quantity: 1 }];
  }

  for (const item of cartMetaItems) {
    if (!isCheckoutProductKey(item.productKey)) continue;

    const { data: product } = await supabase
      .from("products")
      .select("id, price_cents, name")
      .eq("product_key", item.productKey)
      .maybeSingle();

    const unitPriceCents = product?.price_cents ?? 0;
    const qty = item.quantity || 1;
    const itemName = product?.name ?? PRODUCTS[item.productKey].name;

    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product?.id ?? null,
      product_key: item.productKey,
      product_name: itemName,
      quantity: qty,
      unit_price_cents: unitPriceCents,
      total_price_cents: unitPriceCents * qty,
    });
  }

  await supabase
    .from("checkout_sessions")
    .update({
      status: "paid",
      stripe_payment_status: "paid",
      amount_total_cents: totalCents,
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_session_id", checkoutSessionId);

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    try {
      const primaryItem = cartMetaItems[0];
      const n8nPayload = {
        event: "order_paid",
        checkout_session_id: checkoutSessionId,
        customer_name: fullName,
        customer_email: email,
        phone,
        product_key: primaryItem?.productKey ?? productKey,
        product_name: productName,
        quantity: primaryItem?.quantity ?? 1,
        items: cartMetaItems,
        total: totalCents,
        currency: session.currency ?? "usd",
        stripe_checkout_session_id: stripeSessionId,
      };

      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      });

      if (!n8nResponse.ok) {
        console.error(`n8n webhook responded with status ${n8nResponse.status}`);
      }
    } catch (err) {
      console.error("n8n webhook error:", err);
    }
  }
}
