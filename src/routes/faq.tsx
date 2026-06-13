import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";

import { fetchFaqs } from "@/lib/content";

export const Route = createFileRoute("/faq")({
  head: ({ loaderData }) => ({
    meta: [
      { title: "FAQ — Katana Edge Professional Barber Scissors" },
      { name: "description", content: "Answers to common questions about Katana Edge professional barber scissors, thinning shears, sharpening, returns, and shipping." },
      { property: "og:title", content: "Katana Edge FAQ" },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: loaderData ? [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: loaderData.dbFaqs.map((f: any) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }),
    }] : [],
  }),
  loader: async () => {
    const dbFaqs = await fetchFaqs();
    return { dbFaqs };
  },
  component: FaqPage,
});

function FaqPage() {
  const { dbFaqs } = Route.useLoaderData() as { dbFaqs: { question: string; answer: string }[] };
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
            {dbFaqs.map((f) => (
              <details key={f.question} className="group py-6">
                <summary className="flex justify-between items-center cursor-pointer list-none gap-6">
                  <h2 className="font-display text-xl md:text-2xl group-open:text-gold transition-colors">{f.question}</h2>
                  <span className="text-gold text-2xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
