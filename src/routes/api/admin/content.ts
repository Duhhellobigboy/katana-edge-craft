import { createFileRoute } from "@tanstack/react-router";
import { checkAdminSession } from "@/lib/admin.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

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

          const supabase = createSupabaseServerClient();

          // Prepare records for upserting
          const records = updates.map((update) => ({
            key: update.key,
            value: String(update.value || ""),
            updated_at: new Date().toISOString(),
          }));

          const { error } = await supabase
            .from("site_content")
            .upsert(records, { onConflict: "key" });

          if (error) {
            console.error("Supabase upsert error in site_content", error);
            throw new Error(error.message);
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
