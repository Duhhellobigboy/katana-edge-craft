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
import thunderVideo from "@/assets/thunder/video.mp4";
import doubleSwivelVideo from "@/assets/double-swivel/video.mp4";
import narutoVideo from "@/assets/naruto/video.mp4";
import karakuriVideo from "@/assets/karakuri/video.mp4";
import bambooVideo from "@/assets/bamboo/video.mp4";
import bambooThinningVideo from "@/assets/bamboo-thinning/video.mp4";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ProductTestimonial = {
  quote: string;
  name: string;
  role: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  variantKey: string;
  sizeLabel?: string;     // maps to Inches selector
  handleLabel?: string;   // maps to Handle selector
  styleLabel?: string;    // maps to Style selector
  sku?: string;
  priceCents: number;
  compareAtCents?: number;
  currency: string;
  active: boolean;
  sortOrder: number;
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
  
  video_url?: string;
  gallery_urls?: string[];
  availability?: "Available" | "Coming Soon";

  // Specification options for UI selectors
  inchesOptions?: string[];
  handleOptions?: string[];
  styleOptions?: string[];
  variants?: ProductVariant[];
};

export const products: Product[] = [
  {
    slug: "micro-slit-shears",
    name: "Micro Slit",
    sku: "364215376135191",
    tagline: "Stable, precise dry and wet cutting.",
    price: 1099.99,
    image: "/products/micro-slit/main.webp",
    gallery: ["/products/micro-slit/main.webp", "/products/micro-slit/detail-1.webp", "/products/micro-slit/detail-2.webp", "/products/micro-slit/detail-3.webp"],
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
    inchesOptions: ["5.5", "6.0", "6.5", "7.0"],
  },
  {
    slug: "fujisan-thinning-shears",
    name: "Fujisan",
    tagline: "Smooth blending. Healthier results.",
    price: 859.99,
    image: "/products/fujisan/main.webp",
    gallery: ["/products/fujisan/main.webp", "/products/fujisan/detail-1.webp", "/products/fujisan/detail-2.webp", "/products/fujisan/detail-3.webp"],
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
    video: thunderVideo,
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
    active: true,
    inchesOptions: ["5.8", "6.25"],
  },
  {
    slug: "double-swivel-shears",
    name: "Double Swivel",
    tagline: "Double axis swivel. Absolute wrist relief.",
    price: 879.99,
    image: "/products/double-swivel/main.webp",
    gallery: ["/products/double-swivel/main.webp"],
    video: doubleSwivelVideo,
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
    active: true,
    inchesOptions: ["5.5", "5.8", "6.3"],
  },
  {
    slug: "naruto-shears",
    name: "Naruto",
    tagline: "Precision blending. Lightweight comfort.",
    price: 579.99,
    image: "/products/naruto/main.webp",
    gallery: ["/products/naruto/main.webp"],
    video: narutoVideo,
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
    active: true,
  },
  {
    slug: "karakuri-shears",
    name: "Karakuri",
    tagline: "Matte black finish. Precision control.",
    price: 719.99,
    image: "/products/karakuri/main.webp",
    gallery: ["/products/karakuri/main.webp"],
    video: karakuriVideo,
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
    active: true,
    inchesOptions: ["5.5", "5.8", "6.3"],
    handleOptions: ["Opposing"],
  },
  {
    slug: "bamboo-shears",
    name: "Bamboo",
    tagline: "Classic balance. Custom jewel tensioner.",
    price: 519.99,
    image: "/products/bamboo/main.webp",
    gallery: ["/products/bamboo/main.webp"],
    video: bambooVideo,
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
    active: true,
    inchesOptions: ["5.5", "6.0", "6.5", "7.0"],
    styleOptions: [],
  },
  {
    slug: "bamboo-thinning-shears",
    name: "Bamboo Thinning Shear",
    tagline: "Eco-conscious blend. Smooth, bulk texturizing.",
    price: 419.99,
    image: "/products/bamboo-thinning/main.webp",
    gallery: ["/products/bamboo-thinning/main.webp"],
    video: bambooThinningVideo,
    rating: 0,
    reviewCount: 0,
    shortDescription: "30 Teeth: Specifically crafted for efficient bulk removal, these shears offer quick and controlled thinning.",
    longDescription: "Designed to handle bulk with precision, the ergonomic construction ensures a comfortable grip, allowing hairstylists to effortlessly create texture and remove excess weight.\n\nThe perfect blend of functionality and eco-conscious design for streamlined hairstyling.",
    shippingHandling: "Every order is prepared with care and precision before shipping. Expect delivery in 6–8 business days. Flat-rate shipping: $20.",
    returnPolicy: "Your satisfaction matters to us. If for any reason you're not happy with your order, you have 7 days from delivery to request a return or exchange. Items must be unused and in original condition.",
    warranty: "Every pair includes a lifetime warranty covering defects in materials or workmanship. If eligible, we will repair or replace the shears at no cost.",
    featured: false,
    bestSeller: false,
    displayOrder: 8,
    active: true,
    inchesOptions: ["6.0"],
    styleOptions: [],
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

    const productDirName = slug === "fujisan-thinning-shears" ? "fujisan" : slug.replace("-shears", "");
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
    let dbProductsData: any[] = [];
    let dbVariants: any[] = [];

    // 1. Try fetching from Supabase
    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      
      const { data, error } = await supabase
        .from("products")
        .select("*");
      if (!error && data) {
        dbProductsData = data;
      }

      // Fetch all public active variants safely (hybrid fallback if not exist)
      try {
        const { data: vData, error: vError } = await supabase
          .from("product_variants_public")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!vError && vData) {
          dbVariants = vData;
        }
      } catch (vErr) {
        console.error("Failed to query product_variants_public, using empty array:", vErr);
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getAllDbProducts, using local/defaults only", err);
    }

    // 2. Read local site-products.json if exists
    let localProducts: Record<string, any> = {};
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = path.resolve(process.cwd(), "src/lib/site-products.json");
      if (fs.existsSync(filePath)) {
        localProducts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch (err) {
      console.error("Error reading site-products.json:", err);
    }

    // 3. Map fallbacks merged with Supabase and local JSON copy overrides
    return Promise.all(
      products.map(async (fallback) => {
        const dbProduct = dbProductsData.find((p) => p.slug === fallback.slug);
        const localProduct = localProducts[fallback.slug];

        const productVariants = dbVariants
          .filter((v) => dbProduct && v.product_id === dbProduct.id)
          .map((v) => ({
            id: v.id,
            productId: v.product_id,
            variantKey: v.variant_key,
            sizeLabel: v.size_label || undefined,
            handleLabel: v.handle_label || undefined,
            styleLabel: v.style_label || undefined,
            priceCents: v.price_cents,
            compareAtCents: v.compare_at_cents || undefined,
            currency: v.currency,
            active: v.active,
            sortOrder: v.sort_order,
          }));

        const name = localProduct?.name || dbProduct?.name || fallback.name;
        const tagline = localProduct?.tagline || dbProduct?.tagline || fallback.tagline;
        const price = dbProduct?.price_cents !== null && dbProduct?.price_cents !== undefined && dbProduct?.price_cents !== 0 ? dbProduct.price_cents / 100 : fallback.price;
        const compareAt = dbProduct?.compare_at_cents ? dbProduct.compare_at_cents / 100 : fallback.compareAt;
        const image = localProduct?.image || dbProduct?.image_url || fallback.image;
        const rating = dbProduct?.rating ? Number(dbProduct.rating) : fallback.rating;
        const reviewCount = dbProduct?.review_count !== null && dbProduct?.review_count !== undefined ? dbProduct.review_count : fallback.reviewCount;
        const shortDescription = localProduct?.shortDescription || dbProduct?.short_description || fallback.shortDescription;
        const longDescription = localProduct?.longDescription || dbProduct?.long_description || fallback.longDescription;
        const features = (localProduct?.features && localProduct.features.length > 0) ? localProduct.features : (Array.isArray(dbProduct?.features) && dbProduct.features.length > 0 ? dbProduct.features : fallback.features);
        const benefits = (localProduct?.benefits && localProduct.benefits.length > 0) ? localProduct.benefits : (Array.isArray(dbProduct?.benefits) && dbProduct.benefits.length > 0 ? dbProduct.benefits : fallback.benefits);
        const specs = (localProduct?.specs && localProduct.specs.length > 0) ? localProduct.specs : (Array.isArray(dbProduct?.specs) && dbProduct.specs.length > 0 ? dbProduct.specs : fallback.specs);
        const faq = (localProduct?.faq && localProduct.faq.length > 0) ? localProduct.faq : (Array.isArray(dbProduct?.faq) && dbProduct.faq.length > 0 ? dbProduct.faq : fallback.faq);
        const active = dbProduct?.active !== null && dbProduct?.active !== undefined ? dbProduct.active : fallback.active;
        const video = localProduct?.videoUrl || dbProduct?.video_url || fallback.video;
        const galleryUrls = localProduct?.galleryUrls || dbProduct?.gallery_urls || undefined;
        const availability = localProduct?.availability || dbProduct?.availability || undefined;

        const baseProduct = {
          ...fallback,
          name,
          tagline,
          price,
          compareAt,
          image,
          rating,
          reviewCount,
          shortDescription,
          longDescription,
          features,
          benefits,
          specs,
          faq,
          active,
          variants: productVariants.length > 0 ? productVariants : undefined,
          video,
          video_url: video,
          gallery_urls: galleryUrls,
          availability,
        };

        const dbGallery = galleryUrls || (dbProduct && Array.isArray(dbProduct.gallery_urls) && dbProduct.gallery_urls.length > 0 ? dbProduct.gallery_urls : null);
        const dynamicGallery = dbGallery || await getDynamicGallery(baseProduct.slug, baseProduct.image, fallback.gallery);

        return {
          ...baseProduct,
          gallery: dynamicGallery,
        };
      })
    );
  });

// Server function to get a single product by slug merged with database values
export const getDbProductBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.string())
  .handler(async ({ data: slug }): Promise<Product> => {
    const fallbackProduct = products.find((p) => p.slug === slug);
    if (!fallbackProduct) {
      throw new Error(`Product not found: ${slug}`);
    }

    let dbProduct: any = null;
    let dbVariants: any[] = [];

    // 1. Try querying Supabase
    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        dbProduct = data;

        // Fetch active variants safely for this specific product (hybrid fallback)
        try {
          const { data: vData, error: vError } = await supabase
            .from("product_variants_public")
            .select("*")
            .eq("product_id", dbProduct.id)
            .order("sort_order", { ascending: true });
          if (!vError && vData) {
            dbVariants = vData;
          }
        } catch (vErr) {
          console.error(`Failed to fetch variants for single product ${slug}:`, vErr);
        }
      }
    } catch (err) {
      console.warn(`Supabase query failed for single product ${slug}, using local/defaults only`, err);
    }

    // 2. Load local site-products.json if exists
    let localProducts: Record<string, any> = {};
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = path.resolve(process.cwd(), "src/lib/site-products.json");
      if (fs.existsSync(filePath)) {
        localProducts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch (err) {
      console.error("Error reading site-products.json:", err);
    }

    const localProduct = localProducts[slug];

    const productVariants = dbVariants.map((v) => ({
      id: v.id,
      productId: v.product_id,
      variantKey: v.variant_key,
      sizeLabel: v.size_label || undefined,
      handleLabel: v.handle_label || undefined,
      styleLabel: v.style_label || undefined,
      priceCents: v.price_cents,
      compareAtCents: v.compare_at_cents || undefined,
      currency: v.currency,
      active: v.active,
      sortOrder: v.sort_order,
    }));

    const name = localProduct?.name || dbProduct?.name || fallbackProduct.name;
    const tagline = localProduct?.tagline || dbProduct?.tagline || fallbackProduct.tagline;
    const price = dbProduct?.price_cents !== null && dbProduct?.price_cents !== undefined && dbProduct?.price_cents !== 0 ? dbProduct.price_cents / 100 : fallbackProduct.price;
    const compareAt = dbProduct?.compare_at_cents ? dbProduct.compare_at_cents / 100 : fallbackProduct.compareAt;
    const image = localProduct?.image || dbProduct?.image_url || fallbackProduct.image;
    const rating = dbProduct?.rating ? Number(dbProduct.rating) : fallbackProduct.rating;
    const reviewCount = dbProduct?.review_count !== null && dbProduct?.review_count !== undefined ? dbProduct.review_count : fallbackProduct.reviewCount;
    const shortDescription = localProduct?.shortDescription || dbProduct?.short_description || fallbackProduct.shortDescription;
    const longDescription = localProduct?.longDescription || dbProduct?.long_description || fallbackProduct.longDescription;
    const features = (localProduct?.features && localProduct.features.length > 0) ? localProduct.features : (Array.isArray(dbProduct?.features) && dbProduct.features.length > 0 ? dbProduct.features : fallbackProduct.features);
    const benefits = (localProduct?.benefits && localProduct.benefits.length > 0) ? localProduct.benefits : (Array.isArray(dbProduct?.benefits) && dbProduct.benefits.length > 0 ? dbProduct.benefits : fallbackProduct.benefits);
    const specs = (localProduct?.specs && localProduct.specs.length > 0) ? localProduct.specs : (Array.isArray(dbProduct?.specs) && dbProduct.specs.length > 0 ? dbProduct.specs : fallbackProduct.specs);
    const faq = (localProduct?.faq && localProduct.faq.length > 0) ? localProduct.faq : (Array.isArray(dbProduct?.faq) && dbProduct.faq.length > 0 ? dbProduct.faq : fallbackProduct.faq);
    const active = dbProduct?.active !== null && dbProduct?.active !== undefined ? dbProduct.active : fallbackProduct.active;
    const video = localProduct?.videoUrl || dbProduct?.video_url || fallbackProduct.video;
    const galleryUrls = localProduct?.galleryUrls || dbProduct?.gallery_urls || undefined;
    const availability = localProduct?.availability || dbProduct?.availability || undefined;

    const baseProduct = {
      ...fallbackProduct,
      name,
      tagline,
      price,
      compareAt,
      image,
      rating,
      reviewCount,
      shortDescription,
      longDescription,
      features,
      benefits,
      specs,
      faq,
      active,
      variants: productVariants.length > 0 ? productVariants : undefined,
      video,
      video_url: video,
      gallery_urls: galleryUrls,
      availability,
    };

    const dbGallery = galleryUrls || (dbProduct && Array.isArray(dbProduct.gallery_urls) && dbProduct.gallery_urls.length > 0 ? dbProduct.gallery_urls : null);
    const dynamicGallery = dbGallery || await getDynamicGallery(baseProduct.slug, baseProduct.image, fallbackProduct.gallery);
    
    return {
      ...baseProduct,
      gallery: dynamicGallery,
    };
  });

// Server function for admin loading (returns raw product rows)
export const getAdminDbProducts = createServerFn({ method: "GET" })
  .handler(async () => {
    let dbProductsData: any[] = [];
    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("*");
      if (!error && data) {
        dbProductsData = data;
      }
    } catch (err) {
      console.warn("Failed to fetch products from Supabase, using defaults for admin", err);
    }

    // Load local site-products.json
    let localProducts: Record<string, any> = {};
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = path.resolve(process.cwd(), "src/lib/site-products.json");
      if (fs.existsSync(filePath)) {
        localProducts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch (err) {
      console.error("Error reading site-products.json for admin", err);
    }

    return products.map((fallback) => {
      const dbProd = dbProductsData.find((p) => p.slug === fallback.slug);
      const localProd = localProducts[fallback.slug];

      return {
        id: dbProd?.id || fallback.slug,
        slug: fallback.slug,
        name: localProd?.name || dbProd?.name || fallback.name,
        tagline: localProd?.tagline || dbProd?.tagline || fallback.tagline,
        price_cents: dbProd?.price_cents || Math.round(fallback.price * 100),
        compare_at_cents: dbProd?.compare_at_cents || (fallback.compareAt ? Math.round(fallback.compareAt * 100) : null),
        image_url: localProd?.image || dbProd?.image_url || fallback.image,
        rating: dbProd?.rating !== undefined ? dbProd.rating : fallback.rating,
        review_count: dbProd?.review_count !== undefined ? dbProd.review_count : fallback.reviewCount,
        short_description: localProd?.shortDescription || dbProd?.short_description || fallback.shortDescription,
        long_description: localProd?.longDescription || dbProd?.long_description || fallback.longDescription,
        features: (localProd?.features && localProd.features.length > 0) ? localProd.features : (dbProd?.features || fallback.features || []),
        benefits: (localProd?.benefits && localProd.benefits.length > 0) ? localProd.benefits : (dbProd?.benefits || fallback.benefits || []),
        specs: (localProd?.specs && localProd.specs.length > 0) ? localProd.specs : (dbProd?.specs || fallback.specs || []),
        faq: (localProd?.faq && localProd.faq.length > 0) ? localProd.faq : (dbProd?.faq || fallback.faq || []),
        active: dbProd?.active !== undefined ? dbProd.active : (fallback.active !== false),
        video_url: localProd?.videoUrl || dbProd?.video_url || fallback.video,
        gallery_urls: localProd?.galleryUrls || dbProd?.gallery_urls || fallback.gallery,
        availability: localProd?.availability || dbProd?.availability || (fallback.active !== false ? "Available" : "Coming Soon"),
      };
    });
  });

