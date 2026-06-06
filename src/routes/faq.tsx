import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Katana Edge Professional Barber Scissors" },
      { name: "description", content: "Answers to common questions about Katana Edge professional barber scissors, thinning shears, sharpening, returns, and shipping." },
      { property: "og:title", content: "Katana Edge FAQ" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: FaqPage,
});

const faqs = [
  { q: "What makes Katana Edge scissors different?", a: "Every Katana Edge shear is forged from premium Japanese-grade steel, hand-honed to a convex edge, and finished to professional tolerances. We make tools, not products." },
  { q: "Are these suitable for beginners?", a: "Yes. Properly balanced, properly tensioned shears actually accelerate skill development. Beginners learn correct hand position faster on professional-grade tools." },
  { q: "How often should I sharpen them?", a: "For full-time professional use, every 6–9 months. We offer free lifetime sharpening for all Katana Edge owners — ship it in, we honor it for life." },
  { q: "What is the return policy?", a: "60-day satisfaction guarantee. Use it. If it isn't right, return it for a full refund — no questions asked." },
  { q: "Do professional barbers use thinning scissors?", a: "Absolutely. Thinning shears (like the Fujisan) are essential for fade blending, weight removal, and creating soft, invisible transitions between sections." },
  { q: "What is Micro Slit used for?", a: "Micro Slit is designed for stable, precise dry and wet hair cutting. Its patent-protected microscopic slits help keep dry hair stable while cutting for clean, controlled results." },
  { q: "Do you ship internationally?", a: "Yes. We ship to 40+ countries with full tracking. Duties and taxes vary by destination." },
  { q: "How long does shipping take?", a: "US: 2–5 business days. International: 5–10 business days. All orders ship within 48 hours." },
  { q: "What's the warranty?", a: "Lifetime structural warranty plus free lifetime sharpening. If the shear ever fails under professional use, we replace it." },
  { q: "Can I buy in bulk for my salon?", a: "Yes. Contact us at hello@katanaedge.com for professional and salon volume pricing." },
];

function FaqPage() {
  return (
    <Layout>
      <section className="py-24 md:py-32 border-b border-border">
        <div className="container-luxe text-center max-w-2xl">
          <p className="eyebrow">FAQ</p>
          <h1 className="font-display text-5xl md:text-7xl mt-6 leading-[1]">
            Questions, <span className="italic text-gold">answered.</span>
          </h1>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-luxe max-w-3xl">
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex justify-between items-center cursor-pointer list-none gap-6">
                  <h2 className="font-display text-xl md:text-2xl group-open:text-gold transition-colors">{f.q}</h2>
                  <span className="text-gold text-2xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
