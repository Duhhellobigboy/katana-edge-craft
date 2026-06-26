import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, Sparkles, Hand, Award, Hammer, Users, Star, Quote, Lock, Globe, RotateCcw } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { LeadForm } from "@/components/site/LeadForm";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import heroImg from "@/assets/hero-barber.jpg";
import heroCustomImg from "@/assets/hero-custom.jpg";
import logoImg from "@/assets/logo.jpg";
import craftImg from "@/assets/craft-steel.jpg";
import shopImg from "@/assets/barbershop.jpg";
import { fetchSiteContent, fetchFaqs } from "@/lib/content";
import { getAllDbProducts } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Premium Professional Shears & Scissors | Katana Edge" },
      { name: "description", content: "Premium professional hair shears and texturizing scissors. Japanese-inspired craftsmanship trusted by hairstylists and barbers worldwide." },
      { property: "og:title", content: "Katana Edge — Premium Professional Shears" },
      { property: "og:description", content: "Precision crafted professional shears. Cleaner cuts. Smoother blending. Effortless control." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: async () => {
    const content = await fetchSiteContent();
    const dbProducts = await getAllDbProducts();
    const dbFaqs = await fetchFaqs();
    return { content, products: dbProducts, faqs: dbFaqs };
  },
  component: HomePage,
});

const trustItems = [
  "Professional Grade Steel",
  "Trusted By Stylists",
  "Precision Engineered",
  "Satisfaction Guaranteed",
];

const whyItems = [
  { icon: Sparkles, title: "Precision Cutting", body: "Hand-honed convex edges deliver clean, effortless cuts with exceptional control." },
  { icon: Award, title: "Seki-Inspired Craftsmanship", body: "Drawing from the blade-making heritage of Seki, Japan, every detail is refined for balance and precision." },
  { icon: Hand, title: "Professional Comfort", body: "Offset ergonomics reduce fatigue and support all-day performance." },
  { icon: Shield, title: "Long Lasting Sharpness", body: "Premium steel construction maintains a precise cutting edge through thousands of cuts." },
  { icon: Hammer, title: "Built For Daily Use", body: "Created for professionals who depend on consistency every day." },
  { icon: Users, title: "Trusted Worldwide", body: "Chosen by stylists and barbers across more than 40 countries." },
];

function formatHeroTitle(title: string) {
  const parts = title.split(/(\bcut\b)/i);
  return parts.map((part, i) => {
    if (part.toLowerCase() === "cut") {
      return (
        <span
          key={i}
          className="font-accent text-gold lowercase text-6xl sm:text-7xl md:text-8xl lg:text-[5.8rem] xl:text-[6.5rem] ml-1 mr-2 inline-block -rotate-2 hover:rotate-0 transition-transform duration-300"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

function HomePage() {
  const { content, products, faqs: dbFaqs } = Route.useLoaderData();
  
  const testimonials = [
    { name: "Marcus Vega", role: "Master Barber · Brooklyn", body: "The Fujisan is the cleanest blending shear I've ever picked up. My fades drop into place in a single pass — I'm saving five minutes per client.", rating: 5 },
    { name: "Aiko Tanaka", role: "Stylist · Tokyo", body: "Micro Slit changed my dry-cut work. The grip on the strand is unreal — no slip, no re-cut. Like working with a scalpel.", rating: 5 },
    { name: "Devon Hill", role: "Salon Owner · Chicago", body: "We outfitted our entire team with Katana Edge. Six months in — still hand-honed sharp. Worth every dollar.", rating: 5 },
    { name: "Sofia Marín", role: "Stylist Educator · Madrid", body: "I teach with these. The balance and tension dial alone make them perfect for apprentices learning correct hand position.", rating: 5 },
  ];
  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[95vh] flex items-center bg-[#0B0B0B] overflow-hidden pt-28 pb-16 lg:py-24 washi-texture">
        <div className="container-luxe relative z-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center h-full">
          {/* LEFT SIDE (TEXT & CTA) */}
          <div className="animate-fade-up pt-8 lg:pt-12 lg:pr-4 flex flex-col justify-center">
            {/* Professional Rating / Avatar Group */}
            <div className="flex items-center w-fit mb-6 rounded-full border border-border bg-[#111111] px-3.5 py-1.5 shadow shadow-black/5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Trusted by <strong className="font-medium text-foreground">10K+</strong> stylists.
              </p>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.2rem] leading-[0.9] text-white tracking-tight normal-case whitespace-pre-line">
              {formatHeroTitle(content["home.hero.title"] || "Forged In Tradition.\nBuilt For Modern Stylists.")}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              {content["home.hero.subtitle"] || "Professional shears inspired by generations of Japanese blade craftsmanship and engineered for exceptional precision, balance, and performance."}
            </p>

            {/* Primary CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/products"
                className="btn-gold !py-4 !px-8 text-center"
              >
                {content["home.hero.cta"] || "Apply Now"}
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-between bg-black border border-white/20 hover:border-gold px-6 py-4 transition-all duration-300 group gap-5 w-full sm:w-auto"
              >
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-white group-hover:text-gold transition-colors">
                  Explore The Collection
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
      <section className="py-8 border-y border-border overflow-hidden bg-card washi-texture">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...Array(2)].flatMap((_, i) =>
            ["Trusted Worldwide", "Inspired By Seki Craftsmanship", "Hand-Honed Precision", "Lifetime Sharpening", "Professional Performance", "Trusted Worldwide"].map((t, j) => (
              <span key={`${i}-${j}`} className="text-xs uppercase tracking-[0.32em] text-muted-foreground font-medium">
                {t} <span className="text-gold ml-16">·</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-32 md:py-40 washi-texture">
        <div className="container-luxe">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <p className="eyebrow">The Collection</p>
              <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
                Two Instruments. <span className="italic text-gold">One Philosophy.</span>
              </h2>
            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed text-sm">
              Every Katana Edge shear is designed with purpose, balancing centuries of Japanese blade philosophy with the demands of modern salon work.
            </p>
          </div>

          <div className="mx-auto grid max-w-lg gap-6 sm:max-w-4xl md:grid-cols-2 md:gap-7 lg:max-w-5xl">
            {products.filter((p) => p.featured).map((p) => (
              <ProductCard key={p.slug} product={p} compact />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/products" className="btn-gold inline-flex items-center gap-2 font-semibold">
              Shop All Shears
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY KATANA EDGE */}
      <section className="py-32 md:py-40 bg-card border-y border-border washi-texture">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="eyebrow">Heritage</p>
            <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
              Precision Rooted In Tradition
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
      <section className="relative py-32 md:py-40 overflow-hidden washi-texture">
        <div className="absolute inset-0">
          <img src={craftImg} alt="Premium Japanese steel scissor blade close-up" width={1920} height={1080} loading="lazy" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="container-luxe relative">
          <div className="max-w-2xl">
            <p className="eyebrow">Craftsmanship</p>
            <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
              The Art Behind Every Cut
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              {content["home.brand.statement"] || content["about.brand.statement"] || "We believe a shear should feel like an extension of the hand. Inspired by the traditions of Japanese blade makers, every Katana Edge shear is shaped for precision, balance, and lasting performance."}
            </p>

            <div className="mt-12 space-y-8">
              {[
                { n: "01", t: "Blade Design", d: "Convex geometry engineered for effortless slicing performance." },
                { n: "02", t: "Steel Quality", d: "Premium Japanese steel selected for durability and edge retention." },
                { n: "03", t: "Ergonomics", d: "Balanced architecture designed to support natural movement." },
                { n: "04", t: "Precision Manufacturing", d: "Hand-finished, inspected, and refined to exacting standards." },
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

      {/* SEKI JAPAN HERITAGE */}
      <section className="py-32 md:py-40 border-t border-border bg-[#0B0B0B] washi-texture">
        <div className="container-luxe grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="product-image-wrap aspect-video md:aspect-square max-h-[500px]">
            <img
              src={craftImg}
              alt="Japanese metallurgical sword forging process close-up"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className="eyebrow">Our Heritage</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.1] uppercase">
              Born From The Legacy Of Seki.
            </h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              For more than 700 years, Seki, Japan has been recognized as one of the world's great centers of blade craftsmanship. The same pursuit of precision that guided master swordsmiths continues to inspire the tools we create today.
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Katana Edge draws from this heritage, combining traditional hand-finishing methods with modern engineering to produce shears trusted by professionals around the world. Every edge is refined for exceptional sharpness, lasting performance, and effortless control.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 md:py-40 bg-card border-y border-border washi-texture">
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
      <section className="py-32 md:py-40 washi-texture">
        <div className="container-luxe max-w-4xl">
          <div className="text-center mb-16">
            <p className="eyebrow">Common Questions</p>
            <h2 className="font-display text-4xl md:text-6xl mt-4">Frequently asked</h2>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {dbFaqs.map((f: any) => (
              <details key={f.question} className="group py-6">
                <summary className="flex justify-between items-center cursor-pointer list-none gap-6">
                  <h3 className="font-display text-xl md:text-2xl group-open:text-gold transition-colors">{f.question}</h3>
                  <span className="text-gold text-2xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-40 md:py-48 overflow-hidden border-t border-border washi-texture">
        <div className="absolute inset-0">
          <img src={craftImg} alt="Premium Japanese steel craftsmanship" width={1920} height={1080} loading="lazy" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
        <div className="container-luxe relative text-center max-w-3xl">
          <p className="eyebrow">Master Your Craft</p>
          <h2 className="font-display text-3xl md:text-5xl mt-6 leading-relaxed">
            Experience the precision trusted by professionals and inspired by generations of Japanese blade craftsmanship.
          </h2>
          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            <Link to="/products" className="btn-gold">Explore The Collection <ArrowRight className="size-4" /></Link>
            <Link to="/products" className="btn-ghost-light">Shop Now</Link>
            <a href="#contact" className="btn-ghost-light">
              Talk to a specialist
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
