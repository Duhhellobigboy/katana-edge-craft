import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  getCalendlyEmbedUrl,
  loadCalendlyAssets,
  logCalendlyEnvDebug,
} from "@/lib/calendly";

function CalendlyFallback() {
  return (
    <div className="flex items-start gap-3 border border-red-500/40 bg-red-500/10 p-4 text-red-200 text-left">
      <AlertTriangle className="size-5 shrink-0 mt-0.5" />
      <div className="space-y-2 text-sm">
        <p>
          Booking calendar failed to load. Please refresh the page or contact us
          directly.
        </p>
        <p>
          <a href="tel:+13163682814" className="text-gold hover:underline">
            +1 (316) 368-2814
          </a>
          {" · "}
          <a
            href="mailto:hello@katanaedge.com"
            className="text-gold hover:underline"
          >
            hello@katanaedge.com
          </a>
        </p>
      </div>
    </div>
  );
}

export function CalendlyEmbed() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  const calendlyUrlWithParams = getCalendlyEmbedUrl();

  useEffect(() => {
    logCalendlyEnvDebug();

    if (!calendlyUrlWithParams) {
      console.error("[calendly-env] Missing or invalid VITE_CALENDLY_URL.");
      setFailed(true);
      return;
    }

    let active = true;

    loadCalendlyAssets()
      .then(() => {
        if (!active || !widgetRef.current || !window.Calendly) {
          throw new Error("Calendly widget container unavailable.");
        }

        widgetRef.current.innerHTML = "";
        window.Calendly.initInlineWidget({
          url: calendlyUrlWithParams,
          parentElement: widgetRef.current,
        });
      })
      .catch((err) => {
        console.error("[calendly-env] Embed failed:", err);
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
    };
  }, [calendlyUrlWithParams]);

  if (failed || !calendlyUrlWithParams) {
    return <CalendlyFallback />;
  }

  return (
    <div className="w-full overflow-x-hidden flex justify-center">
      <div
        ref={widgetRef}
        className="calendly-inline-widget w-full max-w-3xl"
        data-url={calendlyUrlWithParams}
        style={{ minWidth: "320px", height: "700px" }}
        aria-label="Calendly scheduling widget"
      />
    </div>
  );
}
