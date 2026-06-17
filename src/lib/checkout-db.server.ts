import { createSupabaseServerClient } from "./supabase.server";
import type { CheckoutProductKey } from "./checkout-products.server";

const SESSION_TTL_HOURS = 72;

export function getSessionExpiresAt(): string {
  const expires = new Date();
  expires.setHours(expires.getHours() + SESSION_TTL_HOURS);
  return expires.toISOString();
}

export type CheckoutCartItem = {
  product_key: string;
  variant_key?: string;
  quantity: number;
  selected_size?: string;
  selected_handle?: string;
  selected_style?: string;
  sku?: string;
};

export async function upsertGuestCheckoutSession(input: {
  checkoutSessionId: string;
  fullName: string;
  email: string;
  phone: string;
  items: CheckoutCartItem[];
}) {
  const supabase = createSupabaseServerClient();
  const expiresAt = getSessionExpiresAt();

  const cartItems = input.items;

  const { data: existing } = await supabase
    .from("checkout_sessions")
    .select("id")
    .eq("checkout_session_id", input.checkoutSessionId)
    .maybeSingle();

  const row = {
    checkout_session_id: input.checkoutSessionId,
    customer_name: input.fullName,
    customer_email: input.email,
    phone: input.phone,
    status: "pending" as const,
    cart_items: cartItems,
    metadata: { cart_items: cartItems },
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("checkout_sessions")
      .update(row)
      .eq("checkout_session_id", input.checkoutSessionId);

    if (error) throw new Error(`Failed to update checkout session: ${error.message}`);
    return;
  }

  const { error } = await supabase.from("checkout_sessions").insert({
    ...row,
    stripe_session_id: null,
  });

  if (error) throw new Error(`Failed to create checkout session: ${error.message}`);
}

export async function attachStripeSessionToGuest(input: {
  checkoutSessionId: string;
  stripeCheckoutSessionId: string;
}) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("checkout_sessions")
    .update({
      stripe_session_id: input.stripeCheckoutSessionId,
      stripe_payment_status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("checkout_session_id", input.checkoutSessionId);

  if (error) {
    console.error("Failed to attach Stripe session:", error);
  }
}

export async function getGuestCheckoutSession(checkoutSessionId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("checkout_sessions")
    .select(
      "customer_name, customer_email, phone, cart_items, status, expires_at, metadata"
    )
    .eq("checkout_session_id", checkoutSessionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  if (data.status === "paid" || data.status === "cancelled") {
    return null;
  }

  const cartItems = Array.isArray(data.cart_items) ? data.cart_items : [];
  const productKey =
    (data.metadata as { product_key?: string } | null)?.product_key ??
    (cartItems[0] as { product_key?: string } | undefined)?.product_key;

  return {
    fullName: data.customer_name ?? "",
    email: data.customer_email ?? "",
    phone: data.phone ?? "",
    productKey: productKey ?? "",
  };
}

export async function findProductByKey(productKey: CheckoutProductKey) {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("products")
    .select("id, name, price_cents, product_key")
    .eq("product_key", productKey)
    .maybeSingle();

  return data;
}
