import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkAdminSession } from "@/lib/admin.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

// Schema validation for FAQ items array
const faqListSchema = z.array(
  z.object({
    question: z.string().min(1, "Question cannot be empty"),
    answer: z.string().min(1, "Answer cannot be empty"),
    sort_order: z.number().default(0),
    is_active: z.boolean().default(true),
  })
);

export const Route = createFileRoute("/api/admin/faqs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Authenticate admin session
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
          const payload = await request.json();
          const result = faqListSchema.safeParse(payload);

          if (!result.success) {
            return new Response(
              JSON.stringify({
                error: "Validation error",
                details: result.error.flatten().fieldErrors,
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const faqs = result.data;
          const supabase = createSupabaseServerClient();

          // Clear existing FAQs completely
          const { error: deleteError } = await supabase
            .from("faqs")
            .delete()
            .neq("question", "TEMP_DELETION_DUMMY_KEY_NEVER_MATCHES"); // Deletes all records

          if (deleteError) {
            console.error("Failed to delete old FAQs", deleteError);
            throw new Error(deleteError.message);
          }

          // Insert new set of FAQs
          if (faqs.length > 0) {
            const { error: insertError } = await supabase
              .from("faqs")
              .insert(faqs);

            if (insertError) {
              console.error("Failed to insert new FAQs", insertError);
              throw new Error(insertError.message);
            }
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to save FAQ items." }),
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
