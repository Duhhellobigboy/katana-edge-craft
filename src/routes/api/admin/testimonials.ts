import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkAdminSession } from "@/lib/admin.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

// Schema validation for Testimonial reviews array
const testimonialListSchema = z.array(
  z.object({
    name: z.string().min(1, "Name cannot be empty"),
    role: z.string().default("Verified Barber"),
    quote: z.string().min(1, "Quote/review body cannot be empty"),
    rating: z.number().min(1).max(5).default(5),
    sort_order: z.number().default(0),
    is_active: z.boolean().default(true),
  })
);

export const Route = createFileRoute("/api/admin/testimonials")({
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
          const result = testimonialListSchema.safeParse(payload);

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

          const testimonials = result.data;
          const supabase = createSupabaseServerClient();

          // Clear existing Testimonials completely
          const { error: deleteError } = await supabase
            .from("testimonials")
            .delete()
            .neq("name", "TEMP_DELETION_DUMMY_KEY_NEVER_MATCHES"); // Deletes all records

          if (deleteError) {
            console.error("Failed to delete old testimonials", deleteError);
            throw new Error(deleteError.message);
          }

          // Insert new set of Testimonials
          if (testimonials.length > 0) {
            const { error: insertError } = await supabase
              .from("testimonials")
              .insert(testimonials);

            if (insertError) {
              console.error("Failed to insert new testimonials", insertError);
              throw new Error(insertError.message);
            }
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to save reviews." }),
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
