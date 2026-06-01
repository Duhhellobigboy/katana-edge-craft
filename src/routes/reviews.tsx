import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Star, Quote } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — What Barbers Say About Katana Edge Scissors" },
      { name: "description", content: "Read verified reviews from professional barbers and stylists using Katana Edge premium thinning shears and barber scissors." },
      { property: "og:title", content: "Katana Edge Reviews" },
      { property: "og:url", content: "/reviews" },
    ],
    links: [{ rel: "canonical", href: "/reviews" }],
  }),
  component: ReviewsPage,
});

const reviews = [
  { name: "Marcus Vega", role: "Master Barber · Brooklyn", body: "The Fujisan is the cleanest blending shear I've ever picked up. My fades drop into place in a single pass.", rating: 5 },
  { name: "Aiko Tanaka", role: "Stylist · Tokyo", body: "Micro Slit changed my dry-cut work. The grip on the strand is unreal — no slip, no re-cut. Like working with a scalpel.", rating: 5 },
  { name: "Devon Hill", role: "Salon Owner · Chicago", body: "We outfitted our entire team with Katana Edge. Six months in — still hand-honed sharp. Worth every dollar.", rating: 5 },
  { name: "Sofia Marín", role: "Stylist Educator · Madrid", body: "I teach with these. The balance and tension dial alone make them perfect for apprentices learning correct hand position.", rating: 5 },
  { name: "James Okafor", role: "Barber · London", body: "Best investment I've made for my chair in five years. Clients ask about the shears.", rating: 5 },
  { name: "Priya Shah", role: "Stylist · Mumbai", body: "The convex edge slices through Indian textures effortlessly. Total game changer.", rating: 5 },
  { name: "Lena Vogel", role: "Salon Owner · Berlin", body: "Build quality you can feel. Heavy where it matters, weightless where it counts.", rating: 5 },
  { name: "Carlos Rivera", role: "Master Barber · Miami", body: "Lifetime sharpening sealed the deal. These will be with me for my entire career.", rating: 5 },
  { name: "Hannah Chen", role: "Stylist · Vancouver", body: "Worth every penny. My wrist no longer aches after a 10-hour day.", rating: 5 },
];

function ReviewsPage() {
  return (
    <Layout>
      <section className="py-24 md:py-32 border-b border-border">
        <div className="container-luxe text-center max-w-3xl">
          <p className="eyebrow">Reviews</p>
          <h1 className="font-display text-5xl md:text-7xl mt-6 leading-[1]">
            Trusted by <span className="italic text-gold">professionals.</span>
          </h1>
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-6 fill-gold text-gold" />)}
            <span className="ml-3 text-lg">4.9 / 5 · 2,140+ verified reviews</span>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-luxe">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <figure key={r.name} className="luxe-card p-8 relative">
                <Quote className="absolute top-6 right-6 size-7 text-gold/20" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-gold text-gold" />)}
                </div>
                <blockquote className="font-display text-lg leading-snug">"{r.body}"</blockquote>
                <figcaption className="mt-6 pt-6 border-t border-border">
                  <p className="font-medium text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em] mt-1">{r.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
