import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { LeadForm } from "@/components/site/LeadForm";
import { Phone, Mail, MessageCircle, Clock } from "lucide-react";

import { fetchSiteContent } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Katana Edge | Premium Barber Scissor Support" },
      { name: "description", content: "Talk to a Katana Edge specialist about our professional barber scissors, thinning shears, sharpening, and orders." },
      { property: "og:title", content: "Contact Katana Edge" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  loader: async () => {
    const content = await fetchSiteContent();
    return { content };
  },
  component: ContactPage,
});

function ContactPage() {
  const { content } = Route.useLoaderData();
  const supportEmail = content["contact.support.email"] || "hello@katanaedge.com";

  return (
    <Layout>
      <section className="py-24 md:py-32 border-b border-border">
        <div className="container-luxe max-w-3xl text-center">
          <p className="eyebrow">Contact</p>
          <h1 className="font-display text-5xl md:text-7xl mt-6 leading-[1]">
            Talk to a <span className="italic text-gold">specialist.</span>
          </h1>
          <p className="mt-6 text-muted-foreground">
            Questions about the Fujisan, Micro Slit, sharpening program, or salon orders? We're here.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-luxe grid md:grid-cols-3 gap-px bg-border max-w-5xl mx-auto border border-border">
          {[
            { i: Phone, t: "Call us", l: "+1 (316) 368-2814", h: "tel:+13163682814", s: "Mon–Fri · 9am–6pm CT" },
            { i: Mail, t: "Email us", l: supportEmail, h: `mailto:${supportEmail}`, s: "Replies within 24 hours" },
            { i: MessageCircle, t: "Live chat", l: "Open chat widget", h: "#", s: "AI concierge · 24/7" },
          ].map((c) => (
            <a key={c.t} href={c.h} className="bg-card p-10 text-center hover:bg-background transition-colors group">
              <div className="size-12 rounded-sm border border-border group-hover:border-gold mx-auto flex items-center justify-center text-foreground group-hover:text-gold transition-colors">
                <c.i className="size-5" />
              </div>
              <h3 className="font-display text-2xl mt-6">{c.t}</h3>
              <p className="mt-2 text-gold">{c.l}</p>
              <p className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Clock className="size-3" /> {c.s}
              </p>
            </a>
          ))}
        </div>
      </section>

      <LeadForm variant="compact" />
    </Layout>
  );
}
