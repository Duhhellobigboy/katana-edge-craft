export const CHECKOUT_CONFIG_CLIENT_MESSAGE =
  "Checkout is not configured correctly. Please contact support.";

export const INVALID_STRIPE_SECRET_KEY_MESSAGE =
  "Invalid STRIPE_SECRET_KEY in Vercel environment variables. It must be the raw Stripe secret key beginning with sk_test_ or sk_live_.";

const CONFIG_ERROR_MARKERS = [
  "Invalid STRIPE_SECRET_KEY",
  "Missing STRIPE_SECRET_KEY",
  "Missing Stripe price ID",
  "Missing server-side Supabase",
  "must start with sk_test_",
  "publishable key",
  CHECKOUT_CONFIG_CLIENT_MESSAGE,
];

export function isCheckoutConfigError(message: string): boolean {
  return CONFIG_ERROR_MARKERS.some((marker) => message.includes(marker));
}

export function toClientCheckoutError(serverMessage: string): string {
  return isCheckoutConfigError(serverMessage)
    ? CHECKOUT_CONFIG_CLIENT_MESSAGE
    : serverMessage;
}
