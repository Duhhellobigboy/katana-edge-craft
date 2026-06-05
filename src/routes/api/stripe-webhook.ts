import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";
import { getStripeClient } from "@/lib/stripe.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import { getProduct } from "@/lib/products";

export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripe = getStripeClient();
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        const payload = await request.text();
        const sig = request.headers.get("stripe-signature");

        if (!sig) {
          return new Response("Missing Stripe signature header", { status: 400 });
        }

        if (!endpointSecret) {
          console.warn("STRIPE_WEBHOOK_SECRET is not configured. Signature verification is disabled.");
        }

        let event;

        try {
          if (endpointSecret) {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
          } else {
            // Decodes without verification (useful for raw manual local tests without CLI listening)
            event = JSON.parse(payload);
          }
        } catch (err: any) {
          console.error(`Webhook signature verification failed: ${err.message}`);
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        console.log(`Processing Stripe webhook event: ${event.type}`);

        // Handle the checkout.session.completed event
        if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
          const session = event.data.object as any;
          const supabase = createSupabaseServerClient();

          // 1. Update the session state in Supabase
          const { error: sessionUpdateError } = await supabase
            .from("stripe_checkout_sessions")
            .update({
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", session.id);

          if (sessionUpdateError) {
            console.error(`Error updating session status for ${session.id}:`, sessionUpdateError);
          }

          // 2. Parse metadata and shipping details
          const userId = session.metadata?.userId;
          let cartItems = [];
          try {
            cartItems = JSON.parse(session.metadata?.cartItems || "[]");
          } catch (e) {
            console.error("Failed to parse cartItems metadata:", e);
          }

          const shippingDetails = session.shipping_details;
          const shippingAddress = shippingDetails
            ? {
                name: shippingDetails.name,
                line1: shippingDetails.address?.line1,
                line2: shippingDetails.address?.line2 || null,
                city: shippingDetails.address?.city,
                state: shippingDetails.address?.state,
                postal_code: shippingDetails.address?.postal_code,
                country: shippingDetails.address?.country,
              }
            : null;

          // 3. Create order entry in database
          const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
              user_id: userId || null,
              stripe_session_id: session.id,
              status: "processing",
              payment_status: "paid",
              amount_total: session.amount_total || 0,
              shipping_address: shippingAddress,
            })
            .select("id")
            .single();

          if (orderError) {
            console.error("Error creating order record:", orderError);
            return new Response(`Database Error: ${orderError.message}`, { status: 500 });
          }

          // 4. Create order items entries
          if (order && cartItems.length > 0) {
            const orderItemsData = cartItems.map((item: any) => {
              const product = getProduct(item.slug);
              return {
                order_id: order.id,
                product_slug: item.slug,
                product_name: product?.name || item.slug,
                quantity: item.quantity,
                unit_price: (product?.price || 0) * 100, // Cents
              };
            });

            const { error: itemsError } = await supabase
              .from("order_items")
              .insert(orderItemsData);

            if (itemsError) {
              console.error("Error writing order items:", itemsError);
            }
          }

          // 5. Trigger n8n Automation Webhook
          const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
          if (n8nWebhookUrl) {
            try {
              const formattedItems = cartItems.map((item: any) => {
                const product = getProduct(item.slug);
                return {
                  productSlug: item.slug,
                  productName: product?.name || item.slug,
                  quantity: item.quantity,
                  unitPrice: (product?.price || 0) * 100,
                };
              });

              const n8nPayload = {
                orderId: order?.id || null,
                stripeSessionId: session.id,
                customer: {
                  userId: userId || null,
                  email: session.customer_details?.email || null,
                  name: session.customer_details?.name || null,
                },
                shippingAddress,
                items: formattedItems,
                totals: {
                  subtotal: session.amount_subtotal || 0,
                  shipping: session.shipping_cost?.amount_total || 0,
                  tax: session.total_details?.amount_tax || 0,
                  total: session.amount_total || 0,
                },
                timestamp: new Date().toISOString(),
              };

              console.log(`Sending post-checkout payload to n8n: ${n8nWebhookUrl}`);

              const n8nResponse = await fetch(n8nWebhookUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(n8nPayload),
              });

              if (!n8nResponse.ok) {
                console.error(`n8n webhook responded with non-2xx code: ${n8nResponse.status}`);
              }
            } catch (err) {
              console.error("Exception triggered when calling n8n automation webhook:", err);
            }
          } else {
            console.log("N8N_WEBHOOK_URL is not set. Skipping automation trigger.");
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
