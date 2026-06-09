import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Star, Quote } from "lucide-react";
import { fetchTestimonials } from "@/lib/content";

export const Route = createFileRoute("/reviews")({
  loader: () => fetchTestimonials(),
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

function ReviewsPage() {
  const reviews = Route.useLoaderData();

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
                <blockquote className="font-display text-lg leading-snug">"{r.quote}"</blockquote>
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
