import { useEffect } from "react";

export function LeadForm({ variant = "inline" }: { variant?: "inline" | "compact" }) {
  const isCompact = variant === "compact";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section
      id={isCompact ? "contact" : undefined}
      className={isCompact ? "scroll-mt-28 py-12" : "py-20 md:py-28"}
    >
      <div className="container-luxe">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow">Exclusive Access</p>
          <h2 className="font-display text-3xl md:text-5xl mt-4 leading-tight mb-8">
            Join the professionals' list
          </h2>
          <div className="w-full" style={{ minHeight: "500px" }}>
            <iframe 
              src="https://api.leadconnectorhq.com/widget/form/hFqPiDNnD8aNQwDr69kT" 
              style={{ width: "100%", height: "100%", border: "none", borderRadius: "3px" }}
              id="inline-hFqPiDNnD8aNQwDr69kT" 
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Katana Edge Newsletter"
              data-height="522"
              data-layout-iframe-id="inline-hFqPiDNnD8aNQwDr69kT"
              data-form-id="hFqPiDNnD8aNQwDr69kT"
              title="Katana Edge Newsletter"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
