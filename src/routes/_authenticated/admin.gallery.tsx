import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader, EmptyState } from "@/components/ops/PageHeader";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { GALLERY_CATEGORIES, GALLERY_LOCATIONS, type GalleryPhoto } from "@/lib/gallery";
import { Plus, Trash2, Pencil, Star, ImageOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: AdminGalleryPage,
});

type FormState = {
  id?: string;
  title: string;
  category: string;
  location: string;
  image_url: string;
  sort_order: number;
  is_hero: boolean;
  active: boolean;
};

const EMPTY: FormState = {
  title: "",
  category: GALLERY_CATEGORIES[0],
  location: "",
  image_url: "",
  sort_order: 0,
  is_hero: false,
  active: true,
};

function AdminGalleryPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("is_hero", { ascending: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as GalleryPhoto[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (f: FormState) => {
      const payload = {
        title: f.title.trim(),
        category: f.category,
        location: f.location.trim() || null,
        image_url: f.image_url.trim(),
        sort_order: Number(f.sort_order) || 0,
        is_hero: f.is_hero,
        active: f.active,
      };
      if (f.id) {
        const { error } = await supabase.from("gallery_photos").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gallery_photos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Photo saved");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
      setOpen(false);
      setForm(EMPTY);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Photo removed");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const toggleActive = useMutation({
    mutationFn: async (p: GalleryPhoto) => {
      const { error } = await supabase
        .from("gallery_photos")
        .update({ active: !p.active })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      qc.invalidateQueries({ queryKey: ["public-gallery"] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const rows = (data ?? []).filter((r) =>
    filter === "all" ? true : filter === "hero" ? r.is_hero : r.category === filter,
  );

  function openEdit(p: GalleryPhoto) {
    setForm({
      id: p.id,
      title: p.title,
      category: p.category,
      location: p.location ?? "",
      image_url: p.image_url,
      sort_order: p.sort_order,
      is_hero: p.is_hero,
      active: p.active,
    });
    setOpen(true);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Gallery photos"
        description="Manage marketing site imagery — hero carousel and gallery band."
        actions={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setForm(EMPTY);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setForm(EMPTY)}>
                <Plus className="mr-2 h-4 w-4" /> Add photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{form.id ? "Edit photo" : "Add photo"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Container ship at Tema Port"
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paste any HTTPS image URL (Unsplash, your CDN, etc.). Recommended: 1600×1000.
                  </p>
                </div>
                {form.image_url && (
                  <div className="overflow-hidden rounded-lg border">
                    <img
                      src={form.image_url}
                      alt="preview"
                      className="max-h-40 w-full object-cover"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GALLERY_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Select
                      value={form.location || "__none"}
                      onValueChange={(v) => setForm({ ...form, location: v === "__none" ? "" : v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">— None —</SelectItem>
                        {GALLERY_LOCATIONS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Sort order</Label>
                    <Input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm({ ...form, sort_order: parseInt(e.target.value || "0", 10) })
                      }
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Label className="mb-2 text-xs">Hero carousel</Label>
                    <Switch
                      checked={form.is_hero}
                      onCheckedChange={(v) => setForm({ ...form, is_hero: v })}
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <Label className="mb-2 text-xs">Active</Label>
                    <Switch
                      checked={form.active}
                      onCheckedChange={(v) => setForm({ ...form, active: v })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => upsert.mutate(form)}
                  disabled={!form.title || !form.image_url || upsert.isPending}
                >
                  {upsert.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Label className="text-xs">Filter</Label>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All photos</SelectItem>
            <SelectItem value="hero">Hero carousel only</SelectItem>
            {GALLERY_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{rows.length} photo(s)</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No photos yet"
          description="Add photos to power the hero carousel and marketing gallery."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted">
                <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                {p.is_hero && (
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    <Star className="h-3 w-3" /> Hero
                  </div>
                )}
                {!p.active && (
                  <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Hidden
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-semibold text-brand-navy">{p.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {p.category}{p.location ? ` · ${p.location}` : ""}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleActive.mutate(p)}>
                    {p.active ? "Hide" : "Show"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${p.title}"?`)) remove.mutate(p.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
