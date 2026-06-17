export const APPLY_PRODUCT_KEYS = [
  "microslit",
  "fujisan",
  "thunder",
  "double_swivel",
  "naruto",
  "karakuri",
  "bamboo",
  "bamboo_thinning"
] as const;

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
  {
    key: "thunder",
    name: "Thunder",
    priceDisplay: "$679.99",
    description: "Heavy-duty slicing shears optimized for thick textures and raw power.",
  },
  {
    key: "double_swivel",
    name: "Double Swivel",
    priceDisplay: "$879.99",
    description: "Double-articulating swivel-handle shears offering maximum ergonomic comfort and wrist relief.",
  },
  {
    key: "naruto",
    name: "Naruto",
    priceDisplay: "$579.99",
    description: "Ergonomic thinning shears with custom circular cutouts for smooth blending.",
  },
  {
    key: "karakuri",
    name: "Karakuri",
    priceDisplay: "$719.99",
    description: "Professional offsets shears featuring a tactical matte black handle coating.",
  },
  {
    key: "bamboo",
    name: "Bamboo",
    priceDisplay: "$519.99",
    description: "Classic straight shears fitted with a green-jewel tension adjuster.",
  },
  {
    key: "bamboo_thinning",
    name: "Bamboo Thinning",
    priceDisplay: "$419.99",
    description: "30 Teeth: Specifically crafted for efficient bulk removal, these shears offer quick and controlled thinning.",
  },
];
