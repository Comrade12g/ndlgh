import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/LegalPage";

const T = "Privacy Policy | NDL Cargo Ghana";
const D = "How NDL Cargo Ghana collects, uses and protects customer information for shipping, tracking, invoicing and supplier payments.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.ndlgh.com/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.ndlgh.com/privacy" }],
  }),
  component: () => (
    <LegalPage title="Privacy Policy" updated="27 October 2026">
      <p>This policy explains what information NDL Cargo Ghana collects when you use www.ndlgh.com, our customer portal and our shipping services, and how we use it.</p>
      <h2>Information we collect</h2>
      <ul>
        <li>Name, phone number and email address you give us when you sign up, request a quote or contact us.</li>
        <li>Your shipping mark, package details, weights, volumes, tracking numbers and invoices.</li>
        <li>Supplier payment requests: supplier name, amount and payment details you provide.</li>
        <li>Basic website usage data collected by Google Analytics and Microsoft Clarity (pages visited, device type, approximate location).</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To receive, ship, clear and deliver your goods.</li>
        <li>To send you SMS and WhatsApp updates about your packages, invoices and account.</li>
        <li>To pay suppliers in China on your behalf when you ask us to.</li>
        <li>To improve our website and services.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>We share only what is needed with our warehouse teams, shipping lines, airlines, customs authorities (including the Ghana Revenue Authority) and SMS providers. We do not sell your information.</p>
      <h2>Public tracking</h2>
      <p>Public tracking shows shipment status only. It never shows customer names, phone numbers or invoices.</p>
      <h2>Cookies</h2>
      <p>We use cookies to keep you signed in and to measure website traffic. You can block cookies in your browser; the portal may not work without them.</p>
      <h2>Your rights</h2>
      <p>You can ask us to see, correct or delete your information at any time by contacting us. Some records, such as invoices, may need to be kept for legal reasons.</p>
    </LegalPage>
  ),
});
