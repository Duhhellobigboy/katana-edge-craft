import fujisanImg from "@/assets/product-fujisan.jpg";
import microslitImg from "@/assets/product-microslit.jpg";

export type Product = {
  slug: "fujisan-thinning-scissors" | "micro-slit-scissors";
  name: string;
  tagline: string;
  price: number;
  compareAt?: number;
  image: string;
  rating: number;
  reviewCount: number;
  shortDescription: string;
  longDescription: string;
  features: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  useCases: string[];
  specs: { label: string; value: string }[];
  faq: { q: string; a: string }[];
};

export const products: Product[] = [
  {
    slug: "fujisan-thinning-scissors",
    name: "Fujisan Thinning Scissors",
    tagline: "Effortless blending. Invisible transitions.",
    price: 189,
    compareAt: 249,
    image: fujisanImg,
    rating: 4.9,
    reviewCount: 1248,
    shortDescription:
      "Precision-engineered 30-tooth thinning shears for seamless blends, weight removal, and soft texture work.",
    longDescription:
      "The Fujisan is built for the moment between cuts — where a fade becomes a blend, and a blend becomes invisible. Forged from premium 440C Japanese-grade stainless steel and convex-hollow ground, each tooth removes a calibrated 25–30% of hair per pass, giving you total control over weight, movement, and softness.",
    features: [
      { title: "30 V-Cut Teeth", description: "Calibrated 25–30% removal per pass for predictable blends." },
      { title: "440C Japanese-Grade Steel", description: "Hardened to 60 HRC for a long-lasting, hand-honed edge." },
      { title: "Convex Hollow-Ground Blade", description: "Glides through hair with zero pull or push." },
      { title: "Adjustable Tension Dial", description: "Fine-tune resistance to match your hand and rhythm." },
    ],
    benefits: [
      { title: "Cleaner Cuts", description: "Sharper teeth grip and slice — no folding, no chewing, no re-passes." },
      { title: "Better Blending", description: "Eliminate hard fade lines in a single pass and save 3–5 minutes per client." },
      { title: "Greater Comfort", description: "Offset ergonomic handle drops your thumb and unloads wrist tension." },
      { title: "Longer Edge Life", description: "Premium steel holds its edge through thousands of cuts between sharpenings." },
    ],
    useCases: ["Fade blending", "Bulk removal", "Texturizing", "Soft layering"],
    specs: [
      { label: "Length", value: "6.0 inches" },
      { label: "Teeth", value: "30 V-Cut" },
      { label: "Steel", value: "440C Japanese Stainless" },
      { label: "Hardness", value: "60 HRC" },
      { label: "Handle", value: "Offset Ergonomic" },
      { label: "Weight", value: "58g" },
    ],
    faq: [
      { q: "How much hair does the Fujisan remove per pass?", a: "Roughly 25–30% — the sweet spot for blending without leaving visible gaps." },
      { q: "Will it work on fine hair?", a: "Yes. The V-cut tooth profile is gentle enough for fine hair while still effective on coarse, dense textures." },
      { q: "How often should I sharpen it?", a: "Professional use: every 6–9 months. We offer a lifetime sharpening program for all Katana Edge owners." },
    ],
  },
  {
    slug: "micro-slit-scissors",
    name: "Micro Slit Scissors",
    tagline: "Surgical precision. Invisible texture.",
    price: 219,
    compareAt: 279,
    image: microslitImg,
    rating: 4.9,
    reviewCount: 892,
    shortDescription:
      "Micro-serrated straight blades for clean perimeter work, precision detailing, and texturizing without slippage.",
    longDescription:
      "The Micro Slit is what you reach for when the cut has to be perfect. Hundreds of laser-etched micro-serrations grip every strand — preventing the hair from sliding forward — so your line stays exactly where you placed it. Ideal for detail work, dry cutting, and soft point texturizing on the finish.",
    features: [
      { title: "Laser-Etched Micro-Serrations", description: "Hundreds of micro-teeth grip hair instantly — zero slippage." },
      { title: "ATS-314 Cobalt Alloy", description: "Cobalt-infused steel for a razor edge that won't dull on dry hair." },
      { title: "Mirror-Polished Convex Edge", description: "Hand-honed to a 38° convex bevel for clean, push-cut control." },
      { title: "Precision-Tuned Pivot", description: "Smooth, silent action with no play — even after years of daily use." },
    ],
    benefits: [
      { title: "Cleaner Lines", description: "Perimeter, neckline, and bang work stays exactly where you placed it." },
      { title: "Dry-Cut Confidence", description: "Cut dry without fold, push, or pull — finish the shape your client sees." },
      { title: "Faster Detailing", description: "No re-positioning. No re-cutting. Get the line right the first time." },
      { title: "Premium Client Feel", description: "Silent, smooth, weightless — the cut your clients can feel." },
    ],
    useCases: ["Dry cutting", "Perimeter detailing", "Point texturizing", "Precision finishing"],
    specs: [
      { label: "Length", value: "6.0 inches" },
      { label: "Edge", value: "Micro-Serrated" },
      { label: "Steel", value: "ATS-314 Cobalt Alloy" },
      { label: "Hardness", value: "62 HRC" },
      { label: "Handle", value: "Classic Offset" },
      { label: "Weight", value: "62g" },
    ],
    faq: [
      { q: "What are Micro Slit Scissors used for?", a: "Precision dry-cut work — perimeters, fringes, point cutting, and any detail where the hair cannot slip." },
      { q: "Are they suitable for slide cutting?", a: "No. The micro-serrations grip the hair. Use a smooth-blade shear for slide cutting." },
      { q: "Can a beginner use these?", a: "Yes — and we recommend it. The micro-serrations forgive small technique errors and accelerate learning." },
    ],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
