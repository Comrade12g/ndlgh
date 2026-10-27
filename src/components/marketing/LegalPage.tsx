import type { ReactNode } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { BUSINESS } from "@/config/business";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <MarketingLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-brand-navy [&_p]:mt-3 [&_li]:mt-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 text-muted-foreground">
        <h1 className="font-display text-4xl font-black text-brand-navy">{title}</h1>
        <p className="text-sm">Last updated: {updated}</p>
        {children}
        <h2>Contact</h2>
        <p>
          {BUSINESS.name}, {BUSINESS.officeAddress}. Phone/WhatsApp {BUSINESS.phone}. Email {BUSINESS.email}.
        </p>
      </article>
    </MarketingLayout>
  );
}
