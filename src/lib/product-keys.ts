import { APPLY_PRODUCTS, type ApplyProductKey } from "./apply-products";

export const MAX_CHECKOUT_QUANTITY = 20;

/** Maps shop cart slugs to server checkout product keys. */
export const SLUG_TO_PRODUCT_KEY: Record<string, ApplyProductKey> = {
  "micro-slit-shears": "microslit",
  /** @deprecated Legacy cart slug — kept so existing carts still checkout. */
  "micro-slit-scissors": "microslit",
  "fujisan-thinning-shears": "fujisan",
  /** @deprecated Legacy cart slug — kept so existing carts still checkout. */
  "fujisan-thinning-scissors": "fujisan",
};

export function slugToProductKey(slug: string): ApplyProductKey | null {
  return SLUG_TO_PRODUCT_KEY[slug] ?? null;
}

export function clampQuantity(quantity: number): number {
  return Math.min(MAX_CHECKOUT_QUANTITY, Math.max(1, Math.floor(quantity)));
}

export type CheckoutLineItem = {
  productKey: ApplyProductKey;
  quantity: number;
  name: string;
  priceDisplay: string;
};

export function getProductDisplay(productKey: ApplyProductKey) {
  return APPLY_PRODUCTS.find((p) => p.key === productKey);
}

export function buildCheckoutLineItems(
  raw: { productKey: ApplyProductKey; quantity: number }[]
): CheckoutLineItem[] {
  return raw.map(({ productKey, quantity }) => {
    const display = getProductDisplay(productKey);
    return {
      productKey,
      quantity: clampQuantity(quantity),
      name: display?.name ?? productKey,
      priceDisplay: display?.priceDisplay ?? "",
    };
  });
}
