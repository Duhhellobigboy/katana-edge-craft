import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/success")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/success",
      search,
    });
  },
});
