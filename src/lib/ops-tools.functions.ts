import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Admin-only: build the full Excel backup and return it as base64 for download.
export const downloadExcelBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only admins can download backups");
    const { buildBackupWorkbook } = await import("./excel-backup.server");
    const { bytes, rows } = await buildBackupWorkbook();
    return { base64: Buffer.from(bytes).toString("base64"), rows };
  });

// Admin-only: push a backup to OneDrive right now.
export const syncExcelNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only admins can run backups");
    const { runExcelSync } = await import("./excel-backup.server");
    return runExcelSync();
  });
