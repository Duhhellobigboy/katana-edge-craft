import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ChatWidget } from "@/components/site/ChatWidget";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-display text-5xl mt-4">Page not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for has been moved or doesn't exist.
        </p>
        <Link to="/" className="btn-gold mt-8 inline-flex">Return home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-gold">Try again</button>
          <a href="/" className="btn-ghost-light">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Katana Edge — Professional Barber Scissors & Shears" },
      { name: "description", content: "Premium Japanese-inspired barber scissors and shears. Engineered for cleaner cuts, smoother blending, and professional control. Trusted by barbers and stylists." },
      { name: "author", content: "Katana Edge" },
      { property: "og:title", content: "Katana Edge — Professional Barber Scissors & Shears" },
      { property: "og:description", content: "Premium Japanese-inspired barber scissors and shears. Engineered for cleaner cuts, smoother blending, and professional control. Trusted by barbers and stylists." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Katana Edge" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1a1a1a" },
      { name: "twitter:title", content: "Katana Edge — Professional Barber Scissors & Shears" },
      { name: "twitter:description", content: "Premium Japanese-inspired barber scissors and shears. Engineered for cleaner cuts, smoother blending, and professional control. Trusted by barbers and stylists." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/20fb7fc3-64da-4d61-9a65-6bda617c7dcc/id-preview-d0667411--c933e9bd-a4c9-4fc3-b4d2-562d19be7f69.lovable.app-1780336442409.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/20fb7fc3-64da-4d61-9a65-6bda617c7dcc/id-preview-d0667411--c933e9bd-a4c9-4fc3-b4d2-562d19be7f69.lovable.app-1780336442409.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Yellowtail&display=swap" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Katana Edge",
        url: "/",
        slogan: "Precision Crafted. Professionally Trusted.",
        description: "Premium Japanese-inspired professional barber scissors and shears.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-316-368-2814",
          contactType: "customer service",
        },
      }),
    }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ChatWidget />
    </QueryClientProvider>
  );
}
