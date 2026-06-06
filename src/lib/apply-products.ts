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
    name: "Micro Slit",
    priceDisplay: "$1,099.99",
    description:
      "Patent-protected shears designed for stable, precise dry and wet hair cutting.",
  },
  {
    key: "fujisan",
    name: "Fujisan",
    priceDisplay: "$859.99",
    description:
      "Premium thinning shears built for smooth blending, clean movement, and healthier results.",
  },
];
