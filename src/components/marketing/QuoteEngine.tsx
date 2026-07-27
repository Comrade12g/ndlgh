import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { getIndicativeRate } from "@/lib/public-api.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { openWhatsApp } from "@/lib/whatsapp";
import { NDL_PHONE_INTL } from "./MarketingLayout";
import { Ship, Plane, Calculator, MessageCircle } from "lucide-react";

const ORIGINS = [
  { code: "CN-YIWU", label: "Yiwu, China" },
  { code: "CN-GZ", label: "Guangzhou, China" },
  { code: "CN-TZ", label: "Taizhou, China" },
  { code: "AE-DXB", label: "Dubai, UAE" },
  { code: "TH-BKK", label: "Bangkok, Thailand" },
  { code: "CA-YTO", label: "Toronto, Canada" },
  { code: "US-NYC", label: "New York, USA" },
];

const MODES = [
  { value: "sea_lcl", label: "Sea — LCL groupage", icon: Ship },
  { value: "sea_fcl", label: "Sea — FCL container", icon: Ship },
  { value: "air", label: "Air freight", icon: Plane },
];

export function QuoteEngine({ compact = false }: { compact?: boolean }) {
  const [origin, setOrigin] = useState("CN-YIWU");
  const [mode, setMode] = useState("sea_lcl");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [pieces, setPieces] = useState("1");

  const cbm = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    const p = Number(pieces) || 1;
    return (l * w * h * p) / 1_000_000;
  }, [length, width, height, pieces]);

  const fetchRate = useServerFn(getIndicativeRate);
  const mut = useMutation({ mutationFn: fetchRate });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    mut.mutate({
      data: {
        origin,
        mode,
        weightKg: Number(weight) || 0,
        cbm,
      },
    });
  }

  const originLabel = ORIGINS.find((o) => o.code === origin)?.label ?? origin;

  return (
    <Card className={compact ? "p-5" : "p-6 md:p-8"}>
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-brand-orange/10 p-2 text-brand-orange">
          <Calculator className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-brand-navy">Instant freight quote</h3>
          <p className="text-xs text-muted-foreground">Indicative rates from live tariffs</p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Origin</Label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ORIGINS.map((o) => (
                <SelectItem key={o.code} value={o.code}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Mode</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Weight (kg)</Label>
          <Input type="number" min="0" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 50" />
        </div>
        <div>
          <Label>Pieces</Label>
          <Input type="number" min="1" step="1" value={pieces} onChange={(e) => setPieces(e.target.value)} />
        </div>
        <div>
          <Label>Length (cm)</Label>
          <Input type="number" min="0" step="1" value={length} onChange={(e) => setLength(e.target.value)} />
        </div>
        <div>
          <Label>Width (cm)</Label>
          <Input type="number" min="0" step="1" value={width} onChange={(e) => setWidth(e.target.value)} />
        </div>
        <div>
          <Label>Height (cm)</Label>
          <Input type="number" min="0" step="1" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>
        <div className="rounded-md bg-secondary/60 p-2 text-center text-sm md:col-span-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume</div>
          <div className="font-mono text-lg font-bold text-brand-navy tabular-nums">
            {cbm.toFixed(4)} CBM
          </div>
        </div>

        <div className="md:col-span-2">
          <Button
            type="submit"
            className="w-full bg-brand-orange text-white hover:bg-brand-orange/90"
            disabled={mut.isPending}
          >
            {mut.isPending ? "Calculating…" : "Calculate rate"}
          </Button>
        </div>
      </form>

      {mut.data && (
        <div className="mt-5 rounded-xl border-2 border-brand-orange/40 bg-gradient-to-br from-brand-orange/5 to-transparent p-5">
          {mut.data.available ? (
            <>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Indicative total — {originLabel}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-brand-navy tabular-nums">
                  {mut.data.currency} {mut.data.amount.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({mut.data.unit} · {mut.data.qty.toFixed(2)} × {mut.data.currency} {mut.data.unit_price.toFixed(2)})
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Indicative — final quote confirmed after inspection. Excludes duties, taxes, and last-mile delivery.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openWhatsApp(
                      NDL_PHONE_INTL,
                      `Hello NDL, I'd like a formal quote:\nOrigin: ${originLabel}\nMode: ${mode}\nWeight: ${weight} kg · Volume: ${cbm.toFixed(4)} CBM\nIndicative: ${mut.data && mut.data.available ? `${mut.data.currency} ${mut.data.amount.toFixed(2)}` : "n/a"}`,
                    )
                  }
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> Confirm on WhatsApp
                </Button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-brand-navy">
                We don't have a live tariff for that lane yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Contact our team on WhatsApp for a bespoke quote — usually replied within an hour during business days.
              </p>
              <Button
                size="sm"
                className="mt-3 bg-[#25D366] hover:bg-[#25D366]/90"
                onClick={() =>
                  openWhatsApp(NDL_PHONE_INTL, `Hello NDL, I need a quote for ${originLabel} → Tema (${mode}), ${weight} kg / ${cbm.toFixed(4)} CBM.`)
                }
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Request quote
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
