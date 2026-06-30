import { getEnvVar, ensureServerEnv } from "./env.server";
export { getSiteUrl } from "./env.server";

export const CHECKOUT_PRODUCT_KEYS = [
  "microslit",
  "fujisan",
  "thunder",
  "double_swivel",
  "naruto",
  "karakuri",
  "bamboo",
  "bamboo_thinning"
] as const;
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
    thunder: {
      name: "Thunder",
      priceId: getEnvVar("STRIPE_THUNDER_PRICE_ID") || "",
      productId: getEnvVar("STRIPE_THUNDER_PRODUCT_ID") || undefined,
    },
    double_swivel: {
      name: "Double Swivel",
      priceId: getEnvVar("STRIPE_DOUBLE_SWIVEL_PRICE_ID") || "",
      productId: getEnvVar("STRIPE_DOUBLE_SWIVEL_PRODUCT_ID") || undefined,
    },
    naruto: {
      name: "Naruto",
      priceId: getEnvVar("STRIPE_NARUTO_PRICE_ID") || "",
      productId: getEnvVar("STRIPE_NARUTO_PRODUCT_ID") || undefined,
    },
    karakuri: {
      name: "Karakuri",
      priceId: getEnvVar("STRIPE_KARAKURI_PRICE_ID") || "",
      productId: getEnvVar("STRIPE_KARAKURI_PRODUCT_ID") || undefined,
    },
    bamboo: {
      name: "Bamboo",
      priceId: getEnvVar("STRIPE_BAMBOO_PRICE_ID") || "",
      productId: getEnvVar("STRIPE_BAMBOO_PRODUCT_ID") || undefined,
    },
    bamboo_thinning: {
      name: "Bamboo Thinning",
      priceId: getEnvVar("STRIPE_BAMBOO_THINNING_PRICE_ID") || "",
      productId: getEnvVar("STRIPE_BAMBOO_THINNING_PRODUCT_ID") || undefined,
    },
  };
}

export function isCheckoutProductKey(value: string): value is CheckoutProductKey {
  return CHECKOUT_PRODUCT_KEYS.includes(value as CheckoutProductKey);
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
    if (CHECKOUT_PRODUCT_KEYS.includes(prop as CheckoutProductKey)) {
      return getProducts()[prop as CheckoutProductKey];
    }
    return undefined;
  },
});
