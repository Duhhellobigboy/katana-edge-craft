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
  "thunder-shears": "thunder",
  "double-swivel-shears": "double_swivel",
  "naruto-shears": "naruto",
  "karakuri-shears": "karakuri",
  "bamboo-shears": "bamboo",
  "bamboo-thinning": "bamboo_thinning",
  "bamboo-thinning-shears": "bamboo_thinning",
};

export function slugToProductKey(slug: string): ApplyProductKey | null {
  return SLUG_TO_PRODUCT_KEY[slug] ?? null;
}

export function clampQuantity(quantity: number): number {
  return Math.min(MAX_CHECKOUT_QUANTITY, Math.max(1, Math.floor(quantity)));
}

export type CheckoutLineItem = {
  productKey: ApplyProductKey;
  variantKey: string;
  quantity: number;
  name: string;
  priceDisplay: string;
  selectedSize?: string;
  selectedHandle?: string;
  selectedStyle?: string;
  sku?: string;
};

export function getProductDisplay(productKey: ApplyProductKey) {
  return APPLY_PRODUCTS.find((p) => p.key === productKey);
}

export function buildCheckoutLineItems(
  raw: { productKey: ApplyProductKey; quantity: number; variantKey?: string }[]
): CheckoutLineItem[] {
  return raw.map(({ productKey, quantity, variantKey }) => {
    const display = getProductDisplay(productKey);
    return {
      productKey,
      variantKey: variantKey ?? productKey,
      quantity: clampQuantity(quantity),
      name: display?.name ?? productKey,
      priceDisplay: display?.priceDisplay ?? "",
    };
  });
}
