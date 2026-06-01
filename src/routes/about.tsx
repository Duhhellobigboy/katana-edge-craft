import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import craftImg from "@/assets/craft-steel.jpg";
import shopImg from "@/assets/barbershop.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Katana Edge — Premium Barber Scissor Brand" },
      { name: "description", content: "Katana Edge crafts professional barber and stylist shears inspired by centuries of Japanese metallurgical tradition. Made for the working professional." },
      { property: "og:title", content: "About Katana Edge" },
      { property: "og:description", content: "Precision crafted. Professionally trusted." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
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
            Katana Edge began with a simple frustration shared by every working barber: the tools available didn't match the talent in the chair. So we set out to forge a new standard — one shaped by Japanese tradition and engineered for the modern professional.
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
              A great shear is one you stop noticing — until you pick up something lesser. We obsess over weight, balance, edge geometry, and pivot tension because every imperceptible detail compounds into thousands of cleaner cuts a year.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every Katana Edge shear is forged from premium Japanese-grade steel, hand-honed to a convex edge, and serialized before it leaves our workshop. Made in small batches. Built to last decades.
            </p>
          </div>
          <div className="product-image-wrap aspect-[4/5]">
            <img src={shopImg} alt="Premium modern barbershop" width={1280} height={1600} loading="lazy" className="w-full h-full object-cover" />
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
              { t: "Professional Only", d: "Built for the chair, not the catalogue. Designed by barbers, for barbers." },
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
