import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkAdminSession } from "@/lib/admin.server";
import { createSupabaseServerClient } from "@/lib/supabase.server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const faqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
  sort_order: z.number().default(0),
  is_active: z.boolean().default(true),
});

export const Route = createFileRoute("/api/admin/faqs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkAdminSession(request)) {
          return new Response(
            JSON.stringify({ error: "Unauthorized. Valid admin session is required." }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          const payload = await request.json();
          const result = faqSchema.safeParse(payload);
          if (!result.success) {
            return new Response(
              JSON.stringify({ error: "Validation error", details: result.error.flatten().fieldErrors }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { id, question, answer, sort_order, is_active } = result.data;
          
          const recordId = id || crypto.randomUUID();
          const localRecord = {
            id: recordId,
            question,
            answer,
            sort_order,
            is_active,
            updated_at: new Date().toISOString(),
          };

          // 1. Save changes locally in site-faqs.json
          try {
            const filePath = path.resolve(process.cwd(), "src/lib/site-faqs.json");
            let localFaqs: any[] = [];
            if (fs.existsSync(filePath)) {
              localFaqs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            }
            
            const existingIdx = localFaqs.findIndex(f => f.id === recordId);
            if (existingIdx >= 0) {
              localFaqs[existingIdx] = localRecord;
            } else {
              localFaqs.push(localRecord);
            }
            fs.writeFileSync(filePath, JSON.stringify(localFaqs, null, 2), "utf-8");
          } catch (fileErr) {
            console.error("Failed to save local site-faqs.json", fileErr);
          }

          // 2. Optionally save to Supabase (catch errors so missing columns/tables do not block local saves)
          let responseData = localRecord;
          try {
            const supabase = createSupabaseServerClient();
            if (id) {
              const { data, error } = await supabase
                .from("faqs")
                .update({
                  question,
                  answer,
                  sort_order,
                  is_active,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .select()
                .single();

              if (!error && data) responseData = data;
            } else {
              const { data, error } = await supabase
                .from("faqs")
                .insert({
                  id: recordId,
                  question,
                  answer,
                  sort_order,
                  is_active,
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (!error && data) responseData = data;
            }
          } catch (dbErr) {
            console.warn("Supabase FAQ insert/update skipped or failed", dbErr);
          }

          return new Response(JSON.stringify({ success: true, data: responseData }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to save FAQ." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
      DELETE: async ({ request }) => {
        if (!checkAdminSession(request)) {
          return new Response(
            JSON.stringify({ error: "Unauthorized. Valid admin session is required." }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }

        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");

          if (!id) {
            return new Response(
              JSON.stringify({ error: "Missing FAQ ID in search params." }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          // 1. Delete locally from site-faqs.json
          try {
            const filePath = path.resolve(process.cwd(), "src/lib/site-faqs.json");
            if (fs.existsSync(filePath)) {
              let localFaqs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
              localFaqs = localFaqs.filter((f: any) => f.id !== id);
              fs.writeFileSync(filePath, JSON.stringify(localFaqs, null, 2), "utf-8");
            }
          } catch (fileErr) {
            console.error("Failed to delete local FAQ from JSON", fileErr);
          }

          // 2. Optionally delete from Supabase (catch errors gracefully)
          try {
            const supabase = createSupabaseServerClient();
            await supabase
              .from("faqs")
              .delete()
              .eq("id", id);
          } catch (dbErr) {
            console.warn("Supabase FAQ deletion skipped or failed", dbErr);
          }

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ error: error.message || "Failed to delete FAQ." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
