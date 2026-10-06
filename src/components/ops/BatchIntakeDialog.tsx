import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, ScanLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { ensureContactShadow } from "@/lib/ensureContactShadow";
import { notifyCustomer } from "@/lib/notifications";
import { waTemplates } from "@/lib/whatsapp";

type Line = { external_tracking: string; pieces: number; weight_kg: number; cbm: number; description: string };

type BarcodeDetectorLike = { detect: (src: CanvasImageSource) => Promise<{ rawValue: string }[]> };

export function BatchIntakeDialog({ onDone }: { onDone: () => void }) {
  const [mark, setMark] = useState("");
  const [wh, setWh] = useState("CN");
  const [scan, setScan] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses-all"],
    queryFn: async () => (await supabase.from("warehouses").select("code, name").order("code")).data ?? [],
  });

  const markClean = mark.trim().toUpperCase();
  const { data: customer } = useQuery({
    queryKey: ["mark-lookup", markClean],
    enabled: markClean.length >= 4,
    queryFn: async () =>
      (await supabase.from("profiles").select("id, full_name, phone").eq("shipping_mark", markClean).maybeSingle()).data,
  });

  function addCode(code: string) {
    const c = code.trim();
    if (!c) return;
    if (lines.some((l) => l.external_tracking === c)) {
      toast.warning(`${c} already scanned`);
      return;
    }
    setLines((ls) => [...ls, { external_tracking: c, pieces: 1, weight_kg: 0, cbm: 0, description: "" }]);
    setScan("");
    scanRef.current?.focus();
  }

  function update(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  }

  async function save() {
    if (!lines.length) return;
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (customer) await ensureContactShadow(customer.id, customer.full_name, customer.phone);
      const { data, error } = await supabase
        .from("packages")
        .insert(
          lines.map((l) => ({
            customer_id: customer?.id ?? null,
            shipping_mark: markClean || null,
            warehouse_code: wh,
            external_tracking: l.external_tracking,
            description: l.description || null,
            pieces: l.pieces,
            weight_kg: l.weight_kg,
            cbm: l.cbm,
            received_by: u.user?.id,
            status: "received" as const,
          })),
        )
        .select("id, tracking_code");
      if (error) throw error;
      if (customer && data?.length) {
        await notifyCustomer({
          customerId: customer.id,
          phone: customer.phone,
          event: "package_received",
          message: waTemplates.packageReceived(
            customer.full_name ?? "there",
            data.map((d) => d.tracking_code).join(", "),
            wh,
          ),
          packageId: data[0].id,
        });
      }
      toast.success(`${data?.length ?? 0} packages received${customer ? "" : " (unmatched mark)"}`);
      setLines([]);
      onDone();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const totals = lines.reduce(
    (t, l) => ({ pcs: t.pcs + l.pieces, kg: t.kg + l.weight_kg, cbm: t.cbm + l.cbm }),
    { pcs: 0, kg: 0, cbm: 0 },
  );

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-brand-orange" /> Batch intake
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 grid gap-2">
            <Label>Customer ID / mark</Label>
            <Input placeholder="ND0001" value={mark} onChange={(e) => setMark(e.target.value)} />
            <div className="text-xs">
              {markClean.length >= 4 &&
                (customer ? (
                  <span className="text-green-700">✓ {customer.full_name ?? "Customer found"}</span>
                ) : (
                  <span className="text-destructive">No customer with this ID — packages will be unmatched</span>
                ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Warehouse</Label>
            <Select value={wh} onValueChange={setWh}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {warehouses?.map((w) => (
                  <SelectItem key={w.code} value={w.code}>{w.code} — {w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Scan or type courier tracking, then press Enter</Label>
          <div className="flex gap-2">
            <Input
              ref={scanRef}
              autoFocus
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCode(scan);
                }
              }}
              placeholder="e.g. ZTO / SF / YTO number"
            />
            <Button type="button" variant="outline" onClick={() => setCamera((c) => !c)}>
              <Camera className="mr-1 h-4 w-4" /> {camera ? "Stop" : "Camera"}
            </Button>
          </div>
          {camera && <CameraScanner onCode={addCode} />}
        </div>

        <div className="max-h-[40vh] overflow-y-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-left">Tracking</th>
                <th className="px-2 py-2 text-left">Description</th>
                <th className="px-2 py-2">Pcs</th>
                <th className="px-2 py-2">Kg</th>
                <th className="px-2 py-2">CBM</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={l.external_tracking} className="border-t">
                  <td className="px-2 py-1 font-mono text-xs">{l.external_tracking}</td>
                  <td className="px-2 py-1"><Input className="h-8" value={l.description} onChange={(e) => update(i, { description: e.target.value })} /></td>
                  <td className="px-2 py-1"><Input className="h-8 w-16" type="number" min={1} value={l.pieces} onChange={(e) => update(i, { pieces: Number(e.target.value) || 1 })} /></td>
                  <td className="px-2 py-1"><Input className="h-8 w-20" type="number" step="0.01" value={l.weight_kg} onChange={(e) => update(i, { weight_kg: Number(e.target.value) || 0 })} /></td>
                  <td className="px-2 py-1"><Input className="h-8 w-20" type="number" step="0.001" value={l.cbm} onChange={(e) => update(i, { cbm: Number(e.target.value) || 0 })} /></td>
                  <td className="px-2 py-1">
                    <Button size="icon" variant="ghost" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!lines.length && (
                <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Nothing scanned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-muted-foreground">
          {lines.length} parcels · {totals.pcs} pcs · {totals.kg.toFixed(2)} kg · {totals.cbm.toFixed(3)} CBM
        </div>
      </div>
      <DialogFooter>
        <Button onClick={save} disabled={busy || !lines.length} className="bg-brand-orange hover:bg-brand-orange/90">
          {busy ? "Saving…" : `Receive ${lines.length} packages`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function CameraScanner({ onCode }: { onCode: (c: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const last = useRef("");
  const cb = useRef(onCode);
  cb.current = onCode;

  useEffect(() => {
    const W = window as unknown as { BarcodeDetector?: new () => BarcodeDetectorLike };
    if (!W.BarcodeDetector) {
      setErr("This browser can't scan with the camera. Use Chrome on Android, or a USB scanner.");
      return;
    }
    const detector = new W.BarcodeDetector();
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play();
        }
        timer = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const v = codes[0]?.rawValue;
            if (v && v !== last.current) {
              last.current = v;
              cb.current(v);
            }
          } catch {
            /* ignore frame errors */
          }
        }, 400);
      })
      .catch(() => setErr("Camera permission was denied."));
    return () => {
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (err) return <p className="text-sm text-destructive">{err}</p>;
  return <video ref={videoRef} muted playsInline className="h-48 w-full rounded-md bg-muted object-cover" />;
}
