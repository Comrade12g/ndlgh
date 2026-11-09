import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ContainerBookingForm } from "@/components/portal/ContainerBookingForm";

const title = "Book a container from China to Ghana | NDL Cargo";
const description = "Request a 20ft, 40ft or High Cube FCL container booking with NDL Cargo Ghana without creating an account.";
export const Route = createFileRoute("/book-container")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://www.ndlgh.com/book-container" }] }),
  component: () => <MarketingLayout><section className="mx-auto max-w-3xl px-4 py-12"><h1 className="mb-8 font-display text-3xl font-bold text-brand-navy">Book a container</h1><ContainerBookingForm /></section></MarketingLayout>,
});