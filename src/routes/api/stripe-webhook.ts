import { createFileRoute } from "@tanstack/react-router";
import { handleStripeWebhookRequest } from "@/lib/stripe-webhook.server";

/** @deprecated Use /api/webhooks/stripe */
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => handleStripeWebhookRequest(request),
    },
  },
});
