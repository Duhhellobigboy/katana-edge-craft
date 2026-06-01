import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Check, Minus, Plus, Star, Shield, Truck, RotateCcw, Award } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { LeadForm } from "@/components/site/LeadForm";
import { ProductCard } from "@/components/site/ProductCard";
import { getProduct, products, type Product } from "@/lib/products";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} — Professional Barber Shears | Katana Edge` },
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

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const [qty, setQty] = useState(1);
  const [showSticky, setShowSticky] = useState(false);
  const cross = products.filter((p) => p.slug !== product.slug);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Layout>
      {/* Hero / gallery */}
      <section className="py-12 md:py-20">
        <div className="container-luxe grid md:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="product-image-wrap aspect-square">
              <img
                src={product.image}
                alt={`${product.name} — professional barber shears`}
                width={1024}
                height={1024}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <button key={i} className="product-image-wrap aspect-square border border-border hover:border-gold transition-colors">
                  <img src={product.image} alt="" width={256} height={256} loading="lazy" className={`w-full h-full object-cover ${i === 0 ? "" : "opacity-60"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">Katana Edge</p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.05]">{product.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground italic">{product.tagline}</p>

            <div className="flex items-center gap-3 mt-5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-gold text-gold" />)}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} · {product.reviewCount.toLocaleString()} verified reviews
              </span>
            </div>

            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-display text-4xl">${product.price}</span>
              {product.compareAt && (
                <>
                  <span className="text-lg text-muted-foreground line-through">${product.compareAt}</span>
                  <span className="text-xs uppercase tracking-[0.18em] bg-gold text-gold-foreground px-2 py-1">
                    Save ${product.compareAt - product.price}
                  </span>
                </>
              )}
            </div>

            <p className="mt-6 text-muted-foreground leading-relaxed">{product.longDescription}</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="size-12 flex items-center justify-center hover:bg-secondary"><Minus className="size-4" /></button>
                <span className="w-12 text-center font-display text-lg">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="size-12 flex items-center justify-center hover:bg-secondary"><Plus className="size-4" /></button>
              </div>
              <button className="btn-gold flex-1">
                Add To Cart — ${product.price * qty}
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="size-3.5 text-gold" /> Secure checkout · 256-bit SSL
            </div>

            <div className="mt-8 grid grid-cols-2 gap-px bg-border border border-border">
              {[
                { i: Truck, t: "Free Shipping", s: "Orders over $99" },
                { i: RotateCcw, t: "60-Day Returns", s: "No questions asked" },
                { i: Award, t: "Lifetime Sharpening", s: "Honored for life" },
                { i: Shield, t: "Guaranteed", s: "Professional grade" },
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

            <div className="mt-8 p-4 border border-gold/30 bg-gold/5 text-sm text-foreground flex items-center gap-3">
              <span className="size-2 rounded-full bg-gold animate-pulse" />
              Only <span className="text-gold font-medium">12 left</span> in this batch — ships within 48 hours.
            </div>
          </div>
        </div>
      </section>

      {/* CINEMATIC VIDEO */}
      <section className="relative py-32 md:py-40 bg-black overflow-hidden border-y border-white/10">
        <div className="absolute inset-0 flex items-center justify-center opacity-60">
           <img src={product.image} className="w-full h-full object-cover blur-sm brightness-50 scale-105" alt="Cinematic video background" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center container-luxe">
           <div className="size-20 rounded-full border border-gold flex items-center justify-center bg-black/40 text-gold cursor-pointer hover:bg-gold hover:text-black transition-colors mb-8">
             <div className="ml-1 w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-current border-b-8 border-b-transparent" />
           </div>
           <h2 className="font-display text-4xl md:text-6xl text-white">Experience <span className="text-gold italic">Precision</span></h2>
           <p className="mt-4 text-white/70 max-w-lg">Watch the {product.name} in action with a master barber.</p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container-luxe">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="eyebrow">Benefits</p>
            <h2 className="font-display text-4xl md:text-5xl mt-4">What you'll feel in the chair</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.benefits.map((b, i) => (
              <div key={b.title} className="p-6 border border-border bg-background">
                <span className="font-display text-3xl text-gold/40">0{i + 1}</span>
                <h3 className="font-display text-2xl mt-3">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES + SPECS */}
      <section className="py-20 md:py-28">
        <div className="container-luxe grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <p className="eyebrow">Features</p>
            <h2 className="font-display text-3xl md:text-5xl mt-4 leading-tight">Engineered detail.</h2>
            <ul className="mt-10 space-y-6">
              {product.features.map((f) => (
                <li key={f.title} className="flex gap-4 pb-6 border-b border-border">
                  <Check className="size-5 text-gold shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display text-xl">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Specifications</p>
            <h2 className="font-display text-3xl md:text-5xl mt-4 leading-tight">Built to tolerance.</h2>
            <dl className="mt-10 divide-y divide-border border-y border-border">
              {product.specs.map((s) => (
                <div key={s.label} className="flex justify-between py-4">
                  <dt className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{s.label}</dt>
                  <dd className="font-display text-lg">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <p className="eyebrow">Professional Use Cases</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.useCases.map((u) => (
                  <span key={u} className="px-4 py-2 text-xs uppercase tracking-[0.18em] border border-border text-muted-foreground">{u}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container-luxe">
          <div className="text-center mb-12">
            <p className="eyebrow">Reviews</p>
            <h2 className="font-display text-4xl md:text-5xl mt-4">What barbers are saying</h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-5 fill-gold text-gold" />)}
              <span className="ml-2 text-sm">{product.rating} from {product.reviewCount.toLocaleString()} reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "Jordan T.", r: "Verified Buyer", b: "Best shear I've owned in 14 years. The balance is unreal." },
              { n: "Lina K.", r: "Verified Buyer", b: "Edge held through 3 months of full books. Worth every penny." },
              { n: "Andre M.", r: "Verified Buyer", b: "Bought one. Came back the next week for the second. Sold." },
            ].map((r) => (
              <div key={r.n} className="p-6 border border-border bg-background">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-gold text-gold" />)}
                </div>
                <p className="text-sm leading-relaxed">"{r.b}"</p>
                <p className="mt-4 text-xs text-muted-foreground">{r.n} · {r.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container-luxe max-w-3xl">
          <div className="text-center mb-12">
            <p className="eyebrow">FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl mt-4">Questions, answered</h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {product.faq.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex justify-between items-center cursor-pointer list-none gap-4">
                  <h3 className="font-display text-xl group-open:text-gold transition-colors">{f.q}</h3>
                  <span className="text-gold text-2xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping & returns */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container-luxe grid md:grid-cols-2 gap-10">
          <div>
            <p className="eyebrow">Shipping</p>
            <h3 className="font-display text-2xl mt-3">Ships within 48 hours</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Free standard shipping on US orders over $99. Express and international options available at checkout. Tracking provided on every order.
            </p>
          </div>
          <div>
            <p className="eyebrow">Returns & Guarantee</p>
            <h3 className="font-display text-2xl mt-3">60-day satisfaction guarantee</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Use it. Test it. If it isn't right, return it within 60 days for a full refund. Every Katana Edge shear is also backed by free lifetime sharpening.
            </p>
          </div>
        </div>
      </section>

      <LeadForm variant="compact" />

      {/* Cross-sell */}
      <section className="py-20 md:py-28">
        <div className="container-luxe">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow">Pairs Perfectly With</p>
              <h2 className="font-display text-4xl md:text-5xl mt-3">Complete the set</h2>
            </div>
            <Link to="/shop" className="hidden md:inline-flex text-sm uppercase tracking-[0.18em] text-gold hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {cross.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      {/* Sticky add to cart */}
      {showSticky && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border animate-fade-up">
          <div className="container-luxe py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img src={product.image} alt="" width={48} height={48} className="size-12 object-cover bg-card hidden sm:block" />
              <div className="min-w-0">
                <p className="font-display text-base md:text-lg truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">${product.price}</p>
              </div>
            </div>
            <button className="btn-gold !py-3">Add To Cart <ArrowRight className="size-4" /></button>
          </div>
        </div>
      )}
    </Layout>
  );
}
