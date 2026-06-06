const CALENDLY_SCRIPT_URL = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_STYLE_URL = "https://assets.calendly.com/assets/external/widget.css";

let scriptPromise: Promise<void> | null = null;
let stylesLoaded = false;

export type CalendlyInlineApi = {
  initInlineWidget: (options: {
    url: string;
    parentElement: HTMLElement;
    prefill?: Record<string, string>;
    utm?: Record<string, string>;
  }) => void;
};

declare global {
  interface Window {
    Calendly?: CalendlyInlineApi;
  }
}

function stripEnvQuotes(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function normalizeHexColor(value: string | undefined, fallback: string): string {
  const raw = stripEnvQuotes(value) || fallback;
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  return hex.toLowerCase();
}

export function getCalendlyUrl(): string | null {
  const url = stripEnvQuotes(import.meta.env.VITE_CALENDLY_URL);
  if (!url) return null;
  if (!url.startsWith("https://calendly.com/")) return null;
  return url;
}

export function getBrandColors() {
  const primary = stripEnvQuotes(import.meta.env.VITE_BRAND_PRIMARY) || "#D4AF37";
  const text = stripEnvQuotes(import.meta.env.VITE_BRAND_TEXT) || "#FFFFFF";
  const bg = stripEnvQuotes(import.meta.env.VITE_BRAND_BG) || "#050505";

  const withHash = (c: string) => (c.startsWith("#") ? c : `#${c}`);

  return {
    primary: withHash(primary),
    text: withHash(text),
    bg: withHash(bg),
  };
}

/** Calendly embed URL with brand query params (no # in param values). */
export function getCalendlyEmbedUrl(): string | null {
  const base = getCalendlyUrl();
  if (!base) return null;

  const brand = getBrandColors();
  const params = new URLSearchParams({
    background_color: normalizeHexColor(brand.bg, "050505"),
    text_color: normalizeHexColor(brand.text, "ffffff"),
    primary_color: normalizeHexColor(brand.primary, "d4af37"),
  });

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${params.toString()}`;
}

export function logCalendlyEnvDebug() {
  const exists = Boolean(stripEnvQuotes(import.meta.env.VITE_CALENDLY_URL));
  console.log("[calendly-env] VITE_CALENDLY_URL exists:", exists);
}

function loadCalendlyStyles() {
  if (stylesLoaded) return;
  if (document.querySelector(`link[href="${CALENDLY_STYLE_URL}"]`)) {
    stylesLoaded = true;
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CALENDLY_STYLE_URL;
  document.head.appendChild(link);
  stylesLoaded = true;
}

function waitForCalendlyApi(maxAttempts = 50): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      if (window.Calendly?.initInlineWidget) {
        resolve();
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        reject(new Error("Calendly API not available after script load."));
        return;
      }

      window.setTimeout(check, 50);
    };

    check();
  });
}

export function loadCalendlyAssets(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Calendly embed is client-only."));
  }

  if (window.Calendly?.initInlineWidget) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  loadCalendlyStyles();

  scriptPromise = new Promise((resolve, reject) => {
    const finish = () => {
      waitForCalendlyApi().then(resolve).catch(reject);
    };

    const existing = document.querySelector(
      `script[src="${CALENDLY_SCRIPT_URL}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.Calendly?.initInlineWidget) {
        resolve();
        return;
      }
      existing.addEventListener("load", finish);
      existing.addEventListener("error", () => {
        scriptPromise = null;
        reject(new Error("Calendly script failed to load."));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = CALENDLY_SCRIPT_URL;
    script.async = true;
    script.onload = finish;
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Calendly script failed to load."));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}
