import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import craftImg from "@/assets/craft-steel.jpg";
import shopImg from "@/assets/barbershop.jpg";

import { fetchSiteContent } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Katana Edge — Premium Professional Shears" },
      { name: "description", content: "Katana Edge crafts premium shears and scissors for hairstylists and barbers, inspired by centuries of Seki metallurgical tradition. Built for daily professional use." },
      { property: "og:title", content: "About Katana Edge" },
      { property: "og:description", content: "Precision crafted. Stylist trusted." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  loader: async () => {
    const content = await fetchSiteContent();
    return { content };
  },
  component: AboutPage,
});

function AboutPage() {
  const { content } = Route.useLoaderData();
  return (
    <Layout>
      <section className="relative py-24 md:py-32 overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-30">
          <img src={craftImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>
        <div className="container-luxe relative max-w-3xl">
          <p className="eyebrow">About Katana Edge</p>
          <h1 className="font-display text-5xl md:text-7xl mt-6 leading-[1] ">
            A brand born <span className="italic text-gold">at the edge.</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
            Katana Edge began with a simple frustration shared by cutting stylists and barbers: the tools available didn't match the talent in the chair. So we set out to forge a new standard — one shaped by Seki swordsmith tradition and engineered for the modern professional.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-luxe grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="eyebrow">Our Philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
              The tool should disappear.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {content["home.brand.statement"] || content["about.brand.statement"] || "We believe your shears are an extension of your hand. When they are balanced, sharp, and fit your style, you do better work, faster, with less fatigue. That's why we build every Katana Edge shear with surgical-grade Japanese steel and convex hand-honed blades."}
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every Katana Edge shear is forged from premium Japanese-grade steel, hand-honed to a convex edge, and serialized before it leaves our workshop. Made in small batches. Built to last decades.
            </p>
          </div>
          <div className="product-image-wrap aspect-[4/5]">
            <img src={shopImg} alt="Premium modern hair salon" width={1280} height={1600} loading="lazy" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* SEKI JAPAN HERITAGE */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container-luxe grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1">
            <p className="eyebrow">The Origin Story</p>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-tight">
              Seki, Japan: The blade capital.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Dating back to the Kamakura period, Seki became the historic capital of Japanese swordcraft. The region's natural resources—high-quality iron sand, pine charcoal, and fresh river water—drew legendary swordsmiths who forged the blades of the samurai class.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Katana Edge was built to carry this historical mastery directly to modern salon chairs. By leveraging traditional thermal tempering and convex hand-honing techniques, our shears offer edge stability and precision slicing capability that simple machine-made shears cannot replicate.
            </p>
          </div>
          <div className="product-image-wrap aspect-[4/5] order-1 md:order-2">
            <img src={craftImg} alt="Master Japanese craftsman honing steel shear blades" width={1280} height={1600} loading="lazy" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container-luxe max-w-4xl">
          <p className="eyebrow text-center">Our Values</p>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-center">What we stand for</h2>
          <div className="mt-16 grid md:grid-cols-3 gap-px bg-border">
            {[
              { t: "Craft First", d: "We forge tools, not products. Every detail is a deliberate choice." },
              { t: "Professional Only", d: "Built for the chair, not the catalogue. Designed for stylists and cutting professionals." },
              { t: "Built To Last", d: "Lifetime sharpening. Decade-long edge life. A purchase you make once." },
            ].map((v) => (
              <div key={v.t} className="bg-card p-10 text-center">
                <h3 className="font-display text-2xl">{v.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
