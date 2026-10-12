import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { draftSms } from "@/lib/sms-draft.functions";
import { sendSms } from "@/lib/sms.functions";
import { toast } from "sonner";

export function AiSmsDrafter({ onSent }: { onSent?: () => void }) {
  const [f, setF] = useState({ name: "", phone: "", mark: "", reference: "", update: "" });
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<"" | "draft" | "send">("");
  const set = (k: keyof typeof f) => (e: any) => setF({ ...f, [k]: e.target.value });

  async function generate() {
    if (!f.name || f.update.length < 3) return toast.error("Add the customer name and the update");
    setBusy("draft");
    try {
      const r = await draftSms({ data: { name: f.name, mark: f.mark, reference: f.reference, update: f.update } });
      setDraft(r.text);
    } catch (e: any) { toast.error(e.message ?? "Could not draft"); }
    finally { setBusy(""); }
  }

  async function send() {
    if (!f.phone || !draft) return toast.error("Add a phone number and a message");
    setBusy("send");
    try {
      const r: any = await sendSms({ data: { phone: f.phone, message: draft } });
      if (r?.ok) { toast.success("SMS sent"); onSent?.(); } else toast.error(r?.reason ?? "SMS failed");
    } catch (e: any) { toast.error(e.message ?? "SMS failed"); }
    finally { setBusy(""); }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="font-medium text-brand-navy">AI SMS writer</div>
      <p className="text-sm text-muted-foreground">Type the shipment update and customer details. AI drafts a clear, personal SMS you can edit before sending.</p>
      <div className="grid gap-2 sm:grid-cols-4">
        <Input placeholder="Customer name" value={f.name} onChange={set("name")} />
        <Input placeholder="Phone e.g. 024…" value={f.phone} onChange={set("phone")} />
        <Input placeholder="Mark e.g. ND0016" value={f.mark} onChange={set("mark")} />
        <Input placeholder="Ref e.g. NDL-CN-01004" value={f.reference} onChange={set("reference")} />
      </div>
      <Textarea placeholder="Update, e.g. container arrived Tema today, clearing takes 3 days, invoice GHS 1,450" value={f.update} onChange={set("update")} rows={3} />
      <Button onClick={generate} disabled={!!busy} variant="outline">{busy === "draft" ? "Writing…" : draft ? "Rewrite" : "Draft SMS"}</Button>
      {draft && (
        <div className="space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{draft.length} characters · {Math.ceil(draft.length / 160)} SMS credit(s)</span>
            <Button onClick={send} disabled={!!busy}>{busy === "send" ? "Sending…" : "Send SMS"}</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
