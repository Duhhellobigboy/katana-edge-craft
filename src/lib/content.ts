import { supabase } from "./supabase";

export const DEFAULT_SITE_CONTENT: Record<string, string> = {
  "home.hero.title": "BUILT FOR Stylers\nWHO cut TO WIN",
  "home.hero.subtitle": "Premium Japanese-inspired professional shears. Engineered for cleaner cuts, smoother blending, and effortless control. Trusted by hairstylists and barbers worldwide.",
  "home.hero.cta": "Shop Now",
  "about.brand.statement": "We believe your shears are an extension of your hand. When they are balanced, sharp, and fit your style, you do better work, faster, with less fatigue. That's why we build every Katana Edge shear with surgical-grade Japanese steel and convex hand-honed blades.",
  "contact.support.email": "hello@katanaedge.com",
  "seo.title": "Katana Edge — Premium Professional Shears & Scissors",
  "seo.description": "Premium Japanese-inspired professional cutting shears. Engineered for cleaner cuts, smoother blending, and effortless control. Trusted by hairstylists and barbers worldwide.",
};

export const DEFAULT_FAQS = [
  { q: "What makes Katana Edge scissors different?", a: "Every Katana Edge shear is forged from premium Japanese-grade steel, hand-honed to a convex edge, and finished to professional tolerances. We make tools, not products." },
  { q: "Are these suitable for beginners?", a: "Yes. Properly balanced, properly tensioned shears actually accelerate skill development. Beginners learn correct hand position faster on professional-grade tools." },
  { q: "How often should I sharpen them?", a: "For full-time professional use, every 6–9 months. We offer free lifetime sharpening for all Katana Edge owners — ship it in, we honor it for life." },
  { q: "What is the return policy?", a: "60-day satisfaction guarantee. Use it. If it isn't right, return it for a full refund — no questions asked." },
  { q: "Do professional stylists use thinning scissors?", a: "Absolutely. Thinning shears (like the Fujisan) are essential for fade blending, weight removal, and creating soft, invisible transitions between sections." },
  { q: "What is Micro Slit used for?", a: "Micro Slit is designed for stable, precise dry and wet hair cutting. Its patent-protected microscopic slits help keep dry hair stable while cutting for clean, controlled results." },
  { q: "Do you ship internationally?", a: "Yes. We ship to 40+ countries with full tracking. Duties and taxes vary by destination." },
  { q: "How long does shipping take?", a: "US: 2–5 business days. International: 5–10 business days. All orders ship within 48 hours." },
  { q: "What's the warranty?", a: "Lifetime structural warranty plus free lifetime sharpening. If the shear ever fails under professional use, we replace it." },
  { q: "Can I buy in bulk for my salon?", a: "Yes. Contact us at hello@katanaedge.com for professional and salon volume pricing." },
];

export const DEFAULT_REVIEWS = [
  { name: "Marcus Vega", role: "Creative Director · Brooklyn", quote: "Fujisan delivers the cleanest blending I've used. My fades and transitions drop into place in a single pass.", rating: 5 },
  { name: "Brenna", role: "Ame Salon", quote: "The Micro Slit is a game-changer for my salon. The micro slits make cutting easier with unmatched sharpness and stability.", rating: 5 },
  { name: "Laura Wright", role: "Laura Studio", quote: "Every haircut feels more precise with Micro Slit. It has transformed my cutting routine and the results speak for themselves.", rating: 5 },
  { name: "Devon Hill", role: "Salon Owner · Chicago", quote: "We outfitted our entire team with Katana Edge. Six months in — still hand-honed sharp. Worth every dollar.", rating: 5 },
  { name: "Sofia Marín", role: "Stylist Educator · Madrid", quote: "I teach with these. The balance and tension dial alone make them perfect for apprentices learning correct hand position.", rating: 5 },
  { name: "James Okafor", role: "Session Stylist · London", quote: "Best investment I've made for my chair in five years. Clients ask about the shears.", rating: 5 },
  { name: "Priya Shah", role: "Senior Stylist · Mumbai", quote: "The convex edge slices through thick textures effortlessly. Total game changer.", rating: 5 },
  { name: "Lena Vogel", role: "Salon Owner · Berlin", quote: "Build quality you can feel. Heavy where it matters, weightless where it counts.", rating: 5 },
  { name: "Carlos Rivera", role: "Master Stylist · Miami", quote: "Lifetime sharpening sealed the deal. These will be with me for my entire career.", rating: 5 },
  { name: "Hannah Chen", role: "Stylist · Vancouver", quote: "Worth every penny. My wrist no longer aches after a 10-hour day.", rating: 5 },
];

export async function fetchSiteContent(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value");

    if (error || !data) {
      return DEFAULT_SITE_CONTENT;
    }

    const content = { ...DEFAULT_SITE_CONTENT };
    data.forEach((row) => {
      content[row.key] = row.value;
    });

    return content;
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function fetchFaqs(): Promise<{ question: string; answer: string }[]> {
  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("question, answer")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_FAQS.map(f => ({ question: f.q, answer: f.a }));
    }

    return data;
  } catch {
    return DEFAULT_FAQS.map(f => ({ question: f.q, answer: f.a }));
  }
}

export async function fetchTestimonials(): Promise<{ name: string; role: string; quote: string; rating: number }[]> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("name, quote, rating, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_REVIEWS.map(r => ({ name: r.name, role: r.role, quote: r.quote, rating: r.rating }));
    }

    // Since our database testimonials table only has name, quote, rating, sort_order,
    // let's parse a default role or handle it gracefully. We fallback role to "Verified Professional" if null.
    return data.map((d: any) => ({
      name: d.name,
      role: d.role || "Verified Professional",
      quote: d.quote,
      rating: d.rating || 5,
    }));
  } catch {
    return DEFAULT_REVIEWS.map(r => ({ name: r.name, role: r.role, quote: r.quote, rating: r.rating }));
  }
}

export async function fetchDbProductBySlug(slug: string, fallbackProduct: any): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return fallbackProduct;
    }

    // Map DB columns to our frontend Product schema
    return {
      slug: data.slug,
      name: data.name,
      tagline: data.tagline || fallbackProduct.tagline,
      price: data.price_cents ? data.price_cents / 100 : fallbackProduct.price,
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
    };
  } catch {
    return fallbackProduct;
  }
}
