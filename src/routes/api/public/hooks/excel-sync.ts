import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { runExcelSync } from "@/lib/excel-backup.server";

export const Route = createFileRoute("/api/public/hooks/excel-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("x-cron-token") ?? "";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data } = await supabaseAdmin
          .from("internal_cron_tokens")
          .select("token")
          .eq("name", "excel_sync")
          .maybeSingle();
        const expected = data?.token ?? "";
        const a = Buffer.from(provided);
        const b = Buffer.from(expected);
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const result = await runExcelSync();
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});
