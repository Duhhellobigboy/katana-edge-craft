import { createFileRoute } from "@tanstack/react-router";
import { handleStripeWebhookRequest } from "@/lib/stripe-webhook.server";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => handleStripeWebhookRequest(request),
    },
  },
});
