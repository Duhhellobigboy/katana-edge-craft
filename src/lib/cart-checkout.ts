import type { CartItem } from "@/hooks/useCart";
import {
  buildCheckoutLineItems,
  clampQuantity,
  slugToProductKey,
  type CheckoutLineItem,
} from "./product-keys";
import type { ApplyProductKey } from "./apply-products";

export function cartItemsToCheckoutLineItems(
  cartItems: CartItem[]
): CheckoutLineItem[] {
  const merged = new Map<ApplyProductKey, number>();

  for (const item of cartItems) {
    const productKey = slugToProductKey(item.slug);
    if (!productKey) continue;
    merged.set(productKey, (merged.get(productKey) ?? 0) + item.quantity);
  }

  const raw = Array.from(merged.entries()).map(([productKey, quantity]) => ({
    productKey,
    quantity: clampQuantity(quantity),
  }));

  return buildCheckoutLineItems(raw);
}

export function urlParamsToCheckoutLineItems(
  product?: string,
  quantity?: number
): CheckoutLineItem[] {
  if (product !== "microslit" && product !== "fujisan") {
    return [];
  }

  return buildCheckoutLineItems([
    { productKey: product, quantity: clampQuantity(quantity ?? 1) },
  ]);
}
