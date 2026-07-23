import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState, StatusBadge, statusTone } from "@/components/ops/PageHeader";
import { openWhatsApp } from "@/lib/whatsapp";
import { recordInviteWhatsapp } from "@/lib/invite-audit";
import { Plus, Search, Mail, Phone, KeyRound, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/crm/contacts")({
  component: ContactsPage,
});

type ContactType = "lead" | "customer" | "supplier_contact";
type ContactStatus = "new" | "active" | "vip" | "dormant" | "blocked";

function ContactsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loginContact, setLoginContact] = useState<{
    id: string;
    full_name: string;
    phone: string | null;
  } | null>(null);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts", search],
    queryFn: async () => {
      let q = supabase
        .from("contacts")
        .select("id, full_name, company, email, phone, country, type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (search) q = q.ilike("full_name", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        eyebrow="CRM"
        title="Contacts"
        description="Leads, customers, and supplier contacts. Assign to sales, track status, and connect to shipments."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <Plus className="mr-2 h-4 w-4" /> New contact
              </Button>
            </DialogTrigger>
            <NewContactDialog
              onDone={() => {
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["contacts"] });
              }}
            />
          </Dialog>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !contacts?.length ? (
          <EmptyState
            title="No contacts yet"
            description="Add your first lead, customer, or supplier contact to start tracking sales."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Country</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{c.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.company ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-xs">
                        {c.email && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" /> {c.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.country ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {c.type.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone(c.status)}>{c.status}</StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      {c.type === "customer" && c.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setLoginContact({ id: c.id, full_name: c.full_name, phone: c.phone })
                          }
                        >
                          <KeyRound className="mr-1 h-3 w-3" /> Create login
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!loginContact} onOpenChange={(o) => !o && setLoginContact(null)}>
        {loginContact && (
          <CreateCustomerLoginDialog contact={loginContact} onDone={() => setLoginContact(null)} />
        )}
      </Dialog>
    </div>
  );
}

function CreateCustomerLoginDialog({
  contact,
  onDone,
}: {
  contact: { id: string; full_name: string; phone: string | null };
  onDone: () => void;
}) {
  const [result, setResult] = useState<{
    phone: string;
    tempPassword: string;
    shippingMark: string | null;
    auditId: string | null;
  } | null>(null);

  const mut = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("create-customer", {
        body: { phone: contact.phone, full_name: contact.full_name },
        headers: session.session
          ? { Authorization: `Bearer ${session.session.access_token}` }
          : undefined,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { phone: string; tempPassword: string; shippingMark: string | null; auditId: string | null };
    },
    onSuccess: (data) => {
      toast.success("Login created");
      setResult(data);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (result) {
    const message = `Hi ${contact.full_name}, welcome to NDL Ghana! Your shipping mark is ${result.shippingMark ?? "—"}.\n\nLog in to your customer portal with:\nPhone: ${result.phone}\nPassword: ${result.tempPassword}\n\nPlease change your password after your first login. — NDL Global Shipping`;
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Login created</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 text-sm">
          <div className="rounded-md bg-muted p-3">
            <div className="text-xs text-muted-foreground">Shipping mark</div>
            <div className="font-mono font-bold text-brand-navy">{result.shippingMark ?? "—"}</div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="text-xs text-muted-foreground">Phone (login)</div>
            <div className="font-mono font-bold text-brand-navy">{result.phone}</div>
          </div>
          <div className="rounded-md bg-muted p-3">
            <div className="text-xs text-muted-foreground">Temporary password</div>
            <div className="font-mono font-bold text-brand-navy">{result.tempPassword}</div>
          </div>
          <p className="text-xs text-muted-foreground">
            Send these details to the customer now — this password won't be shown again.
          </p>
        </div>
        <DialogFooter>
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              const ok = openWhatsApp(contact.phone, message);
              if (!ok) {
                toast.error("No valid phone number on file");
                void recordInviteWhatsapp(result.auditId, "failed", "Invalid phone number");
              } else {
                void recordInviteWhatsapp(result.auditId, "initiated");
              }
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Send login info via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Create customer login</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 text-sm">
        <p className="text-muted-foreground">
          This creates a portal login for{" "}
          <span className="font-semibold text-brand-navy">{contact.full_name}</span> using their
          phone number — no email needed. You'll get a temporary password to send them over
          WhatsApp.
        </p>
        <div className="rounded-md bg-muted p-3">
          <div className="text-xs text-muted-foreground">Phone</div>
          <div className="font-mono font-semibold text-brand-navy">{contact.phone}</div>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={mut.isPending}
          className="bg-brand-orange hover:bg-brand-orange/90"
          onClick={() => mut.mutate()}
        >
          {mut.isPending ? "Creating…" : "Create login"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function NewContactDialog({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    type: "lead" as ContactType,
    status: "new" as ContactStatus,
    notes: "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("contacts").insert({ ...form, created_by: u.user?.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contact created");
      onDone();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>New contact</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="grid gap-3"
      >
        <div className="grid gap-2">
          <Label>Full name</Label>
          <Input
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Company</Label>
            <Input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Country</Label>
            <Input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v as ContactType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="supplier_contact">Supplier contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as ContactStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Notes</Label>
          <Textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {mut.isPending ? "Saving…" : "Save contact"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
