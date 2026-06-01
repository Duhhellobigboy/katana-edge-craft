import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, Sparkles, Hand, Award, Hammer, Users, Star, Quote } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { LeadForm } from "@/components/site/LeadForm";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import heroImg from "@/assets/hero-barber.jpg";
import craftImg from "@/assets/craft-steel.jpg";
import shopImg from "@/assets/barbershop.jpg";
import resultsImg from "@/assets/results-blending.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Professional Barber Scissors & Shears | Katana Edge" },
      { name: "description", content: "Premium professional barber scissors, thinning shears, and texturizing scissors. Japanese-inspired craftsmanship trusted by barbers and stylists worldwide." },
      { property: "og:title", content: "Katana Edge — Professional Barber Scissors" },
      { property: "og:description", content: "Precision crafted barber and stylist shears. Cleaner cuts. Smoother blending. Professional control." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const trustItems = [
  "Professional Grade Steel",
  "Trusted By Barbers",
  "Precision Engineered",
  "Satisfaction Guaranteed",
];

const whyItems = [
  { icon: Sparkles, title: "Precision Cutting", body: "Hand-honed convex edges deliver glass-clean cuts with zero pull, zero push." },
  { icon: Award, title: "Japanese-Inspired Design", body: "Forms refined over generations of craft — distilled into a working tool." },
  { icon: Hand, title: "Professional Comfort", body: "Offset ergonomics drop your thumb and unload wrist tension across long days." },
  { icon: Shield, title: "Long Lasting Sharpness", body: "60–62 HRC hardened steel holds its edge through thousands of cuts." },
  { icon: Hammer, title: "Built For Daily Use", body: "Engineered for the chair — not the showroom. Reliable cut after cut." },
  { icon: Users, title: "Trusted By Professionals", body: "Used in barbershops and salons in 40+ countries. Backed by a lifetime guarantee." },
];

const testimonials = [
  { name: "Marcus Vega", role: "Master Barber · Brooklyn", body: "The Fujisan is the cleanest blending shear I've ever picked up. My fades drop into place in a single pass — I'm saving five minutes per client.", rating: 5 },
  { name: "Aiko Tanaka", role: "Stylist · Tokyo", body: "Micro Slit changed my dry-cut work. The grip on the strand is unreal — no slip, no re-cut. Like working with a scalpel.", rating: 5 },
  { name: "Devon Hill", role: "Salon Owner · Chicago", body: "We outfitted our entire team with Katana Edge. Six months in — still hand-honed sharp. Worth every dollar.", rating: 5 },
  { name: "Sofia Marín", role: "Stylist Educator · Madrid", body: "I teach with these. The balance and tension dial alone make them perfect for apprentices learning correct hand position.", rating: 5 },
];

const faqs = [
  { q: "What makes Katana Edge scissors different?", a: "Every Katana Edge shear is forged from premium Japanese-grade steel, hand-honed to a convex edge, and finished to professional tolerances — the same standards used by master craftsmen for generations." },
  { q: "Are these suitable for beginners?", a: "Yes. The precision engineering actually accelerates skill development — beginners learn correct hand position faster with a properly balanced, properly tensioned shear." },
  { q: "How often should I sharpen them?", a: "For full-time professional use, every 6–9 months. We offer lifetime sharpening for all Katana Edge owners — ship it in, we honor it free for life." },
  { q: "What is the return policy?", a: "60-day no-questions-asked return on any unused shear. If you've used it and it isn't right, we'll exchange it or sharpen it on the house." },
  { q: "Do professional barbers use thinning scissors?", a: "Absolutely. Thinning shears (like the Fujisan) are essential for fade blending, weight removal, and creating soft, invisible transitions between sections." },
  { q: "What are Micro Slit Scissors used for?", a: "Precision dry-cut work — perimeters, fringes, point cutting, and any detail where the hair cannot be allowed to slip forward in the blade." },
];

function HomePage() {
  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Professional barber cutting hair with premium Katana Edge shears"
            width={1920}
            height={1280}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>

        <div className="container-luxe relative pb-20 md:pb-32 pt-32">
          <div className="max-w-3xl animate-fade-up">
            <p className="eyebrow">Precision Crafted · Professionally Trusted</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mt-6">
              Professional Barber Scissors
              <span className="block text-gold italic">Built For Precision</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Designed for barbers and stylists who demand sharper cuts, smoother blending, and superior control on every client.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/products/$slug" params={{ slug: "fujisan-thinning-scissors" }} className="btn-gold">
                Shop Fujisan Thinning <ArrowRight className="size-4" />
              </Link>
              <Link to="/products/$slug" params={{ slug: "micro-slit-scissors" }} className="btn-ghost-light">
                Shop Micro Slit <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
              {trustItems.map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Check className="size-4 text-gold shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-8 border-y border-border overflow-hidden bg-card">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...Array(2)].flatMap((_, i) =>
            ["440C Japanese Steel", "60 HRC Hardness", "Hand-Honed Edge", "Lifetime Sharpening", "Free Shipping", "60-Day Returns", "Trusted in 40+ Countries"].map((t, j) => (
              <span key={`${i}-${j}`} className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                {t} <span className="text-gold ml-16">·</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-24 md:py-32">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <p className="eyebrow">The Collection</p>
              <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
                Two tools. <span className="italic text-gold">Endless cuts.</span>
              </h2>
            </div>
            <p className="text-muted-foreground max-w-md">
              Each Katana Edge shear is engineered for a specific role in the chair — and built to a single uncompromising standard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY KATANA EDGE */}
      <section className="py-24 md:py-32 bg-card border-y border-border">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="eyebrow">Why Katana Edge</p>
            <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
              Engineered for the working professional
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {whyItems.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-card p-10 hover:bg-background transition-colors group">
                <div className="size-12 rounded-sm border border-border group-hover:border-gold group-hover:text-gold transition-colors flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display text-2xl mt-6">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFESSIONAL RESULTS */}
      <section className="py-24 md:py-32">
        <div className="container-luxe">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="product-image-wrap aspect-[4/5]">
              <img src={resultsImg} alt="Professional barber blending a fade with Katana Edge shears" width={1080} height={1350} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="eyebrow">Professional Results</p>
              <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
                The cuts speak <span className="italic text-gold">for themselves.</span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                From invisible fade blends to surgical perimeter work, Katana Edge tools are built to give you the cuts your clients book you for — and the consistency that keeps them coming back.
              </p>
              <div className="mt-10 space-y-px bg-border">
                {[
                  { label: "Blending", value: "Single-pass fade transitions" },
                  { label: "Texturizing", value: "Calibrated weight removal" },
                  { label: "Thinning", value: "Soft, invisible reduction" },
                  { label: "Precision Finishing", value: "Razor-clean perimeter lines" },
                ].map((r) => (
                  <div key={r.label} className="bg-background flex items-center justify-between py-4">
                    <span className="font-display text-xl">{r.label}</span>
                    <span className="text-sm text-muted-foreground">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRAFTSMANSHIP */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img src={craftImg} alt="Premium Japanese steel scissor blade close-up" width={1920} height={1080} loading="lazy" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-2xl">
            <p className="eyebrow">Craftsmanship</p>
            <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
              Every cut starts with <span className="italic text-gold">better tools.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We don't manufacture scissors. We forge instruments — refined through centuries of Japanese metallurgical tradition and shaped for the modern professional's hand.
            </p>

            <div className="mt-12 space-y-8">
              {[
                { n: "01", t: "Blade Design", d: "Convex hollow-ground edge. Geometry that slices rather than crushes." },
                { n: "02", t: "Steel Quality", d: "440C and ATS-314 cobalt alloy. Hardened to 60–62 HRC for sustained edge retention." },
                { n: "03", t: "Ergonomics", d: "Offset handle architecture engineered to reduce thumb and wrist strain." },
                { n: "04", t: "Precision Manufacturing", d: "Each shear is hand-honed, hand-tested, and serialized before it ships." },
              ].map((s) => (
                <div key={s.n} className="flex gap-6 group">
                  <span className="font-display text-3xl text-gold/50 group-hover:text-gold transition-colors">{s.n}</span>
                  <div>
                    <h3 className="font-display text-2xl">{s.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 bg-card border-y border-border">
        <div className="container-luxe">
          <div className="text-center mb-16">
            <p className="eyebrow">Trusted By Professionals</p>
            <h2 className="font-display text-4xl md:text-6xl mt-4">What the chair says</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <figure key={t.name} className="luxe-card p-8 md:p-10 relative">
                <Quote className="absolute top-6 right-6 size-8 text-gold/20" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="font-display text-xl md:text-2xl leading-snug">"{t.body}"</blockquote>
                <figcaption className="mt-6 pt-6 border-t border-border">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mt-1">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <LeadForm variant="compact" />

      {/* FAQ */}
      <section className="py-24 md:py-32">
        <div className="container-luxe max-w-4xl">
          <div className="text-center mb-16">
            <p className="eyebrow">Common Questions</p>
            <h2 className="font-display text-4xl md:text-6xl mt-4">Frequently asked</h2>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex justify-between items-center cursor-pointer list-none gap-6">
                  <h3 className="font-display text-xl md:text-2xl group-open:text-gold transition-colors">{f.q}</h3>
                  <span className="text-gold text-2xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 md:py-40 overflow-hidden border-t border-border">
        <div className="absolute inset-0">
          <img src={shopImg} alt="Premium barbershop interior" width={1920} height={1080} loading="lazy" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
        <div className="container-luxe relative text-center max-w-3xl">
          <p className="eyebrow">Upgrade Your Craft</p>
          <h2 className="font-display text-5xl md:text-7xl mt-6 leading-[0.95]">
            Upgrade your <span className="italic text-gold">cutting experience.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Join the professionals who trust Katana Edge every day.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link to="/shop" className="btn-gold">Shop Now <ArrowRight className="size-4" /></Link>
            <a href="tel:+13163682814" className="btn-ghost-light">Talk to a specialist</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
