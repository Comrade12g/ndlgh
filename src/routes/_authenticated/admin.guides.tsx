import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/ops/PageHeader";
import { IMG } from "@/assets/gallery";
import { GUIDE_CATEGORIES } from "@/content/guides";
import { Plus, Trash2, Pencil, Eye, Send, FileText, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin/guides")({
  component: AdminGuidesPage,
});

type SectionForm = { h: string; p: string; bullets: string };
type FaqForm = { q: string; a: string };

type FormState = {
  id?: string;
  slug: string;
  title: string;
  seo_title: string;
  description: string;
  category: string;
  image: string;
  image_alt: string;
  read_minutes: number;
  keywords: string;
  intro: string;
  sections: SectionForm[];
  faqs: FaqForm[];
  status: "draft" | "published";
};

const EMPTY: FormState = {
  slug: "",
  title: "",
  seo_title: "",
  description: "",
  category: GUIDE_CATEGORIES[0].slug,
  image: IMG.stackedContainers,
  image_alt: "",
  read_minutes: 6,
  keywords: "",
  intro: "",
  sections: [{ h: "", p: "", bullets: "" }],
  faqs: [],
  status: "draft",
};

const IMAGE_OPTIONS = Object.entries(IMG);

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

function linesToArray(v: string) {
  return v
    .split(/\n{2,}|\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function AdminGuidesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: guides, isLoading } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (f: FormState) => {
      const slug = slugify(f.slug || f.title);
      if (!slug) throw new Error("A title or slug is required");
      if (!f.title.trim()) throw new Error("Title is required");
      const payload = {
        slug,
        title: f.title.trim(),
        seo_title: (f.seo_title || f.title).trim(),
        description: f.description.trim(),
        category: f.category,
        image: f.image,
        image_alt: f.image_alt.trim() || f.title.trim(),
        read_minutes: Math.max(1, Number(f.read_minutes) || 5),
        keywords: f.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        intro: linesToArray(f.intro),
        sections: f.sections
          .filter((s) => s.h.trim())
          .map((s) => ({
            h: s.h.trim(),
            ...(linesToArray(s.p).length ? { p: linesToArray(s.p) } : {}),
            ...(linesToArray(s.bullets).length ? { bullets: linesToArray(s.bullets) } : {}),
          })),
        faqs: f.faqs.filter((x) => x.q.trim() && x.a.trim()).map((x) => ({ q: x.q.trim(), a: x.a.trim() })),
        status: f.status,
        published_at: f.status === "published" ? new Date().toISOString() : null,
      };
      if (f.id) {
        const { error } = await supabase.from("guides").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("guides").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Guide saved");
      qc.invalidateQueries({ queryKey: ["admin-guides"] });
      setOpen(false);
      setForm(EMPTY);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const toggleStatus = useMutation({
    mutationFn: async (row: { id: string; status: string }) => {
      const next = row.status === "published" ? "draft" : "published";
      const { error } = await supabase
        .from("guides")
        .update({
          status: next,
          published_at: next === "published" ? new Date().toISOString() : null,
        })
        .eq("id", row.id);
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      toast.success(next === "published" ? "Guide published — it's live now" : "Moved to draft");
      qc.invalidateQueries({ queryKey: ["admin-guides"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("guides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Guide deleted");
      qc.invalidateQueries({ queryKey: ["admin-guides"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function edit(row: NonNullable<typeof guides>[number]) {
    const sections = Array.isArray(row.sections) ? (row.sections as Record<string, unknown>[]) : [];
    const faqs = Array.isArray(row.faqs) ? (row.faqs as Record<string, unknown>[]) : [];
    setForm({
      id: row.id,
      slug: row.slug,
      title: row.title,
      seo_title: row.seo_title,
      description: row.description,
      category: row.category,
      image: row.image,
      image_alt: row.image_alt,
      read_minutes: row.read_minutes,
      keywords: Array.isArray(row.keywords) ? (row.keywords as string[]).join(", ") : "",
      intro: Array.isArray(row.intro) ? (row.intro as string[]).join("\n\n") : "",
      sections: sections.length
        ? sections.map((s) => ({
            h: String(s["h"] ?? ""),
            p: Array.isArray(s["p"]) ? (s["p"] as string[]).join("\n\n") : "",
            bullets: Array.isArray(s["bullets"]) ? (s["bullets"] as string[]).join("\n") : "",
          }))
        : [{ h: "", p: "", bullets: "" }],
      faqs: faqs.map((f) => ({ q: String(f["q"] ?? ""), a: String(f["a"] ?? "") })),
      status: row.status === "published" ? "published" : "draft",
    });
    setOpen(true);
  }

  const rows = (guides ?? []).filter((g) => statusFilter === "all" || g.status === statusFilter);

  return (
    <div className="p-4 md:p-8">
      <PageHeader
        eyebrow="Content"
        title="Guides CMS"
        description="Write, edit and publish SEO guides for the marketing site — published guides go live immediately, no redeploy needed."
        actions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="bg-brand-orange text-white hover:bg-brand-orange/90"
              onClick={() => {
                setForm(EMPTY);
                setOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> New guide
            </Button>
          </>
        }
      />

      <Tabs defaultValue="guides">
        <TabsList>
          <TabsTrigger value="guides">
            <FileText className="mr-2 h-4 w-4" /> Guides ({guides?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="mr-2 h-4 w-4" /> Leads ({leads?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-4">
          {isLoading ? (
            <Card className="p-6 text-sm text-muted-foreground">Loading guides…</Card>
          ) : rows.length === 0 ? (
            <EmptyState
              title="No CMS guides yet"
              description="The built-in guide library is already live. Create a guide here to add to it or override an existing slug."
            />
          ) : (
            <div className="space-y-3">
              {rows.map((g) => (
                <Card key={g.id} className="flex flex-wrap items-center gap-4 p-4">
                  <img
                    src={g.image || IMG.stackedContainers}
                    alt=""
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                  <div className="min-w-[220px] flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-brand-navy">{g.title}</span>
                      <Badge variant={g.status === "published" ? "default" : "secondary"}>
                        {g.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /guides/{g.slug} · {g.category} · {g.read_minutes} min
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {g.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {g.status === "published" && (
                      <a href={`/guides/${g.slug}`} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost" aria-label="View live">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus.mutate({ id: g.id, status: g.status })}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {g.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => edit(g)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={() => {
                        if (confirm(`Delete "${g.title}"? This cannot be undone.`)) {
                          remove.mutate(g.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          {!leads || leads.length === 0 ? (
            <EmptyState
              title="No leads captured yet"
              description="Newsletter and consultation signups from the guides pages will appear here."
            />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    {["Received", "Type", "Name", "Email", "Phone", "From", "Message"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(l.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={l.lead_type === "consultation" ? "default" : "secondary"}>
                          {l.lead_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{l.full_name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <a className="text-brand-sky hover:underline" href={`mailto:${l.email}`}>
                          {l.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">{l.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {l.source_path ?? "—"}
                      </td>
                      <td className="max-w-[280px] px-4 py-3 text-xs text-muted-foreground">
                        {l.message ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit guide" : "New guide"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="How GRA calculates duty at Tema Port"
                />
              </div>
              <div>
                <Label>URL slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder={slugify(form.title) || "auto-from-title"}
                />
              </div>
            </div>

            <div>
              <Label>SEO title (under 60 characters)</Label>
              <Input
                value={form.seo_title}
                onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                placeholder="Import Duty in Ghana Explained (2026)"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {(form.seo_title || form.title).length} characters
              </p>
            </div>

            <div>
              <Label>Meta description (under 160 characters)</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {form.description.length} characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GUIDE_CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cover image</Label>
                <Select value={form.image} onValueChange={(v) => setForm({ ...form, image: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_OPTIONS.map(([name, url]) => (
                      <SelectItem key={url} value={url}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Read time (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.read_minutes}
                  onChange={(e) => setForm({ ...form, read_minutes: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Image alt text</Label>
              <Input
                value={form.image_alt}
                onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
                placeholder="Customs officers inspecting cargo at Tema Port"
              />
            </div>

            <div>
              <Label>Keywords (comma separated)</Label>
              <Input
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="import duty Ghana, Tema port clearing, ICUMS"
              />
            </div>

            <div>
              <Label>Intro paragraphs (one per line)</Label>
              <Textarea
                rows={3}
                value={form.intro}
                onChange={(e) => setForm({ ...form, intro: e.target.value })}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label>Sections</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({ ...form, sections: [...form.sections, { h: "", p: "", bullets: "" }] })
                  }
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add section
                </Button>
              </div>
              {form.sections.map((s, i) => (
                <div key={i} className="space-y-2 rounded-md bg-secondary/40 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={s.h}
                      placeholder={`Section ${i + 1} heading`}
                      onChange={(e) => {
                        const next = [...form.sections];
                        next[i] = { ...s, h: e.target.value };
                        setForm({ ...form, sections: next });
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove section"
                      onClick={() =>
                        setForm({ ...form, sections: form.sections.filter((_, j) => j !== i) })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea
                    rows={3}
                    placeholder="Paragraphs — one per line"
                    value={s.p}
                    onChange={(e) => {
                      const next = [...form.sections];
                      next[i] = { ...s, p: e.target.value };
                      setForm({ ...form, sections: next });
                    }}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Bullet points — one per line (optional)"
                    value={s.bullets}
                    onChange={(e) => {
                      const next = [...form.sections];
                      next[i] = { ...s, bullets: e.target.value };
                      setForm({ ...form, sections: next });
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label>FAQs (used for FAQ rich results)</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({ ...form, faqs: [...form.faqs, { q: "", a: "" }] })}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add FAQ
                </Button>
              </div>
              {form.faqs.map((f, i) => (
                <div key={i} className="space-y-2 rounded-md bg-secondary/40 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={f.q}
                      placeholder="Question"
                      onChange={(e) => {
                        const next = [...form.faqs];
                        next[i] = { ...f, q: e.target.value };
                        setForm({ ...form, faqs: next });
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Remove FAQ"
                      onClick={() => setForm({ ...form, faqs: form.faqs.filter((_, j) => j !== i) })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Answer"
                    value={f.a}
                    onChange={(e) => {
                      const next = [...form.faqs];
                      next[i] = { ...f, a: e.target.value };
                      setForm({ ...form, faqs: next });
                    }}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as FormState["status"] })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (hidden)</SelectItem>
                  <SelectItem value="published">Published (live)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-orange text-white hover:bg-brand-orange/90"
              disabled={save.isPending}
              onClick={() => save.mutate(form)}
            >
              {save.isPending ? "Saving…" : "Save guide"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
