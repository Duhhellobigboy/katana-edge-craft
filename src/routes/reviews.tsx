import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Star } from "lucide-react";
import { fetchTestimonials } from "@/lib/content";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
              <div
                key={r.name}
                className="luxe-card p-6 bg-card border border-border/40 rounded-sm relative flex flex-col justify-between hover:border-gold/30 transition-all duration-300"
              >
                <div>
                  {/* Instagram-style Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="size-10 border border-border">
                      {r.avatar && <AvatarImage src={r.avatar} alt={r.name} className="object-cover" />}
                      <AvatarFallback className="bg-secondary text-gold font-semibold text-xs">
                        {r.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground leading-snug">{r.name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{r.role}</p>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex gap-0.5 mb-3.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-gold text-gold" />
                    ))}
                  </div>

                  {/* Quote content */}
                  <blockquote className="text-sm text-muted-foreground/90 leading-relaxed font-sans">
                    "{r.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
