import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Professional Barber Scissors & Shears | Katana Edge" },
      { name: "description", content: "Browse premium professional barber scissors and thinning shears. Fujisan Thinning Scissors and Micro Slit Scissors — engineered for working professionals." },
      { property: "og:title", content: "Shop Katana Edge Scissors" },
      { property: "og:description", content: "Premium thinning shears and micro-serrated barber scissors." },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <Layout>
      <section className="py-20 md:py-28 border-b border-border">
        <div className="container-luxe text-center max-w-2xl">
          <p className="eyebrow">The Collection</p>
          <h1 className="font-display text-5xl md:text-7xl mt-4 leading-tight">
            Shop <span className="italic text-gold">Katana Edge</span>
          </h1>
          <p className="mt-6 text-muted-foreground">
            Two professional-grade shears. Built for the chair, refined for the hand, guaranteed for life.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-luxe grid md:grid-cols-2 gap-8">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </Layout>
  );
}
