import { createServerFn } from "@tanstack/react-start";
import { checkAdminSession } from "./admin.server";

export const checkAdminAuth = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    const isAuthenticated = checkAdminSession(request);
    return { authenticated: isAuthenticated };
  });
