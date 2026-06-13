import { CalendlyEmbed } from "@/components/site/CalendlyEmbed";
import { getBrandColors } from "@/lib/calendly";

export function LeadForm({ variant = "inline" }: { variant?: "inline" | "compact" }) {
  const isCompact = variant === "compact";
  const brand = getBrandColors();

  return (
    <section
      id={isCompact ? "contact" : undefined}
      className={isCompact ? "scroll-mt-28 py-20 md:py-28 border-y border-border washi-texture" : "py-28 md:py-36 washi-texture"}
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
            Speak With A Katana Edge Specialist
          </h2>
          <p className="mt-4 mb-10 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Schedule a consultation to find the shear best suited to your cutting style and professional needs.
          </p>

          <div
            className="text-left rounded-sm border border-gold/20 p-5 md:p-8 overflow-hidden bg-[#0B0B0B]"
          >
            <div className="blade-line mb-8" />
            <CalendlyEmbed />
          </div>
        </div>
      </div>
    </section>
  );
}
