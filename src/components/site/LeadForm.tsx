import { CalendlyEmbed } from "@/components/site/CalendlyEmbed";
import { getBrandColors } from "@/lib/calendly";

export function LeadForm({ variant = "inline" }: { variant?: "inline" | "compact" }) {
  const isCompact = variant === "compact";
  const brand = getBrandColors();

  return (
    <section
      id={isCompact ? "contact" : undefined}
      className={isCompact ? "scroll-mt-28 py-12 md:py-20 border-y border-border" : "py-20 md:py-28"}
      style={{ backgroundColor: brand.bg }}
    >
      <div className="container-luxe">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow" style={{ color: brand.primary }}>
            Consultation
          </p>
          <h2
            className="font-display text-3xl md:text-5xl mt-4 leading-tight"
            style={{ color: brand.text }}
          >
            Book Your Consultation
          </h2>
          <p className="mt-4 mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose a time that works for you. Your booking is handled securely
            through Calendly.
          </p>

          <div
            className="text-left rounded-sm border border-gold/30 p-4 md:p-6 overflow-hidden bg-[#0a0a0a]"
          >
            <div className="hairline mb-6" />
            <CalendlyEmbed />
          </div>
        </div>
      </div>
    </section>
  );
}
