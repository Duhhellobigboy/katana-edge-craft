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
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


export type ProductTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export type Product = {
  slug: string;
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
  
  featured?: boolean;
  bestSeller?: boolean;
  displayOrder?: number;
  active?: boolean;
};

export const products: Product[] = [
  {
    slug: "micro-slit-shears",
    name: "Micro Slit",
    sku: "364215376135191",
    tagline: "Stable, precise dry and wet cutting.",
    price: 1099.99,
    image: microslitImg1,
    gallery: [microslitImg1, microslitImg2, fujisanImg2, microslitImg3],
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
    featured: true,
    bestSeller: true,
    displayOrder: 1,
  },
  {
    slug: "fujisan-thinning-shears",
    name: "Fujisan",
    tagline: "Smooth blending. Healthier results.",
    price: 859.99,
    image: fujisanImg1,
    gallery: [fujisanImg1, fujisanImg2, microslitImg2, fujisanImg4],
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
    featured: true,
    bestSeller: true,
    displayOrder: 2,
  },
  {
    slug: "thunder-shears",
    name: "Thunder",
    tagline: "Heavy-duty power. Smooth slices.",
    price: 679.99,
    image: "/products/thunder/main.webp",
    gallery: ["/products/thunder/main.webp"],
    rating: 0,
    reviewCount: 0,
    shortDescription: "Heavy-duty slicing shears optimized for thick textures and raw power.",
    longDescription: "Thunder is engineered with thick, leaf-shaped convex blades designed to slide through dense bulk texturing effortlessly.",
    shippingHandling: "Every order is prepared with care and precision before shipping. Delivery time: 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy: "Customers have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty: "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
    featured: false,
    bestSeller: false,
    displayOrder: 3,
    active: false,
  },
  {
    slug: "double-swivel-shears",
    name: "Double Swivel",
    tagline: "Double axis swivel. Absolute wrist relief.",
    price: 879.99,
    image: "/products/double-swivel/main.webp",
    gallery: ["/products/double-swivel/main.webp"],
    rating: 0,
    reviewCount: 0,
    shortDescription: "Double-articulating swivel-handle shears offering maximum ergonomic comfort and wrist relief.",
    longDescription: "Double Swivel features two fully independent rotating joints on the thumb ring to reduce repetitive strain injuries.",
    shippingHandling: "Every order is prepared with care and precision before shipping. Delivery time: 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy: "Customers have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty: "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
    featured: false,
    bestSeller: false,
    displayOrder: 4,
    active: false,
  },
  {
    slug: "naruto-shears",
    name: "Naruto",
    tagline: "Precision blending. Lightweight comfort.",
    price: 579.99,
    image: "/products/naruto/main.webp",
    gallery: ["/products/naruto/main.webp"],
    rating: 0,
    reviewCount: 0,
    shortDescription: "Ergonomic thinning shears with custom circular cutouts for smooth blending.",
    longDescription: "Naruto integrates hollowed blade cutouts to decrease weight while maintaining perfect tension for slide and weight reduction cuts.",
    shippingHandling: "Every order is prepared with care and precision before shipping. Delivery time: 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy: "Customers have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty: "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
    featured: false,
    bestSeller: false,
    displayOrder: 5,
    active: false,
  },
  {
    slug: "karakuri-shears",
    name: "Karakuri",
    tagline: "Matte black finish. Precision control.",
    price: 719.99,
    image: "/products/karakuri/main.webp",
    gallery: ["/products/karakuri/main.webp"],
    rating: 0,
    reviewCount: 0,
    shortDescription: "Professional offsets shears featuring a tactical matte black handle coating.",
    longDescription: "Karakuri combines structural stiffness with offset rings to protect wrists during heavy, block-style hair cuts.",
    shippingHandling: "Every order is prepared with care and precision before shipping. Delivery time: 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy: "Customers have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty: "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
    featured: false,
    bestSeller: false,
    displayOrder: 6,
    active: false,
  },
  {
    slug: "bamboo-shears",
    name: "Bamboo",
    tagline: "Classic balance. Custom jewel tensioner.",
    price: 519.99,
    image: "/products/bamboo/main.webp",
    gallery: ["/products/bamboo/main.webp"],
    rating: 0,
    reviewCount: 0,
    shortDescription: "Classic straight shears fitted with a green-jewel tension adjuster.",
    longDescription: "Bamboo offers a balanced body and convex edge that excels at wet blunt cutting and solid line construction.",
    shippingHandling: "Every order is prepared with care and precision before shipping. Delivery time: 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy: "Customers have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty: "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
    featured: false,
    bestSeller: false,
    displayOrder: 7,
    active: false,
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

// Helper to build a product gallery dynamically by checking filesystem for detail-*.webp images
async function getDynamicGallery(
  slug: string,
  fallbackImage: string,
  fallbackGallery?: string[],
): Promise<string[]> {
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");

    // For legacy products using src/assets, return their fallback gallery
    if (slug === "micro-slit-shears" || slug === "fujisan-thinning-shears") {
      return fallbackGallery || [fallbackImage];
    }

    const productDirName = slug.replace("-shears", "");
    const publicDir = path.resolve(process.cwd(), "public/products", productDirName);

    if (!fs.existsSync(publicDir)) {
      return [fallbackImage];
    }

    const gallery = [fallbackImage];
    for (let i = 1; i <= 4; i++) {
      const file = `detail-${i}.webp`;
      const filePath = path.join(publicDir, file);
      if (fs.existsSync(filePath)) {
        gallery.push(`/products/${productDirName}/${file}`);
      }
    }
    return gallery;
  } catch (err) {
    console.error("Error building dynamic gallery:", err);
    return [fallbackImage];
  }
}

// Server function to get all products merged with database values (bypassing client RLS)
export const getAllDbProducts = createServerFn({ method: "GET" })
  .handler(async (): Promise<Product[]> => {
    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error || !data || data.length === 0) {
        return Promise.all(
          products.map(async (fallback) => ({
            ...fallback,
            gallery: await getDynamicGallery(fallback.slug, fallback.image, fallback.gallery),
          }))
        );
      }

      return Promise.all(
        products.map(async (fallback) => {
          const dbProduct = data.find((p) => p.slug === fallback.slug);
          const baseProduct = dbProduct ? {
            ...fallback,
            name: dbProduct.name,
            tagline: dbProduct.tagline || fallback.tagline,
            price: dbProduct.price_cents !== null && dbProduct.price_cents !== undefined && dbProduct.price_cents !== 0 ? dbProduct.price_cents / 100 : fallback.price,
            compareAt: dbProduct.compare_at_cents ? dbProduct.compare_at_cents / 100 : fallback.compareAt,
            image: dbProduct.image_url || fallback.image,
            rating: dbProduct.rating ? Number(dbProduct.rating) : fallback.rating,
            reviewCount: dbProduct.review_count !== null && dbProduct.review_count !== undefined ? dbProduct.review_count : fallback.reviewCount,
            shortDescription: dbProduct.short_description || fallback.shortDescription,
            longDescription: dbProduct.long_description || fallback.longDescription,
            features: Array.isArray(dbProduct.features) && dbProduct.features.length > 0 ? dbProduct.features : fallback.features,
            benefits: Array.isArray(dbProduct.benefits) && dbProduct.benefits.length > 0 ? dbProduct.benefits : fallback.benefits,
            useCases: Array.isArray(dbProduct.use_cases) && dbProduct.use_cases.length > 0 ? dbProduct.use_cases : fallback.useCases,
            specs: Array.isArray(dbProduct.specs) && dbProduct.specs.length > 0 ? dbProduct.specs : fallback.specs,
            faq: Array.isArray(dbProduct.faq) && dbProduct.faq.length > 0 ? dbProduct.faq : fallback.faq,
            active: dbProduct.active !== null && dbProduct.active !== undefined ? dbProduct.active : fallback.active,
          } : fallback;

          const dynamicGallery = await getDynamicGallery(baseProduct.slug, baseProduct.image, fallback.gallery);
          return {
            ...baseProduct,
            gallery: dynamicGallery,
          };
        })
      );
    } catch (err) {
      console.error("Error in getAllDbProducts server function:", err);
      return Promise.all(
        products.map(async (fallback) => ({
          ...fallback,
          gallery: await getDynamicGallery(fallback.slug, fallback.image, fallback.gallery),
        }))
      );
    }
  });

// Server function to get a single product by slug merged with database values
export const getDbProductBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data: slug }): Promise<Product> => {
    const fallbackProduct = products.find((p) => p.slug === slug);
    if (!fallbackProduct) {
      throw new Error(`Product not found: ${slug}`);
    }
    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        return {
          ...fallbackProduct,
          gallery: await getDynamicGallery(fallbackProduct.slug, fallbackProduct.image, fallbackProduct.gallery),
        };
      }

      const baseProduct = {
        ...fallbackProduct,
        name: data.name,
        tagline: data.tagline || fallbackProduct.tagline,
        price: data.price_cents !== null && data.price_cents !== undefined && data.price_cents !== 0 ? data.price_cents / 100 : fallbackProduct.price,
        compareAt: data.compare_at_cents ? data.compare_at_cents / 100 : fallbackProduct.compareAt,
        image: data.image_url || fallbackProduct.image,
        rating: data.rating ? Number(data.rating) : fallbackProduct.rating,
        reviewCount: data.review_count !== null && data.review_count !== undefined ? data.review_count : fallbackProduct.reviewCount,
        shortDescription: data.short_description || fallbackProduct.shortDescription,
        longDescription: data.long_description || fallbackProduct.longDescription,
        features: Array.isArray(data.features) && data.features.length > 0 ? data.features : fallbackProduct.features,
        benefits: Array.isArray(data.benefits) && data.benefits.length > 0 ? data.benefits : fallbackProduct.benefits,
        useCases: Array.isArray(data.use_cases) && data.use_cases.length > 0 ? data.use_cases : fallbackProduct.useCases,
        specs: Array.isArray(data.specs) && data.specs.length > 0 ? data.specs : fallbackProduct.specs,
        faq: Array.isArray(data.faq) && data.faq.length > 0 ? data.faq : fallbackProduct.faq,
        active: data.active !== null && data.active !== undefined ? data.active : fallbackProduct.active,
      };

      const dynamicGallery = await getDynamicGallery(baseProduct.slug, baseProduct.image, fallbackProduct.gallery);
      return {
        ...baseProduct,
        gallery: dynamicGallery,
      };
    } catch (err) {
      console.error(`Error in getDbProductBySlug server function for ${slug}:`, err);
      return {
        ...fallbackProduct,
        gallery: await getDynamicGallery(fallbackProduct.slug, fallbackProduct.image, fallbackProduct.gallery),
      };
    }
  });

// Server function for admin loading (returns raw product rows)
export const getAdminDbProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("*");
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error in getAdminDbProducts server function:", err);
      throw err;
    }
  });

