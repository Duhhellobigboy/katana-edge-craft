import { createServerFn } from "@tanstack/react-start";
import { checkAdminSession } from "./admin.server";

export const checkAdminAuth = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    const isAuthenticated = checkAdminSession(request);
    return { authenticated: isAuthenticated };
  });

export const getAdminDbFaqs = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    if (!checkAdminSession(request)) {
      throw new Error("Unauthorized");
    }

    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const crypto = await import("node:crypto");
      const { DEFAULT_FAQS } = await import("./content");
      const filePath = path.resolve(process.cwd(), "src/lib/site-faqs.json");

      // Auto-initialize local file with defaults if not exists
      if (!fs.existsSync(filePath)) {
        try {
          const initialFaqs = DEFAULT_FAQS.map((faq, idx) => ({
            id: crypto.randomUUID(),
            question: faq.q,
            answer: faq.a,
            sort_order: idx + 1,
            is_active: true
          }));
          fs.writeFileSync(filePath, JSON.stringify(initialFaqs, null, 2), "utf-8");
        } catch (err) {
          console.error("Failed to initialize site-faqs.json", err);
        }
      }

      if (fs.existsSync(filePath)) {
        const faqs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        return faqs.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
    } catch (err) {
      console.error("Error reading site-faqs.json inside getAdminDbFaqs:", err);
    }

    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!error && data) return data;
    } catch (err) {
      console.error("Error in getAdminDbFaqs Supabase fallback:", err);
    }

    return [];
  });


export const getAdminDbTestimonials = createServerFn({ method: "GET" })
  .handler(async ({ request }) => {
    if (!checkAdminSession(request)) {
      throw new Error("Unauthorized");
    }
    try {
      const { createSupabaseServerClient } = await import("./supabase.server");
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error in getAdminDbTestimonials:", err);
      throw err;
    }
  });
