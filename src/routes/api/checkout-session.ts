import { createFileRoute } from "@tanstack/react-router";
import { getGuestCheckoutSession } from "@/lib/checkout-db.server";
import { ensureServerEnv } from "@/lib/env.server";
import {
  isCheckoutConfigError,
  toClientCheckoutError,
} from "@/lib/checkout-messages";

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
          ensureServerEnv();
          const session = await getGuestCheckoutSession(checkoutSessionId);

          if (!session) {
            return Response.json({ session: null });
          }

          return Response.json({ session });
        } catch (err) {
          const serverMessage =
            err instanceof Error ? err.message : "Failed to load checkout session.";
          console.error("[checkout-session]", serverMessage);

          if (isCheckoutConfigError(serverMessage)) {
            return Response.json(
              { error: toClientCheckoutError(serverMessage), session: null },
              { status: 503 },
            );
          }

          return Response.json(
            { error: "Failed to load checkout session.", session: null },
            { status: 500 },
          );
        }
      },
    },
  },
});
