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
import { formatProductPrice, getProduct, products, type Product } from "@/lib/products";
import { MAX_CHECKOUT_QUANTITY } from "@/lib/product-keys";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

import { fetchDbProductBySlug } from "@/lib/content";

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

    const dbProduct = await fetchDbProductBySlug(params.slug, product);
    return { product: dbProduct };
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

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [qty, setQty] = useState(1);
  const [showSticky, setShowSticky] = useState(false);
  const { addItem } = useCart();
  const cross = products.filter((p) => p.slug !== product.slug);
  const descriptionParagraphs = product.longDescription.split("\n\n");

  const galleryItems: GallerySelection[] = [
    ...(product.gallery ?? [product.image]).map(
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

  const handleAddToCart = (quantity: number) => {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
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
            <div className="product-image-wrap aspect-square bg-[#f4f4f4] border border-border/40">
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
                    className={`product-image-wrap aspect-square border transition-colors bg-[#f4f4f4] ${
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

            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-display text-4xl text-gold">
                {formatProductPrice(product.price)}
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
                Add To Cart — {formatProductPrice(product.price * qty)}
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="size-3.5 text-gold" /> Secure checkout · Stripe-hosted payment
            </div>

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

      {showSticky && (
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
                <p className="text-xs text-gold">{formatProductPrice(product.price)}</p>
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
