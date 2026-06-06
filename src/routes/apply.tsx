import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/apply")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/checkout",
      search,
    });
  },
});
