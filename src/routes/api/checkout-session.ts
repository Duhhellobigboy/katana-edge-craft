import { createFileRoute } from "@tanstack/react-router";
import { getGuestCheckoutSession } from "@/lib/checkout-db.server";

export const Route = createFileRoute("/api/checkout-session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const checkoutSessionId = url.searchParams.get("checkoutSessionId");

        if (!checkoutSessionId) {
          return Response.json({ error: "checkoutSessionId is required." }, { status: 400 });
        }

        try {
          const session = await getGuestCheckoutSession(checkoutSessionId);

          if (!session) {
            return Response.json({ session: null });
          }

          return Response.json({ session });
        } catch (err) {
          console.error("Failed to load guest checkout session:", err);
          return Response.json(
            { error: "Failed to load checkout session." },
            { status: 500 }
          );
        }
      },
    },
  },
});
