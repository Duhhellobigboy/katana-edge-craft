import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Check, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/why-katana-edge")({
  head: () => ({
    meta: [
      { title: "Why Professionals Choose Katana Edge | Premium Barber Shears" },
      { name: "description", content: "Discover why thousands of professional barbers and stylists choose Katana Edge over other premium barber scissors and thinning shears." },
      { property: "og:title", content: "Why Professionals Choose Katana Edge" },
      { property: "og:url", content: "/why-katana-edge" },
    ],
    links: [{ rel: "canonical", href: "/why-katana-edge" }],
  }),
  component: WhyPage,
});

const comparison = [
  { f: "Japanese-grade premium steel (440C / ATS-314)", us: true, them: false },
  { f: "Hand-honed convex edge", us: true, them: false },
  { f: "Hardened to 60–62 HRC", us: true, them: false },
  { f: "Offset ergonomic handle", us: true, them: true },
  { f: "Lifetime sharpening included", us: true, them: false },
  { f: "60-day satisfaction guarantee", us: true, them: false },
  { f: "Serialized & batch-tested", us: true, them: false },
];

function WhyPage() {
  return (
    <Layout>
      <section className="py-24 md:py-32 border-b border-border">
        <div className="container-luxe max-w-4xl text-center">
          <p className="eyebrow">Why Katana Edge</p>
          <h1 className="font-display text-5xl md:text-7xl mt-6 leading-[1]">
            The difference is in <span className="italic text-gold">the cut.</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
            Most barber scissors are commodities — stamped, ground, and sold by the thousand. Katana Edge is built differently, on purpose.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-luxe max-w-4xl">
          <p className="eyebrow text-center">Side By Side</p>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-center">How we compare</h2>

          <div className="mt-16 border border-border">
            <div className="grid grid-cols-12 bg-card border-b border-border">
              <div className="col-span-6 p-5 text-xs uppercase tracking-[0.18em] text-muted-foreground">Feature</div>
              <div className="col-span-3 p-5 text-center text-sm font-display text-gold">Katana Edge</div>
              <div className="col-span-3 p-5 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">Others</div>
            </div>
            {comparison.map((row, i) => (
              <div key={i} className="grid grid-cols-12 border-b border-border last:border-b-0">
                <div className="col-span-6 p-5 text-sm">{row.f}</div>
                <div className="col-span-3 p-5 flex items-center justify-center">
                  {row.us ? <Check className="size-5 text-gold" /> : <span className="text-muted-foreground">—</span>}
                </div>
                <div className="col-span-3 p-5 flex items-center justify-center">
                  {row.them ? <Check className="size-5 text-muted-foreground" /> : <span className="text-muted-foreground">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-card border-y border-border">
        <div className="container-luxe max-w-3xl text-center">
          <p className="eyebrow">Lifetime Promise</p>
          <h2 className="font-display text-4xl md:text-6xl mt-4 leading-tight">
            Buy once. <span className="italic text-gold">Sharpen forever.</span>
          </h2>
          <p className="mt-6 text-muted-foreground">
            Every Katana Edge owner gets free lifetime sharpening, professional re-tensioning, and priority support. This isn't a transaction — it's a relationship with your tool.
          </p>
          <Link to="/shop" className="btn-gold mt-10 inline-flex">Shop the collection <ArrowRight className="size-4" /></Link>
        </div>
      </section>
    </Layout>
  );
}
