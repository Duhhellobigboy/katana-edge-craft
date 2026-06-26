import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { fetchSiteContent } from "@/lib/content";

export const Route = createFileRoute("/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id:
      typeof search.session_id === "string" ? search.session_id : "",
  }),
  loader: async () => {
    const content = await fetchSiteContent();
    return { content };
  },
  head: () => ({
    meta: [{ title: "Order Confirmed | Katana Edge" }],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id } = Route.useSearch() as { session_id: string };
  const { content } = Route.useLoaderData();
  const supportPhone = content["contact.support.phone"] || "+1 (316) 368-2814";
  const supportPhoneLink = supportPhone.replace(/[^\d+]/g, "");

  return (
    <Layout>
      <section className="py-20 md:py-32 bg-[#050505] min-h-screen text-white">
        <div className="container-luxe max-w-2xl text-center space-y-8">
          <div className="inline-flex size-20 items-center justify-center bg-gold/10 text-gold border border-gold/40 rounded-full mx-auto">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-3">
            <p className="eyebrow">Payment Successful</p>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-wide">
              Thank You
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your payment has been processed. A confirmation email will be sent
              shortly with your order details.
            </p>
          </div>

          {session_id && (
            <div className="bg-card border border-border/40 p-6 text-left space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Order Reference
              </p>
              <p className="font-mono text-xs text-white/80 break-all select-all">
                {session_id}
              </p>
            </div>
          )}

          <div className="bg-card border border-border/40 p-6 text-left">
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-gold shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every Katana Edge shear is covered by our premium structural warranty
                and lifetime free sharpening program.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Link
              to="/checkout"
              className="btn-gold inline-flex items-center gap-2"
            >
              Order Another
              <ArrowRight className="size-4" />
            </Link>
            <Link to="/" className="btn-ghost-light">
              Return Home
            </Link>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Questions? Call{" "}
            <a href={`tel:${supportPhoneLink}`} className="text-gold hover:underline">
              {supportPhone}
            </a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
