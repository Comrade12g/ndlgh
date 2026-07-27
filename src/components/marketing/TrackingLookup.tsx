import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

export function TrackingLookup({ variant = "hero" }: { variant?: "hero" | "page" }) {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    navigate({ to: "/track/$code", params: { code: c } });
  }

  const isHero = variant === "hero";
  return (
    <form
      onSubmit={submit}
      className={
        isHero
          ? "flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md sm:flex-row sm:items-center"
          : "flex flex-col gap-2 rounded-2xl border bg-card p-4 sm:flex-row"
      }
    >
      <div className={`flex flex-1 items-center gap-2 rounded-lg ${isHero ? "bg-white/95" : "bg-secondary/60"} px-3`}>
        <PackageSearch className="h-4 w-4 text-brand-orange" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter NDL-CN-##### or NDL-GH-#####"
          className="border-0 bg-transparent font-mono uppercase tracking-wider shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" className="bg-brand-orange text-white hover:bg-brand-orange/90">
        Track shipment
      </Button>
    </form>
  );
}
