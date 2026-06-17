import type { CartItem } from "@/hooks/useCart";
import {
  clampQuantity,
  slugToProductKey,
  type CheckoutLineItem,
} from "./product-keys";

export function cartItemsToCheckoutLineItems(
  cartItems: CartItem[]
): CheckoutLineItem[] {
  return cartItems.map((item) => {
    const productKey = slugToProductKey(item.slug) || "microslit";
    
    // Format name to include selected Inches option label if available
    const nameWithOpts = item.selectedSize
      ? `${item.name} (${item.selectedSize})`
      : item.name;

    return {
      productKey,
      variantKey: item.variantKey,
      quantity: clampQuantity(item.quantity),
      name: nameWithOpts,
      priceDisplay: (item.price * item.quantity).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      selectedSize: item.selectedSize,
      selectedHandle: item.selectedHandle,
      selectedStyle: item.selectedStyle,
      sku: item.sku,
    };
  });
}

export function urlParamsToCheckoutLineItems(
  product?: string,
  quantity?: number
): CheckoutLineItem[] {
  if (product !== "microslit" && product !== "fujisan") {
    return [];
  }

  const name = product === "microslit" ? "Micro Slit" : "Fujisan";
  const price = product === "microslit" ? 1099.99 : 859.99;
  const qty = clampQuantity(quantity ?? 1);

  return [
    {
      productKey: product as any,
      variantKey: product, // legacy direct checkout redirects to base product variant
      quantity: qty,
      name,
      priceDisplay: (price * qty).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
    },
  ];
}
