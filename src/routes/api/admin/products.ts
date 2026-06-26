import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkAdminSession } from "@/lib/admin.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import fs from "fs";
import path from "path";

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
    "bamboo-thinning-shears",
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
  videoUrl: z.string().url("Must be a valid video URL").or(z.string().regex(/^\//)).or(z.string().default("")),
  galleryUrls: z.array(z.string()).default([]),
  availability: z.enum(["Available", "Coming Soon"]).default("Coming Soon"),
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
            videoUrl,
            galleryUrls,
            availability,
          } = result.data;

          // 1. Write changes locally to the JSON file for local-first persistence
          try {
            const filePath = path.resolve(process.cwd(), "src/lib/site-products.json");
            let localProducts: Record<string, any> = {};
            if (fs.existsSync(filePath)) {
              localProducts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            }
            localProducts[slug] = {
              name,
              tagline,
              shortDescription,
              longDescription,
              image,
              features,
              benefits,
              specs,
              faq,
              videoUrl,
              galleryUrls,
              availability,
              updated_at: new Date().toISOString(),
            };
            fs.writeFileSync(filePath, JSON.stringify(localProducts, null, 2), "utf-8");
          } catch (fileErr) {
            console.error("Failed to write local site-products.json", fileErr);
          }

          // 2. Optionally write to Supabase (catch errors so missing columns/tables do not block local saves)
          try {
            const supabase = createSupabaseServerClient();
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
                video_url: videoUrl,
                gallery_urls: galleryUrls,
                availability,
                updated_at: new Date().toISOString(),
              })
              .eq("slug", slug);

            if (error) {
              console.warn("Supabase product copy update returned an error", error);
            }
          } catch (dbErr) {
            console.warn("Supabase product copy update skipped/failed", dbErr);
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
