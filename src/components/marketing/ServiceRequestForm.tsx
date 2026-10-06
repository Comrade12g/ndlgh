import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitServiceRequest } from "@/lib/service-requests.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";
import { NDL_PHONE_INTL } from "@/components/marketing/MarketingLayout";

type Service = "supplier_payment" | "procurement" | "training" | "shipping_payment";

const SERVICE_LABEL: Record<Service, string> = {
  supplier_payment: "Supplier payment",
  procurement: "Procurement / sourcing",
  training: "Import training",
  shipping_payment: "Shipping + payment",
};

function track(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
  w.gtag?.("event", event, params);
}

const selectCls =
  "flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ServiceRequestForm({ variant = "full" }: { variant?: "full" | "training" }) {
  const send = useServerFn(submitServiceRequest);
  const startedAt = useRef(Date.now());
  const isTraining = variant === "training";
  const [service, setService] = useState<Service>(isTraining ? "training" : "supplier_payment");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ name: string; service: Service } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    if (!consent) return setError("Please agree to be contacted.");
    setBusy(true);
    try {
      const res = await send({
        data: {
          fullName: get("fullName"),
          phone: get("phone"),
          email: get("email"),
          serviceNeeded: service,
          whatToBuy: get("whatToBuy"),
          budget: get("budget"),
          supplierLocation: get("supplierLocation") as "guangzhou" | "yiwu" | "other" | "",
          contactTime: get("contactTime"),
          experienceLevel: get("experienceLevel") as "beginner" | "some" | "experienced" | "",
          message: get("message"),
          consent: true,
          website: get("website"),
          startedAt: startedAt.current,
        },
      });
      if (!res.ok) return setError(res.error);
      track("service_request_submitted", { service_needed: service, form: variant });
      setDone({ name: get("fullName"), service });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      try {
        const parsed = JSON.parse(msg);
        setError(parsed?.[0]?.message ?? "Please check the form and try again.");
      } catch {
        setError("Please check the form and try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-orange" />
        <h3 className="mt-4 font-display text-2xl font-bold text-brand-navy">Request received</h3>
        <p className="mt-2 text-muted-foreground">
          Thank you{done.name ? `, ${done.name.split(" ")[0]}` : ""}. Our team will contact you on WhatsApp.
        </p>
        <Button
          className="mt-6 bg-brand-orange hover:bg-brand-orange/90"
          onClick={() =>
            openWhatsApp(
              NDL_PHONE_INTL,
              `Hello NDL Cargo, I just sent a ${SERVICE_LABEL[done.service]} request on your website. My name is ${done.name}.`,
            )
          }
        >
          <MessageCircle className="mr-2 h-4 w-4" /> Continue on WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-card p-6 md:p-8" noValidate>
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${variant}-name`}>Full name *</Label>
          <Input id={`${variant}-name`} name="fullName" required maxLength={120} className="h-11" />
        </div>
        <div>
          <Label htmlFor={`${variant}-phone`}>WhatsApp number *</Label>
          <Input id={`${variant}-phone`} name="phone" required maxLength={30} placeholder="+233 …" className="h-11" />
        </div>
      </div>
      {!isTraining && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="full-email">Email (optional)</Label>
              <Input id="full-email" name="email" type="email" maxLength={255} className="h-11" />
            </div>
            <div>
              <Label htmlFor="full-service">Service needed *</Label>
              <select
                id="full-service"
                className={selectCls}
                value={service}
                onChange={(e) => setService(e.target.value as Service)}
              >
                {(Object.keys(SERVICE_LABEL) as Service[]).map((s) => (
                  <option key={s} value={s}>{SERVICE_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="full-what">What do you want to buy or pay for?</Label>
            <Textarea id="full-what" name="whatToBuy" maxLength={1000} rows={3} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="full-budget">Approx. amount / budget</Label>
              <Input id="full-budget" name="budget" maxLength={100} placeholder="e.g. $2,000" className="h-11" />
            </div>
            <div>
              <Label htmlFor="full-loc">Supplier location</Label>
              <select id="full-loc" name="supplierLocation" className={selectCls} defaultValue="">
                <option value="">Not sure</option>
                <option value="guangzhou">Guangzhou</option>
                <option value="yiwu">Yiwu</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="full-time">Preferred contact time</Label>
              <Input id="full-time" name="contactTime" maxLength={100} placeholder="e.g. Mornings" className="h-11" />
            </div>
          </div>
        </>
      )}
      {isTraining && (
        <div>
          <Label htmlFor="training-exp">Experience level</Label>
          <select id="training-exp" name="experienceLevel" className={selectCls} defaultValue="beginner">
            <option value="beginner">Never imported before</option>
            <option value="some">Imported a few times</option>
            <option value="experienced">Experienced importer</option>
          </select>
        </div>
      )}
      <div>
        <Label htmlFor={`${variant}-msg`}>{isTraining ? "What do you want to learn?" : "Message"}</Label>
        <Textarea id={`${variant}-msg`} name="message" maxLength={2000} rows={3} />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
        <span>I agree to be contacted by NDL Cargo about this request by WhatsApp, phone or email. *</span>
      </label>
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
        We will never ask for bank details, card numbers, passwords, mobile money PINs or ID numbers on this form.
      </p>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} className="h-11 w-full bg-brand-orange hover:bg-brand-orange/90 sm:w-auto">
        {busy ? "Sending…" : isTraining ? "Enrol my interest" : "Send request"}
      </Button>
    </form>
  );
}
