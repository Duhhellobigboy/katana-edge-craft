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
          
          // Wrap the database lookup in a 3-second timeout race to prevent page load hangs
          const dbQueryPromise = getGuestCheckoutSession(checkoutSessionId);
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Database lookup timed out")), 3000)
          );

          const session = await Promise.race([dbQueryPromise, timeoutPromise]);

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

          // Return null session on timeout or other database failures to allow user manual form entry
          return Response.json(
            { error: "Failed to load checkout session.", session: null },
            { status: 200 }, // Using 200 with null session to let frontend recover gracefully
          );
        }
      },
    },
  },
});
