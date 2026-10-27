import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/LegalPage";

const T = "Terms of Service | NDL Cargo Ghana";
const D = "Terms for shipping, warehousing, customs clearing and supplier payments with NDL Cargo Ghana.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.ndlgh.com/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.ndlgh.com/terms" }],
  }),
  component: () => (
    <LegalPage title="Terms of Service" updated="27 October 2026">
      <p>These terms apply when you ship goods with NDL Cargo Ghana, use our warehouses, customer portal, or supplier payment service.</p>
      <h2>Shipping marks</h2>
      <p>Every carton must show your NDL shipping mark clearly. Goods without a clear mark may be delayed.</p>
      <h2>Goods you send</h2>
      <ul>
        <li>Tell your sales rep about special goods before sending. Our warehouses do not inspect or identify goods.</li>
        <li>You are responsible for making sure your goods are legal to import into Ghana.</li>
        <li>Cash-on-delivery (COD) parcels are not accepted.</li>
      </ul>
      <h2>Rates and payment</h2>
      <p>Rates shown on our website are in US dollars and may change. Your invoice shows the final amount based on measured volume (CBM) or weight (kg). Goods are released after the invoice is paid.</p>
      <h2>Transit times</h2>
      <p>Transit times are estimates. Delays caused by shipping lines, airlines, ports or customs are outside our control.</p>
      <h2>Supplier payments</h2>
      <p>When you ask us to pay a supplier in China, we pay the details you give us. Please confirm your supplier before paying.</p>
      <h2>Your account</h2>
      <p>Keep your portal password private. Tell us immediately if you think someone else has used your account.</p>
    </LegalPage>
  ),
});
