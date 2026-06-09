import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async () => {
        const isProd = process.env.NODE_ENV === "production";
        
        const cookieDirectives = [
          "admin_session=",
          "Path=/",
          "HttpOnly",
          "SameSite=Strict",
          "Max-Age=0",
          "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        ];

        if (isProd) {
          cookieDirectives.push("Secure");
        }

        const setCookieHeader = cookieDirectives.join("; ");

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Set-Cookie": setCookieHeader,
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
