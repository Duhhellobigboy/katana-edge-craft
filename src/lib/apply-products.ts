export const APPLY_PRODUCT_KEYS = ["microslit", "fujisan"] as const;

export type ApplyProductKey = (typeof APPLY_PRODUCT_KEYS)[number];

export type ApplyProduct = {
  key: ApplyProductKey;
  name: string;
  priceDisplay: string;
  description: string;
};

/** Client-safe catalog for /checkout — no Stripe IDs. */
export const APPLY_PRODUCTS: ApplyProduct[] = [
  {
    key: "microslit",
    name: "Micro Slit Shears — L Thumb",
    priceDisplay: "$1,300",
    description: "Professional precision shears for advanced cutting control.",
  },
  {
    key: "fujisan",
    name: "Fujisan Thinning Shears",
    priceDisplay: "$859.99",
    description: "Premium thinning shears for blending, softening, and texture work.",
  },
];
