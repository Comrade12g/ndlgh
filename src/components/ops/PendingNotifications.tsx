import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ops/PageHeader";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";
import { BellRing, Check, ChevronDown, ChevronUp, MessageCircle, Ship } from "lucide-react";

type Row = {
  id: string;
  customer_id: string | null;
  event_type: string;
  phone: string | null;
  message: string;
  status: string;
  created_at: string;
  shipment_id: string | null;
  profiles: { full_name: string | null; shipping_mark: string | null; phone: string | null } | null;
  shipments: { ndl_reference: string | null; code: string } | null;
};

const EVENT_LABEL: Record<string, string> = {
  shipment_departed: "Departed",
  shipment_arrived: "Arrived",
  shipment_cleared: "Cleared",
  package_received: "Package received",
  invoice_issued: "Invoice",
  payment_received: "Payment",
  delivery_scheduled: "Delivery scheduled",
  delivery_out_for_delivery: "Out for delivery",
  delivery_delivered: "Delivered",
  delivery_failed: "Delivery failed",
  custom_message: "Message",
};

export const eventLabel = (e: string) => EVENT_LABEL[e] ?? e.replace(/_/g, " ");

/** Queue of logged-but-unsent WhatsApp messages, grouped by shipment. */
export function PendingNotifications({ customerId }: { customerId?: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(!!customerId);
  const [eventFilter, setEventFilter] = useState("all");

  const { data: rows = [] } = useQuery({
    queryKey: ["pending-notifications", customerId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("customer_notifications")
        .select(
          "id, customer_id, event_type, phone, message, status, created_at, shipment_id, profiles:customer_id(full_name, shipping_mark, phone), shipments:shipment_id(ndl_reference, code)",
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(300);
      if (customerId) q = q.eq("customer_id", customerId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const filtered = eventFilter === "all" ? rows : rows.filter((r) => r.event_type === eventFilter);
  const groups = useMemo(() => {
    const m = new Map<string, { label: string; items: Row[] }>();
    for (const r of filtered) {
      const key = r.shipment_id ?? "none";
      const label = r.shipments ? (r.shipments.ndl_reference ?? r.shipments.code) : "Other updates";
      if (!m.has(key)) m.set(key, { label, items: [] });
      m.get(key)!.items.push(r);
    }
    return Array.from(m.values());
  }, [filtered]);
  const events = Array.from(new Set(rows.map((r) => r.event_type)));

  const refresh = () => qc.invalidateQueries({ queryKey: ["pending-notifications"] });

  async function mark(ids: string[], status: "clicked" | "dismissed") {
    const { error } = await supabase.from("customer_notifications").update({ status }).in("id", ids);
    if (error) toast.error(error.message);
    refresh();
  }

  function send(r: Row) {
    const phone = r.phone ?? r.profiles?.phone ?? null;
    if (!openWhatsApp(phone, r.message)) {
      toast.error("This customer has no valid phone number");
      return;
    }
    mark([r.id], "clicked");
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 bg-brand-navy px-4 py-3 text-left text-primary-foreground"
      >
        <BellRing className="h-5 w-5 text-brand-orange" />
        <div className="flex-1">
          <div className="font-display font-bold">
            {customerId ? "Updates waiting for this customer" : "Updates waiting to be sent"}
          </div>
          <div className="text-xs opacity-80">
            Shipment milestone and other WhatsApp messages that haven't been sent yet
          </div>
        </div>
        <span className="rounded-full bg-brand-orange px-2.5 py-0.5 text-sm font-bold">{rows.length}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="p-4">
          {!rows.length ? (
            <p className="text-sm text-muted-foreground">Nothing waiting. All customers are up to date.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {["all", ...events].map((e) => (
                  <Button
                    key={e}
                    size="sm"
                    variant={eventFilter === e ? "default" : "outline"}
                    onClick={() => setEventFilter(e)}
                  >
                    {e === "all" ? "All" : eventLabel(e)}
                  </Button>
                ))}
              </div>
              <div className="space-y-4">
                {groups.map((g) => (
                  <div key={g.label} className="rounded-lg border">
                    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2">
                      <Ship className="h-4 w-4 text-brand-sky" />
                      <span className="font-mono text-sm font-bold text-brand-navy">{g.label}</span>
                      <span className="text-xs text-muted-foreground">{g.items.length} customer(s)</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto"
                        onClick={() => mark(g.items.map((i) => i.id), "clicked")}
                      >
                        <Check className="mr-1 h-4 w-4" /> Mark all sent
                      </Button>
                    </div>
                    <ul className="divide-y">
                      {g.items.map((r) => (
                        <li key={r.id} className="flex flex-wrap items-start gap-3 px-3 py-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-brand-orange">
                                {r.profiles?.shipping_mark ?? "—"}
                              </span>
                              <span className="text-sm font-semibold text-brand-navy">
                                {r.profiles?.full_name ?? "Customer"}
                              </span>
                              <StatusBadge tone="amber">{eventLabel(r.event_type)}</StatusBadge>
                            </div>
                            <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">
                              {r.message}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => send(r)} className="bg-brand-orange hover:bg-brand-orange/90">
                              <MessageCircle className="mr-1 h-4 w-4" /> Send
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => mark([r.id], "dismissed")}>
                              Skip
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
