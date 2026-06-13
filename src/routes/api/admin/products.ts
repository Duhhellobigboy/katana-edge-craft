import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkAdminSession } from "@/lib/admin.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";

// Define strict validation schema for incoming product copy updates
const productUpdateSchema = z.object({
  slug: z.enum([
    "micro-slit-shears",
    "fujisan-thinning-shears",
    "thunder-shears",
    "double-swivel-shears",
    "naruto-shears",
    "karakuri-shears",
    "bamboo-shears",
  ]),
  name: z.string().min(1, "Name cannot be empty"),
  tagline: z.string().default(""),
  shortDescription: z.string().default(""),
  longDescription: z.string().default(""),
  image: z.string().url("Must be a valid image URL").or(z.string().regex(/^\//)).or(z.string().default("")),
  features: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  benefits: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  specs: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
  faq: z.array(
    z.object({
      q: z.string(),
      a: z.string(),
    })
  ),
});

export const Route = createFileRoute("/api/admin/products")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Validate administrator authorization session
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
          
          // Parse and validate payload arrays/strings securely server-side
          const result = productUpdateSchema.safeParse(payload);
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

          const {
            slug,
            name,
            tagline,
            shortDescription,
            longDescription,
            image,
            features,
            benefits,
            specs,
            faq,
          } = result.data;

          const supabase = createSupabaseServerClient();

          // Save copywriting updates only. Never allow updating Stripe IDs, price_cents, or active status.
          const { error } = await supabase
            .from("products")
            .update({
              name,
              tagline,
              short_description: shortDescription,
              long_description: longDescription,
              image_url: image,
              features,
              benefits,
              specs,
              faq,
              updated_at: new Date().toISOString(),
            })
            .eq("slug", slug);

          if (error) {
            console.error("Supabase product copy update failed", error);
            throw new Error(error.message);
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to update product copy details." }),
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
