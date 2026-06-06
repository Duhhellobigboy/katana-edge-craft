import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, Sparkles, Hand, Award, Hammer, Users, Star, Lock, Globe, RotateCcw } from "lucide-react";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { Layout } from "@/components/site/Layout";
import { LeadForm } from "@/components/site/LeadForm";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import heroImg from "@/assets/hero-barber.jpg";
import heroCustomImg from "@/assets/hero-custom.jpg";
import logoImg from "@/assets/logo.jpg";
import craftImg from "@/assets/craft-steel.jpg";
import shopImg from "@/assets/barbershop.jpg";
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
  {
    quote:
      "The Fujisan is the cleanest blending shear I've ever picked up. My fades drop into place in a single pass — I'm saving five minutes per client.",
    name: "Marcus Vega",
    designation: "Master Barber · Brooklyn",
    src: "https://images.unsplash.com/photo-1622286342621-4bd786c244b8?q=80&w=1368&auto=format&fit=crop",
  },
  {
    quote:
      "Micro Slit changed my dry-cut work. The grip on the strand is unreal — no slip, no re-cut. Like working with a scalpel.",
    name: "Aiko Tanaka",
    designation: "Stylist · Tokyo",
    src: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1368&auto=format&fit=crop",
  },
  {
    quote:
      "We outfitted our entire team with Katana Edge. Six months in — still hand-honed sharp. Worth every dollar.",
    name: "Devon Hill",
    designation: "Salon Owner · Chicago",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1368&auto=format&fit=crop",
  },
  {
    quote:
      "I teach with these. The balance and tension dial alone make them perfect for apprentices learning correct hand position.",
    name: "Sofia Marín",
    designation: "Stylist Educator · Madrid",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1368&auto=format&fit=crop",
  },
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
      <section className="relative min-h-[95vh] flex items-center bg-[#0a0a0a] overflow-hidden pt-28 pb-16 lg:py-24">
        <div className="container-luxe relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center h-full">
          {/* LEFT SIDE (TEXT & CTA) */}
          <div className="animate-fade-up pt-8 lg:pt-12 lg:pr-4 flex flex-col justify-center">
            {/* Professional Barber Rating / Avatar Group */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
                  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100&h=100",
                ].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Barber avatar"
                    className="size-8 rounded-full border border-black object-cover"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white tracking-wide">4.9 / 5</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-3 fill-gold text-gold" />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1 hidden sm:inline">10K+ Barbers Globally</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.2rem] leading-[0.9] text-white tracking-tight uppercase">
              BUILT FOR BARBERS
              <span className="block mt-2">
                WHO <span className="font-accent text-gold lowercase text-6xl sm:text-7xl md:text-8xl lg:text-[5.8rem] xl:text-[6.5rem] ml-1 mr-2 inline-block -rotate-2 hover:rotate-0 transition-transform duration-300">cut</span> TO WIN.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Elite thinning and micro slit scissors for cleaner control, smoother blends, and sharper finishes.
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/products"
                className="btn-gold !py-4 !px-8 text-center"
              >
                Apply Now
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-between bg-black border border-white/20 hover:border-gold px-6 py-4 transition-all duration-300 group gap-5 w-full sm:w-auto"
              >
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-white group-hover:text-gold transition-colors">
                  SHOP THE STORE
                </span>
                <div className="h-6 w-px bg-white/10" />
                <img
                  src={logoImg}
                  alt="Katana Edge Badge"
                  className="h-8 w-auto object-contain"
                  style={{ filter: "invert(1) brightness(1.2)", mixBlendMode: "screen" }}
                />
              </Link>
            </div>

              {/* Security & shipping trust labels */}
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.18em] text-white/50">
              <div className="flex items-center gap-2">
                <Lock className="size-3.5 text-gold" />
                <span>SECURE CHECKOUT</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-3.5 text-gold" />
                <span>WORLDWIDE SHIPPING</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="size-3.5 text-gold" />
                <span>EASY RETURNS</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (CRAFTSMAN VISUAL & LIVE REVIEW OVERLAY) */}
          <div className="relative animate-fade-up lg:h-[75vh] flex items-center justify-center">
            <div className="relative w-full aspect-[4/5] lg:h-full lg:w-auto max-h-[640px] overflow-hidden rounded-sm border border-white/5 group shadow-2xl">
              {/* Dark overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-85 z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent z-10" />
              <img
                src={heroCustomImg}
                alt="Katana Edge custom craftsman in front of manufacturing facility"
                className="w-full h-full object-cover object-center transition-transform duration-[2000ms] group-hover:scale-103"
                loading="eager"
              />

              {/* Floating Testimonial Overlay - TOPG-style */}
              <div className="absolute top-6 left-6 right-6 z-20 bg-black/85 backdrop-blur-md border border-white/10 p-5 rounded-sm shadow-xl transition-all duration-300 hover:border-gold/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-6 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                    <span className="text-[10px] font-bold text-gold">M</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">MARCUS V.</span>
                </div>
                <p className="text-[11px] md:text-xs text-white/80 italic leading-relaxed font-sans">
                  "These scissors are unreal. Razor sharp, perfect balance, and they don't slip. Best investment I've made for my chair in years."
                </p>
              </div>
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

          <div className="mx-auto grid max-w-lg gap-6 sm:max-w-4xl md:grid-cols-2 md:gap-7 lg:max-w-5xl">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} compact />
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
          <div
            className="relative mx-auto flex items-center justify-center"
            style={{ maxWidth: "1024px" }}
          >
            <CircularTestimonials
              testimonials={testimonials}
              autoplay={true}
              colors={{
                name: "#f7f7ff",
                designation: "#e1e1e1",
                testimony: "#f1f1f7",
                arrowBackground: "#d4af37",
                arrowForeground: "#141414",
                arrowHoverBackground: "#f7f7ff",
              }}
              fontSizes={{
                name: "28px",
                designation: "20px",
                quote: "20px",
              }}
            />
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
            <Link to="/products" className="btn-gold">Join Now <ArrowRight className="size-4" /></Link>
            <Link to="/products" className="btn-ghost-light">Shop Now</Link>
            <a href="tel:+13163682814" className="btn-ghost-light">Talk to a specialist</a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
