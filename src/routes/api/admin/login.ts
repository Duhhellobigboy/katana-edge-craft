import { createFileRoute } from "@tanstack/react-router";
import process from "node:process";
import { generateSessionToken } from "@/lib/admin.server";

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const password = body?.password;

          const adminPassword = process.env.ADMIN_PASSWORD;
          const sessionSecret = process.env.ADMIN_SESSION_SECRET;

          if (!adminPassword || !sessionSecret) {
            return new Response(
              JSON.stringify({ error: "Server authentication parameters are not fully configured." }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          if (password !== adminPassword) {
            return new Response(
              JSON.stringify({ error: "Incorrect password. Access denied." }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // Generate signed HMAC token
          const token = generateSessionToken(sessionSecret);

          // Build cookie directives
          const isProd = process.env.NODE_ENV === "production";
          const cookieDirectives = [
            `admin_session=${token}`,
            "Path=/",
            "HttpOnly",
            "SameSite=Strict",
            "Max-Age=604800", // 7 days in seconds
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
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to process login request." }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
