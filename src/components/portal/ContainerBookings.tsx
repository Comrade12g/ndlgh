import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Container, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const SIZE_LABEL: Record<string, string> = { "20ft": "20ft standard", "40ft": "40ft standard", "40hq": "40ft High Cube" };
export const BOOKING_STATUS: { key: string; label: string }[] = [
  { key: "requested", label: "Booking requested" },
  { key: "confirmed", label: "Booking confirmed" },
  { key: "loading", label: "Loading in China" },
  { key: "in_transit", label: "On the ocean" },
  { key: "arrived", label: "Arrived Tema Port" },
  { key: "clearing", label: "Customs clearing" },
  { key: "delivered", label: "Delivered" },
];
export function statusLabel(s: string) {
  return s === "cancelled" ? "Cancelled" : BOOKING_STATUS.find((x) => x.key === s)?.label ?? s;
}

export function ContainerBookings() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ container_size: "40hq", quantity: "1", origin_city: "Guangzhou", commodity: "", cargo_ready_date: "", delivery_city: "", notes: "" });

  const { data: bookings } = useQuery({
    queryKey: ["portal-container-bookings"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("container_bookings")
        .select("code, container_size, quantity, origin_city, status, created_at")
        .eq("customer_id", u.user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.commodity.trim() || !form.origin_city.trim()) return toast.error("Please fill in your goods and loading city");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("container_bookings")
      .insert({
        customer_id: u.user!.id,
        container_size: form.container_size,
        quantity: Math.max(1, Math.min(50, Number(form.quantity) || 1)),
        origin_city: form.origin_city.trim(),
        commodity: form.commodity.trim(),
        cargo_ready_date: form.cargo_ready_date || null,
        delivery_city: form.delivery_city.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select("code")
      .single();
    setSaving(false);
    if (error) return toast.error("Could not send booking. Please try again.");
    toast.success(`Booking ${data.code} sent. Our team will contact you with a price.`);
    setOpen(false);
    setForm({ ...form, commodity: "", notes: "", cargo_ready_date: "" });
    qc.invalidateQueries({ queryKey: ["portal-container-bookings"] });
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Container className="h-5 w-5 text-brand-orange" />
          <h2 className="font-display text-xl font-bold text-brand-navy">Full container (FCL) bookings</h2>
        </div>
        <Button onClick={() => setOpen((o) => !o)} className="bg-brand-orange hover:bg-brand-orange/90">
          <Plus className="mr-1 h-4 w-4" /> Book a container
        </Button>
      </div>

      {open && (
        <Card className="mb-4 p-5">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fcl-size">Container size</Label>
              <select id="fcl-size" value={form.container_size} onChange={(e) => setForm({ ...form, container_size: e.target.value })}
                className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="20ft">20ft standard (about 25–28 CBM)</option>
                <option value="40ft">40ft standard (about 55–58 CBM)</option>
                <option value="40hq">40ft High Cube (about 65–68 CBM)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="fcl-qty">Number of containers</Label>
              <Input id="fcl-qty" type="number" min={1} max={50} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fcl-origin">Loading city in China</Label>
              <Input id="fcl-origin" value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })} className="mt-1" maxLength={80} />
            </div>
            <div>
              <Label htmlFor="fcl-ready">Goods ready date</Label>
              <Input id="fcl-ready" type="date" value={form.cargo_ready_date} onChange={(e) => setForm({ ...form, cargo_ready_date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="fcl-goods">What goods are you shipping?</Label>
              <Input id="fcl-goods" value={form.commodity} onChange={(e) => setForm({ ...form, commodity: e.target.value })} className="mt-1" placeholder="e.g. floor tiles, furniture" maxLength={200} />
            </div>
            <div>
              <Label htmlFor="fcl-dest">Delivery town in Ghana</Label>
              <Input id="fcl-dest" value={form.delivery_city} onChange={(e) => setForm({ ...form, delivery_city: e.target.value })} className="mt-1" placeholder="e.g. Accra, Kumasi" maxLength={80} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="fcl-notes">Notes (optional)</Label>
              <Textarea id="fcl-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" maxLength={1000} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90">{saving ? "Sending…" : "Send booking request"}</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {bookings && bookings.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {bookings.map((b) => (
            <Link key={b.code} to="/portal/containers/$code" params={{ code: b.code }}>
              <Card className="flex items-center justify-between p-4 transition hover:border-brand-orange">
                <div>
                  <div className="font-mono font-bold text-brand-navy">{b.code}</div>
                  <div className="text-sm text-muted-foreground">{b.quantity} × {SIZE_LABEL[b.container_size] ?? b.container_size} · from {b.origin_city}</div>
                  <div className="mt-1 text-xs font-semibold text-brand-orange">{statusLabel(b.status)}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        !open && <Card className="p-5 text-sm text-muted-foreground">No container bookings yet. Book a full 20ft or 40ft container and track it here.</Card>
      )}
    </section>
  );
}
