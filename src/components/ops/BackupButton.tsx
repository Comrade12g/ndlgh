import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadExcelBackup } from "@/lib/ops-tools.functions";
import { getErrorMessage } from "@/lib/errors";

export function BackupButton() {
  const run = useServerFn(downloadExcelBackup);
  const [busy, setBusy] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={busy}
      className="mb-2 w-full border-white/20 bg-transparent text-white hover:bg-white/10"
      onClick={async () => {
        setBusy(true);
        try {
          const { base64, rows } = await run();
          const bin = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
          const url = URL.createObjectURL(
            new Blob([bin], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = `NDL-Backup-${new Date().toISOString().slice(0, 10)}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success(`Backup downloaded (${rows} rows)`);
        } catch (e) {
          toast.error(getErrorMessage(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Download className="mr-2 h-4 w-4" /> {busy ? "Preparing…" : "Excel backup"}
    </Button>
  );
}
