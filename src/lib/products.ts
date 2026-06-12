import fujisanImg1 from "@/assets/fujisan/fujisan-1.png";
import fujisanImg2 from "@/assets/fujisan/fujisan-2.png";
import fujisanImg3 from "@/assets/fujisan/fujisan-3.png";
import fujisanImg4 from "@/assets/fujisan/fujisan-4.png";
import fujisanVideo from "@/assets/fujisan/fujisan.mp4";
import microslitImg1 from "@/assets/microslit/microslit-1.png";
import microslitImg2 from "@/assets/microslit/microslit-2.png";
import microslitImg3 from "@/assets/microslit/microslit-3.png";
import microslitImg4 from "@/assets/microslit/microslit-4.png";
import microslitVideo from "@/assets/microslit/microslit.mp4";

export type ProductTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export type Product = {
  slug: "fujisan-thinning-shears" | "micro-slit-shears";
  name: string;
  sku?: string;
  tagline: string;
  price: number;
  compareAt?: number;
  image: string;
  /** Extra gallery images for the product detail page only. */
  gallery?: string[];
  /** Optional product video for the detail page gallery. */
  video?: string;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  longDescription: string;
  shippingHandling: string;
  returnPolicy: string;
  warranty: string;
  testimonials?: ProductTestimonial[];
  features?: { title: string; description: string }[];
  benefits?: { title: string; description: string }[];
  useCases?: { title: string; description: string }[];
  specs?: { label: string; value: string }[];
  faq?: { q: string; a: string }[];
};

export const products: Product[] = [
  {
    slug: "micro-slit-shears",
    name: "Micro Slit",
    sku: "364215376135191",
    tagline: "Stable, precise dry and wet cutting.",
    price: 1099.99,
    image: microslitImg1,
    gallery: [microslitImg1, microslitImg2, microslitImg3],
    video: microslitVideo,
    rating: 4.9,
    reviewCount: 892,
    shortDescription:
      "Patent-protected shears designed for stable, precise dry and wet hair cutting.",
    longDescription:
      "After years of testing different blade materials and shapes, Micro Slit was created as a better solution for dry hair cutting. Its patent-protected microscopic slits are laser-cut into one side of the blade to help keep dry hair stable while cutting.\n\nDesigned with flat screws and a refined professional finish, Micro Slit delivers precise, comfortable, and effortless cutting for both dry and wet hair.",
    shippingHandling:
      "Every order is prepared with care and precision before shipping. Delivery time: 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy:
      "Customers have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty:
      "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
    testimonials: [
      {
        quote:
          "The Micro Slit is a game-changer for my salon. The micro slits make cutting easier with unmatched sharpness and stability. It has become my go-to for both dry and wet hair.",
        name: "Brenna",
        role: "Ame Salon",
      },
      {
        quote:
          "Every haircut feels more precise with Micro Slit. It has transformed my cutting routine and the results speak for themselves.",
        name: "Laura Wright",
        role: "Laura Studio",
      },
    ],
  },
  {
    slug: "fujisan-thinning-shears",
    name: "Fujisan",
    tagline: "Smooth blending. Healthier results.",
    price: 859.99,
    image: fujisanImg1,
    gallery: [fujisanImg1, fujisanImg2, fujisanImg3, fujisanImg4],
    video: fujisanVideo,
    rating: 4.9,
    reviewCount: 1248,
    shortDescription:
      "Premium thinning shears built for smooth blending, clean movement, and healthier results.",
    longDescription:
      "Fujisan is designed to upgrade precision cutting while protecting hair health. The custom-grooved design helps create a smooth, jam-free cut, while rounded corner teeth allow clean movement through the hair.\n\nBuilt for professional stylists and barbers, Fujisan helps reduce stress during blending, softening, and texture work.",
    shippingHandling:
      "Every order is prepared with care and precision before shipping. Delivery time: 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy:
      "Customers have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty:
      "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export function formatProductPrice(price: number) {
  return price.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** Avoid floating-point drift (e.g. 1099.99 × 6 → 6599.9400000000005). */
export function sumMoneyAmounts(
  amounts: { unitPrice: number; quantity: number }[],
): number {
  const cents = amounts.reduce(
    (total, { unitPrice, quantity }) =>
      total + Math.round(unitPrice * 100) * quantity,
    0,
  );
  return cents / 100;
}
