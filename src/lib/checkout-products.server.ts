import { getEnvVar, ensureServerEnv } from "./env.server";
export { getSiteUrl } from "./env.server";

export const CHECKOUT_PRODUCT_KEYS = ["microslit", "fujisan"] as const;
export type CheckoutProductKey = (typeof CHECKOUT_PRODUCT_KEYS)[number];

type CheckoutProductConfig = {
  name: string;
  priceId: string;
  productId: string | undefined;
};

function getProducts(): Record<CheckoutProductKey, CheckoutProductConfig> {
  ensureServerEnv();

  return {
    microslit: {
      name: "Micro Slit",
      priceId: getEnvVar("STRIPE_MICROSLIT_PRICE_ID"),
      productId: getEnvVar("STRIPE_MICROSLIT_PRODUCT_ID") || undefined,
    },
    fujisan: {
      name: "Fujisan",
      priceId: getEnvVar("STRIPE_FUJISAN_PRICE_ID"),
      productId: getEnvVar("STRIPE_FUJISAN_PRODUCT_ID") || undefined,
    },
  };
}

export function isCheckoutProductKey(value: string): value is CheckoutProductKey {
  return value === "microslit" || value === "fujisan";
}

export function resolveCheckoutProduct(productKey: CheckoutProductKey) {
  const product = getProducts()[productKey];
  if (!product.priceId) {
    throw new Error(`Missing Stripe price ID env var for product: ${productKey}`);
  }
  return product;
}

/** @deprecated Use resolveCheckoutProduct — kept for webhook imports */
export const PRODUCTS = new Proxy({} as Record<CheckoutProductKey, CheckoutProductConfig>, {
  get(_target, prop: string) {
    if (prop === "microslit" || prop === "fujisan") {
      return getProducts()[prop];
    }
    return undefined;
  },
});
