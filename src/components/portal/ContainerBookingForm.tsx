import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createStaffContainerBooking, submitContainerBooking } from "@/lib/container-booking.functions";
import { guestBookingSchema, staffBookingSchema } from "@/lib/container-booking";

export function ContainerBookingForm({ staff = false, onSaved }: { staff?: boolean; onSaved?: () => void }) {
  const guestSubmit = useServerFn(submitContainerBooking);
  const staffSubmit = useServerFn(createStaffContainerBooking);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [customerBooking, setCustomerBooking] = useState(false);
  const { data: customers } = useQuery({ queryKey: ["booking-customers"], enabled: staff, queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("id, full_name, shipping_mark").order("full_name");
    if (error) throw error;
    return data ?? [];
  } });
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const input = { ...values, consent: values.consent === "on" };
    const parsed = staff ? staffBookingSchema.safeParse(input) : guestBookingSchema.safeParse(input);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your booking details."); return; }
    setSaving(true); setError("");
    try {
      if (staff) {
        const result = await staffSubmit({ data: staffBookingSchema.parse(input) });
        setCode(result.code); setCustomerBooking(true);
      } else {
        const result = await guestSubmit({ data: guestBookingSchema.parse(input) });
        setCode(result.code); setCustomerBooking(result.customerBooking);
      }
      form.reset(); onSaved?.();
    } catch { setError("Could not send your booking. Please try again."); }
    finally { setSaving(false); }
  }
  return <div>
    {code && <div role="status" className="mb-5 border-l-4 border-brand-orange bg-muted p-4"><p className="font-semibold">Booking received: {code}</p><p className="text-sm text-muted-foreground">Our team will contact you to confirm the price and arrangements.</p>{customerBooking && <Link to="/portal/containers/$code" params={{ code }} className="text-brand-sky underline">Track this container</Link>}</div>}
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {staff ? <div className="sm:col-span-2"><Label htmlFor="booking-customer">Customer</Label><select id="booking-customer" name="customer_id" required className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select customer</option>{customers?.map(c => <option key={c.id} value={c.id}>{c.full_name} · {c.shipping_mark}</option>)}</select></div> : <>
        <div><Label htmlFor="booking-name">Full name</Label><Input id="booking-name" name="full_name" required minLength={2} maxLength={120} autoComplete="name" /></div>
        <div><Label htmlFor="booking-phone">Phone / WhatsApp</Label><Input id="booking-phone" name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" /></div>
        <div className="sm:col-span-2"><Label htmlFor="booking-email">Email (optional)</Label><Input id="booking-email" name="email" type="email" maxLength={255} autoComplete="email" /></div>
        <div className="hidden" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      </>}
      <div><Label htmlFor="booking-size">Container size</Label><select id="booking-size" name="container_size" defaultValue="40ft" className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="20ft">20ft standard</option><option value="40ft">40ft standard</option><option value="40hq">40ft High Cube</option></select></div>
      <div><Label htmlFor="booking-quantity">Number of containers</Label><Input id="booking-quantity" name="quantity" type="number" min={1} max={50} step={1} defaultValue={1} required /></div>
      <div><Label htmlFor="booking-origin">Loading city in China</Label><Input id="booking-origin" name="origin_city" defaultValue="Guangzhou" required minLength={2} maxLength={80} /></div>
      <div><Label htmlFor="booking-date">Goods ready date</Label><Input id="booking-date" name="cargo_ready_date" type="date" /></div>
      <div><Label htmlFor="booking-goods">What goods are you shipping?</Label><Input id="booking-goods" name="commodity" required minLength={2} maxLength={200} /></div>
      <div><Label htmlFor="booking-city">Delivery town in Ghana</Label><Input id="booking-city" name="delivery_city" maxLength={80} /></div>
      <div className="sm:col-span-2"><Label htmlFor="booking-notes">Notes (optional)</Label><Textarea id="booking-notes" name="notes" maxLength={1000} /></div>
      {!staff && <div className="flex items-start gap-2 sm:col-span-2"><Checkbox id="booking-consent" name="consent" required /><Label htmlFor="booking-consent">I agree to be contacted about this booking and the <Link to="/privacy" className="text-brand-sky underline">privacy policy</Link>.</Label></div>}
      {error && <p role="alert" className="text-destructive sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Sending…" : staff ? "Create booking" : "Send booking request"}</Button></div>
    </form>
  </div>;
}