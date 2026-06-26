import { createFileRoute } from "@tanstack/react-router";
import { checkAdminSession } from "@/lib/admin.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import fs from "fs";
import path from "path";

export const Route = createFileRoute("/api/admin/content")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Check admin session authorization
        if (!checkAdminSession(request)) {
          return new Response(
            JSON.stringify({ error: "Unauthorized. Valid admin session is required." }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        try {
          const body = await request.json();
          const updates = body?.updates;

          if (!Array.isArray(updates)) {
            return new Response(
              JSON.stringify({ error: "Invalid payload format. Expected 'updates' array." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          // 1. Write changes locally to the JSON file for local-first persistence
          try {
            const filePath = path.resolve(process.cwd(), "src/lib/site-content.json");
            let localContent: Record<string, string> = {};
            if (fs.existsSync(filePath)) {
              localContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            }
            updates.forEach((update) => {
              localContent[update.key] = String(update.value || "");
            });
            fs.writeFileSync(filePath, JSON.stringify(localContent, null, 2), "utf-8");
          } catch (fileErr) {
            console.error("Failed to write local site-content.json", fileErr);
          }

          // 2. Optionally write to Supabase (catch errors so missing columns/tables do not block local saves)
          try {
            const supabase = createSupabaseServerClient();
            const records = updates.map((update) => ({
              key: update.key,
              value: String(update.value || ""),
              updated_at: new Date().toISOString(),
            }));
            await supabase
              .from("site_content")
              .upsert(records, { onConflict: "key" });
          } catch (dbErr) {
            console.warn("Supabase upsert skipped/failed in site_content save", dbErr);
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to update website content copy." }),
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
