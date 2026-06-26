import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Minus,
  Play,
  Plus,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Award,
} from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { LeadForm } from "@/components/site/LeadForm";
import { ProductCard } from "@/components/site/ProductCard";
import { formatProductPrice, getProduct, products, type Product, getDbProductBySlug, getAllDbProducts } from "@/lib/products";
import { MAX_CHECKOUT_QUANTITY, slugToProductKey } from "@/lib/product-keys";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    if (params.slug === "micro-slit-scissors") {
      throw redirect({
        to: "/products/$slug",
        params: { slug: "micro-slit-shears" },
      });
    }
    if (params.slug === "fujisan-thinning-scissors") {
      throw redirect({
        to: "/products/$slug",
        params: { slug: "fujisan-thinning-shears" },
      });
    }

    const product = getProduct(params.slug);
    if (!product) throw notFound();

    const dbProduct = await getDbProductBySlug({ data: params.slug });
    const dbProducts = await getAllDbProducts();
    return { product: dbProduct, allProducts: dbProducts };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} — Professional Shears | Katana Edge` },
      { name: "description", content: loaderData.product.shortDescription },
      { property: "og:title", content: loaderData.product.name },
      { property: "og:description", content: loaderData.product.shortDescription },
      { property: "og:type", content: "product" },
      { property: "og:url", content: `/products/${loaderData.product.slug}` },
      { property: "og:image", content: loaderData.product.image },
    ] : [],
    links: loaderData ? [{ rel: "canonical", href: `/products/${loaderData.product.slug}` }] : [],
    scripts: loaderData ? [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: loaderData.product.name,
        description: loaderData.product.shortDescription,
        image: loaderData.product.image,
        sku: loaderData.product.sku,
        brand: { "@type": "Brand", name: "Katana Edge" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: loaderData.product.rating,
          reviewCount: loaderData.product.reviewCount,
        },
        offers: {
          "@type": "Offer",
          price: loaderData.product.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      }),
    }] : [],
  }),
  component: ProductPage,
});

type GallerySelection =
  | { type: "image"; src: string }
  | { type: "video"; src: string };

function splitLongDescription(text: string): string[] {
  if (!text) return [];
  const trimmed = text.trim();
  const paragraphs = trimmed.split(/\n\s*\n/).filter(Boolean);
  if (paragraphs.length > 1) {
    return paragraphs;
  }
  
  // It's a single paragraph, let's split it cleanly if it matches one of our known products
  if (trimmed.includes("Thunder is engineered with thick, leaf-shaped convex blades designed to slide through dense bulk texturing effortlessly.")) {
    return [
      "Thunder is engineered with thick, leaf-shaped convex blades.",
      "They are designed to slide through dense bulk texturing effortlessly."
    ];
  }
  if (trimmed.includes("Double Swivel features two fully independent rotating joints on the thumb ring to reduce repetitive strain injuries.")) {
    return [
      "Double Swivel features two fully independent rotating joints on the thumb ring.",
      "These rotating joints work to reduce repetitive strain injuries."
    ];
  }
  if (trimmed.includes("Naruto integrates hollowed blade cutouts to decrease weight while maintaining perfect tension for slide and weight reduction cuts.")) {
    return [
      "Naruto integrates hollowed blade cutouts to decrease weight.",
      "This design maintains perfect tension for slide and weight reduction cuts."
    ];
  }
  if (trimmed.includes("Karakuri combines structural stiffness with offset rings to protect wrists during heavy, block-style hair cuts.")) {
    return [
      "Karakuri combines structural stiffness with offset rings.",
      "This combination helps protect wrists during heavy, block-style hair cuts."
    ];
  }
  if (trimmed.includes("Bamboo offers a balanced body and convex edge that excels at wet blunt cutting and solid line construction.")) {
    return [
      "Bamboo offers a balanced body and convex edge.",
      "This configuration excels at wet blunt cutting and solid line construction."
    ];
  }

  // Fallback split for any other single-paragraph text matching our keywords
  const splitKeywords = [
    { key: " designed to ", replacement: [".\n\nThey are designed to ", ".\n\nDesigned to "] },
    { key: " to reduce ", replacement: [".\n\nThese work to reduce ", ".\n\nTo reduce "] },
    { key: " to decrease ", replacement: [".\n\nThis is designed to decrease ", ".\n\nTo decrease "] },
    { key: " to protect ", replacement: [".\n\nThis helps to protect ", ".\n\nTo protect "] },
    { key: " that excels at ", replacement: [".\n\nThis excels at ", ".\n\nThat excels at "] }
  ];

  for (const item of splitKeywords) {
    if (trimmed.includes(item.key)) {
      const parts = trimmed.split(item.key);
      if (parts.length === 2) {
        const first = parts[0].trim();
        const second = parts[1].trim();
        const ending = first.endsWith(".") ? "" : ".";
        const newText = `${first}${ending}\n\n${item.replacement[0].replace(".\n\n", "")}${second}`;
        return newText.split(/\n\s*\n/).filter(Boolean);
      }
    }
  }

  // If there are multiple sentences, split after the first or middle sentence
  const sentences = trimmed.split(/(?<=\.)\s+/);
  if (sentences.length >= 2) {
    const mid = Math.ceil(sentences.length / 2);
    return [
      sentences.slice(0, mid).join(" "),
      sentences.slice(mid).join(" ")
    ];
  }

  return [trimmed];
}

function ProductPage() {
  const { product, allProducts } = Route.useLoaderData() as { product: Product; allProducts: Product[] };
  const [qty, setQty] = useState(1);
  const [showSticky, setShowSticky] = useState(false);
  const { addItem } = useCart();

  // Selected option states
  const [selectedInches, setSelectedInches] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedHandle, setSelectedHandle] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState(product.price);

  // Initialize fixed options and reset selection on product changes
  useEffect(() => {
    if (product.handleOptions && product.handleOptions.length > 0) {
      setSelectedHandle(product.handleOptions[0]);
    } else {
      setSelectedHandle("");
    }
    setSelectedInches("");
    setSelectedStyle("");
  }, [product]);

  // Dynamically update pricing based on selected variant options
  useEffect(() => {
    const match = product.variants?.find(v => {
      const sizeMatch = !product.inchesOptions || v.sizeLabel === selectedInches;
      const handleMatch = !product.handleOptions || v.handleLabel === selectedHandle;
      const styleMatch = !product.styleOptions || v.styleLabel === selectedStyle;
      return sizeMatch && handleMatch && styleMatch;
    });
    if (match) {
      setCurrentPrice(match.priceCents / 100);
    } else {
      setCurrentPrice(product.price);
    }
  }, [selectedInches, selectedStyle, selectedHandle, product]);
  
  // Cross-sell only the first 2 other products from database to fit layout
  const cross = allProducts
    .filter((p) => p.slug !== product.slug)
    .slice(0, 2);
    
  const descriptionParagraphs = splitLongDescription(product.longDescription);

  // Filter out empty and duplicate images for clean single-image gallery display
  const uniqueGallery = Array.from(
    new Set(
      [
        ...(product.gallery && product.gallery.length > 0 ? product.gallery : [product.image])
      ].filter(Boolean)
    )
  );

  const galleryItems: GallerySelection[] = [
    ...uniqueGallery.map(
      (src): GallerySelection => ({ type: "image", src })
    ),
    ...(product.video ? [{ type: "video" as const, src: product.video }] : []),
  ];

  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const selectedGallery = galleryItems[selectedGalleryIndex] ?? galleryItems[0];

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const canPurchase = product.active !== false;

  const handleAddToCart = (quantity: number) => {
    if (!canPurchase) {
      toast.error("This product is Coming Soon or unavailable for purchase.");
      return;
    }

    // Validation: Enforce Inches selection
    if (product.inchesOptions && product.inchesOptions.length > 0 && !selectedInches) {
      toast.error("Please select a size under Inches.");
      return;
    }

    // Validation: Enforce Style selection
    if (product.styleOptions && product.styleOptions.length > 0 && !selectedStyle) {
      toast.error("Please select a style.");
      return;
    }

    // Resolve variantKey
    let variantKey = product.slug === "fujisan-thinning-shears" ? "fujisan" :
                     product.slug === "naruto-shears" ? "naruto" : "";
    let sku = product.sku || "";
    let finalPrice = currentPrice;

    if (!variantKey) {
      // Find matches in product.variants
      const match = product.variants?.find(v => {
        const sizeMatch = !product.inchesOptions || v.sizeLabel === selectedInches;
        const handleMatch = !product.handleOptions || v.handleLabel === selectedHandle;
        const styleMatch = !product.styleOptions || v.styleLabel === selectedStyle;
        return sizeMatch && handleMatch && styleMatch;
      });

      if (match) {
        variantKey = match.variantKey;
        sku = match.sku || "";
        finalPrice = match.priceCents / 100;
      } else {
        // Fallback key matching naming convention
        const baseKey = product.slug.replace("-shears", "").replace("-thinning", "").replace("-", "_");
        const sizePart = selectedInches ? `_${selectedInches.replace(".", "")}` : "";
        const stylePart = selectedStyle ? `_${selectedStyle.toLowerCase().replace(/\s+/g, "_")}` : "";
        const handlePart = selectedHandle ? `_${selectedHandle.toLowerCase()}` : "";
        variantKey = `${baseKey}${sizePart}${handlePart}${stylePart}`;
      }
    }

    addItem(
      {
        slug: product.slug,
        productKey: slugToProductKey(product.slug) || (product.slug.replace("-shears", "").replace("-thinning", "").replace("-", "_") as any),
        variantKey,
        name: product.name,
        price: finalPrice,
        image: product.image,
        selectedSize: selectedInches || undefined,
        selectedHandle: selectedHandle || undefined,
        selectedStyle: selectedStyle || undefined,
        sku: sku || undefined,
      },
      quantity
    );

    toast.success(
      quantity > 1
        ? `Added ${quantity} × ${product.name} to cart`
        : `Added ${product.name} to cart`
    );
  };

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container-luxe grid md:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="product-image-wrap aspect-square border border-border/40">
              {selectedGallery?.type === "video" ? (
                <video
                  key={selectedGallery.src}
                  src={selectedGallery.src}
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                  aria-label={`${product.name} product video`}
                />
              ) : (
                <img
                  src={selectedGallery?.src ?? product.image}
                  alt={`${product.name} — Katana Edge professional shears`}
                  width={1024}
                  height={1024}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            {galleryItems.length > 1 && (
              <div
                className={`grid gap-3 ${
                  galleryItems.length >= 5 ? "grid-cols-5" : "grid-cols-4"
                }`}
              >
                {galleryItems.map((item, i) => (
                  <button
                    key={`${item.type}-${item.src}`}
                    type="button"
                    onClick={() => setSelectedGalleryIndex(i)}
                    className={`product-image-wrap aspect-square border transition-colors ${
                      selectedGalleryIndex === i
                        ? "border-gold"
                        : "border-border hover:border-gold/60"
                    }`}
                    aria-label={
                      item.type === "video"
                        ? `View ${product.name} video`
                        : `View ${product.name} photo ${i + 1}`
                    }
                  >
                    {item.type === "video" ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-black">
                        <Play className="size-6 text-gold" />
                      </div>
                    ) : (
                      <img
                        src={item.src}
                        alt=""
                        width={256}
                        height={256}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="eyebrow">Katana Edge</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.05]">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{product.shortDescription}</p>

            {product.sku && (
              <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                SKU: <span className="text-white font-mono">{product.sku}</span>
              </p>
            )}

            {product.reviewCount !== undefined && product.reviewCount > 0 && (
              <div className="flex items-center gap-3 mt-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} · {product.reviewCount.toLocaleString()} verified reviews
                </span>
              </div>
            )}

            <div className={`${product.reviewCount !== undefined && product.reviewCount > 0 ? "mt-8" : "mt-5"} flex items-baseline gap-4`}>
              <span className="font-display text-4xl text-gold">
                {formatProductPrice(currentPrice)}
              </span>
              {product.compareAt && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.compareAt}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] bg-gold text-gold-foreground px-2 py-1">
                    Save ${product.compareAt - product.price}
                  </span>
                </>
              )}
            </div>

            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {/* Sizing (Inches) Selector */}
            {product.inchesOptions && product.inchesOptions.length > 0 && (
              <div className="mt-6 space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                  Inches <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedInches}
                    onChange={(e) => setSelectedInches(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-sm focus:outline-none focus:border-gold rounded-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select Inches</option>
                    {product.inchesOptions.map((inch) => (
                      <option key={inch} value={inch}>
                        {inch}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Handle Options (fixed display-only label) */}
            {product.handleOptions && product.handleOptions.length > 0 && (
              <div className="mt-4 space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Handle
                </label>
                <div className="bg-[#111] border border-border/20 py-2.5 px-4 text-sm rounded-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {product.handleOptions[0]}
                </div>
              </div>
            )}

            {/* Style Selector */}
            {product.styleOptions && (
              <div className="mt-4 space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                  Style <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    disabled={product.styleOptions.length === 0}
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-border py-2.5 px-4 text-sm focus:outline-none focus:border-gold rounded-sm disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                  >
                    {product.styleOptions.length === 0 ? (
                      <option value="">Select Style (Pending Configuration)</option>
                    ) : (
                      <>
                        <option value="">Select Style</option>
                        {product.styleOptions.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {!canPurchase ? (
              <div className="mt-8">
                <button
                  type="button"
                  disabled
                  className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center animate-pulse"
                >
                  COMING SOON
                </button>
                <p className="mt-3 text-xs text-center text-muted-foreground">
                  Checkout will become available when this product launches.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-8 flex items-center gap-4">
                  <div>
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                        className="size-12 flex items-center justify-center hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-12 text-center font-display text-lg">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(Math.min(MAX_CHECKOUT_QUANTITY, qty + 1))}
                        disabled={qty >= MAX_CHECKOUT_QUANTITY}
                        className="size-12 flex items-center justify-center hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Maximum {MAX_CHECKOUT_QUANTITY} per product.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-gold flex-1"
                    onClick={() => handleAddToCart(qty)}
                  >
                    Add To Cart — {formatProductPrice(currentPrice * qty)}
                    <ArrowRight className="size-4" />
                  </button>
                </div>

                <div className="mt-4 text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Shield className="size-3.5 text-gold" /> Secure checkout · Stripe-hosted payment
                </div>
              </>
            )}

            <div className="mt-8 grid grid-cols-2 gap-px bg-border border border-border">
              {[
                { i: Truck, t: "Shipping", s: "6–8 business days · $20 flat rate" },
                { i: RotateCcw, t: "Returns", s: "7 days from delivery" },
                { i: Award, t: "Warranty", s: "Lifetime coverage" },
                { i: Shield, t: "Prepared With Care", s: "Every order inspected" },
              ].map((b) => (
                <div key={b.t} className="bg-card p-4 flex items-center gap-3">
                  <b.i className="size-4 text-gold shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium">{b.t}</p>
                    <p className="text-muted-foreground">{b.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-card border-y border-border">
        <div className="container-luxe grid md:grid-cols-3 gap-10">
          <div>
            <p className="eyebrow">Shipping & Handling</p>
            <h2 className="font-display text-2xl md:text-3xl mt-3">Prepared with precision</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {product.shippingHandling}
            </p>
          </div>
          <div>
            <p className="eyebrow">Return Policy</p>
            <h2 className="font-display text-2xl md:text-3xl mt-3">7-day returns</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {product.returnPolicy}
            </p>
          </div>
          <div>
            <p className="eyebrow">Warranty</p>
            <h2 className="font-display text-2xl md:text-3xl mt-3">Lifetime coverage</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {product.warranty}
            </p>
          </div>
        </div>
      </section>

      {product.testimonials && product.testimonials.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container-luxe">
            <div className="text-center mb-12">
              <p className="eyebrow">Testimonials</p>
              <h2 className="font-display text-4xl md:text-5xl mt-4">
                What professionals are saying
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {product.testimonials.map((t) => (
                <div key={t.name} className="p-6 md:p-8 border border-border bg-card">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">"{t.quote}"</p>
                  <p className="mt-4 text-xs text-muted-foreground uppercase tracking-widest">
                    {t.name} · {t.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <LeadForm variant="compact" />

      <section className="py-20 md:py-28 border-t border-border">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow">Pairs Perfectly With</p>
              <h2 className="font-display text-4xl md:text-5xl mt-3">Complete the set</h2>
            </div>
            <Link
              to="/products"
              className="hidden md:inline-flex text-sm uppercase tracking-[0.18em] text-gold hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {cross.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {showSticky && canPurchase && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border animate-fade-up">
          <div className="container-luxe py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.image}
                alt=""
                width={48}
                height={48}
                className="size-12 object-cover bg-card hidden sm:block"
              />
              <div className="min-w-0">
                <p className="font-display text-base md:text-lg truncate">{product.name}</p>
                <p className="text-xs text-gold">{formatProductPrice(currentPrice)}</p>
              </div>
            </div>
            <button type="button" className="btn-gold !py-3" onClick={() => handleAddToCart(1)}>
              Add To Cart <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
