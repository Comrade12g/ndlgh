import { Link } from "@tanstack/react-router";
import { BUSINESS, WHATSAPP_URL } from "@/config/business";

const B = BUSINESS;
const G = `${B.domain}/gallery`;

export const LANE_SEO: Record<
  string,
  { title: string; description: string; ogTitle: string; ogDescription: string; h1: string; image: string }
> = {
  china: {
    title: "China to Ghana Shipping | Sea & Air Freight | NDL Cargo",
    description: `Ship from China to Ghana from $${B.seaLclFromUsdPerCbm}/CBM. Sea & air freight from Yiwu, Guangzhou and Taizhou, with in-house customs clearing at Tema. Instant quote.`,
    ogTitle: `China to Ghana Shipping from $${B.seaLclFromUsdPerCbm}/CBM | NDL Cargo`,
    ogDescription:
      "Weekly consolidation from Yiwu, Guangzhou and Taizhou into Tema Port and Kotoka Airport. Customs clearing and door delivery across Ghana.",
    h1: "China to Ghana Shipping: Sea & Air Freight with Customs Clearing at Tema",
    image: `${G}/china-hub.webp`,
  },
  dubai: {
    title: "Dubai to Ghana Shipping | Sea & Air Cargo | NDL Cargo",
    description:
      "Ship from Dubai to Ghana by sea or air. Consolidation, customs clearing at Tema and delivery across Ghana. Get an instant quote from NDL Cargo.",
    ogTitle: "Dubai to Ghana Shipping | Sea & Air Cargo | NDL Cargo",
    ogDescription: "Sea and air cargo from Dubai to Ghana with consolidation, customs clearing at Tema and Ghana-wide delivery.",
    h1: "Dubai to Ghana Shipping: Sea & Air Cargo with Customs Clearing",
    image: `${G}/dubai-hub.webp`,
  },
  thailand: {
    title: "Thailand to Ghana Shipping | Cargo from Bangkok | NDL Cargo",
    description:
      "Ship auto parts, wellness and food products from Bangkok to Ghana. Sea and air freight with in-house customs clearing at Tema. Instant quote.",
    ogTitle: "Thailand to Ghana Shipping | Cargo from Bangkok | NDL Cargo",
    ogDescription: "Sea and air freight from Bangkok to Ghana for auto parts, wellness and food products, cleared in-house at Tema.",
    h1: "Thailand to Ghana Shipping: Cargo from Bangkok to Tema",
    image: `${G}/thailand-hub.webp`,
  },
  canada: {
    title: "Canada to Ghana Shipping | Cargo from Toronto | NDL Cargo",
    description:
      "Send personal effects and retail goods from Toronto to Ghana. Sea and air freight, customs clearing and door delivery. Get a quote.",
    ogTitle: "Canada to Ghana Shipping | Cargo from Toronto | NDL Cargo",
    ogDescription: "Personal effects and retail goods from Toronto to Ghana by sea or air, with customs clearing and door delivery.",
    h1: "Canada to Ghana Shipping: Personal Effects & Retail Cargo from Toronto",
    image: `${G}/canada-hub-800.webp`,
  },
  us: {
    title: "USA to Ghana Shipping | Cargo from New York & LA | NDL Cargo",
    description:
      "Ship from New York and Los Angeles to Ghana: e-commerce goods, vehicles and machinery. Sea and air freight with customs clearing at Tema.",
    ogTitle: "USA to Ghana Shipping | Cargo from New York & LA | NDL Cargo",
    ogDescription: "E-commerce goods, vehicles and machinery from New York and Los Angeles to Ghana, cleared at Tema.",
    h1: "USA to Ghana Shipping: Cargo from New York & Los Angeles",
    image: `${G}/us-hub.webp`,
  },
};

const quoteA = "Prices depend on volume, weight and goods type. Use our instant quote tool or message us on WhatsApp for your exact rate.";
const clearA = `Yes. NDL's in-house licensed brokers handle GRA duty, port charges and delivery orders at Tema, so you do not need a separate agent.`;
const deliverA = "Yes. We deliver to Kumasi, Takoradi, Tamale and every region of Ghana.";
const trackA = "Use your NDL-CN or ND reference on our tracking page. You also get WhatsApp updates at each milestone.";

export const LANE_FAQ: Record<string, { q: string; a: string }[]> = {
  china: [
    { q: "How much does it cost to ship from China to Ghana?", a: `Sea freight starts from $${B.seaLclFromUsdPerCbm} per CBM, with customs clearing included for LCL shipments. Air freight is $${B.airNormalUsdPerKg}/kg for normal goods and $${B.airSpecialUsdPerKg}/kg for special goods. Your exact cost depends on volume, weight and goods type, so use our instant quote tool.` },
    { q: "How long does shipping from China to Ghana take?", a: `Sea LCL takes about ${B.seaLclDays} days and air freight about ${B.airDays} days. Customs clearing at Tema usually adds ${B.clearanceDays}.` },
    { q: "Is sea or air freight better from China to Ghana?", a: "Use sea freight for heavy or bulky goods when you can wait, because it costs much less per kg. Use air freight for urgent, light or high-value goods." },
    { q: "What is CBM and how is it calculated?", a: "CBM is cubic metres: length x width x height (in cm) x number of pieces, divided by 1,000,000. For air freight we charge on whichever is higher, actual weight or volumetric weight." },
    { q: "Do I need a customs broker to clear goods in Ghana?", a: "Yes. NDL has licensed brokers in-house, so we handle GRA duty, port charges and delivery orders for you. Duty depends on your goods' HS code, so we confirm it before your cargo arrives." },
    { q: "Can I ship from China to Ghana if I'm a small business?", a: "Yes. LCL groupage lets you ship a few cartons and pay only for the space you use." },
    { q: "Can NDL pay my supplier in China?", a: "Yes. We pay your supplier directly, receive the goods at our warehouse and ship them to Ghana." },
    { q: "Do you deliver outside Accra?", a: deliverA },
    { q: "How do I track my shipment?", a: trackA },
  ],
  dubai: [
    { q: "How much does it cost to ship from Dubai to Ghana?", a: quoteA },
    { q: "Should I ship from Dubai by sea or air?", a: "Air suits urgent or high-value goods such as perfumes and cosmetics. Sea consolidation suits heavier items like machinery and auto spares." },
    { q: "Can I combine goods from several Dubai suppliers?", a: "Yes. We consolidate goods from more than one supplier into a single shipment to Ghana." },
    { q: "Do you clear Dubai cargo at Tema?", a: clearA },
    { q: "Do you deliver outside Accra?", a: deliverA },
    { q: "How do I track my Dubai shipment?", a: trackA },
  ],
  thailand: [
    { q: "What can I ship from Thailand to Ghana?", a: "Common cargo includes auto parts, wellness and supplement products, food products and textiles. Message us before buying if you are unsure about a product." },
    { q: "How much does Thailand to Ghana shipping cost?", a: quoteA },
    { q: "Do you handle customs clearing for Thai goods?", a: clearA },
    { q: "Can I ship small quantities from Bangkok?", a: "Yes. Groupage lets you pay only for the space your cartons use." },
    { q: "Do you deliver outside Accra?", a: deliverA },
  ],
  canada: [
    { q: "Can I send personal effects from Canada to Ghana?", a: "Yes. We ship personal effects, household goods and retail items from Toronto to Ghana." },
    { q: "How much does Canada to Ghana shipping cost?", a: quoteA },
    { q: "Who clears my Canada shipment in Ghana?", a: clearA },
    { q: "Can you deliver to my family's home in Ghana?", a: deliverA },
    { q: "How do I track my shipment from Toronto?", a: trackA },
  ],
  us: [
    { q: "Which US cities do you ship from?", a: "We receive cargo in New York and Los Angeles." },
    { q: "Can I ship online orders from the US to Ghana?", a: "Yes. Send e-commerce orders to our US hub and we ship them to Ghana with your other goods." },
    { q: "How much does USA to Ghana shipping cost?", a: quoteA },
    { q: "Do you clear US cargo at Tema?", a: clearA },
    { q: "Do you deliver outside Accra?", a: deliverA },
  ],
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 font-display text-2xl font-black text-brand-navy md:text-3xl">{children}</h2>;
}

export function ChinaLaneContent() {
  return (
    <div className="max-w-3xl">
      <H2>Our China to Ghana shipping options</H2>
      <div className="mt-4 space-y-4 text-muted-foreground">
        <p><strong className="text-brand-navy">Sea freight LCL (groupage).</strong> Best for small and medium importers. Your goods share a container with other NDL customers, so you pay by volume (CBM) and not for a whole container. From ${B.seaLclFromUsdPerCbm}/CBM, customs clearing included. Transit: {B.seaLclDays} days.</p>
        <p><strong className="text-brand-navy">Sea freight FCL (20ft and 40ft).</strong> Best when you have enough cargo to fill a container. You get the container to yourself, with lower cost per unit and less handling. Request a quote for current container rates and transit times.</p>
        <p><strong className="text-brand-navy">Air freight.</strong> Best for urgent, high-value or light goods. Normal goods ${B.airNormalUsdPerKg}/kg, special goods ${B.airSpecialUsdPerKg}/kg. Transit: {B.airDays} days. Tell your sales rep about any special goods before shipping.</p>
      </div>

      <H2>Where we ship from in China</H2>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
        <li><strong className="text-brand-navy">Yiwu:</strong> small commodities, gifts, accessories, textiles</li>
        <li><strong className="text-brand-navy">Guangzhou and Foshan:</strong> electronics, phones, cosmetics, fashion</li>
        <li><strong className="text-brand-navy">Taizhou:</strong> hardware, plumbing, machinery, tools</li>
      </ul>
      <p className="mt-3 text-muted-foreground">Each hub has a warehouse where suppliers deliver your goods. You receive a personal shipping mark from your NDL portal. Give it to your supplier and write it clearly on every carton.</p>

      <H2>How shipping from China to Ghana works</H2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
        <li><strong className="text-brand-navy">Get a quote.</strong> Enter weight and dimensions in our <Link to="/quote" className="text-brand-sky underline">quote tool</Link>. We calculate CBM and chargeable weight for you.</li>
        <li><strong className="text-brand-navy">Send goods to our China warehouse.</strong> Your supplier delivers to Yiwu, Guangzhou or Foshan with your shipping mark on every carton. We do not accept cash-on-delivery parcels.</li>
        <li><strong className="text-brand-navy">We consolidate and ship.</strong> Goods are loaded into weekly sea groupage containers or sent by air.</li>
        <li><strong className="text-brand-navy">Customs clearing at Tema or Kotoka.</strong> Our in-house licensed brokers handle GRA duty, port charges and delivery orders. Clearance usually takes {B.clearanceDays}.</li>
        <li><strong className="text-brand-navy">Delivery in Ghana.</strong> Collect from our Accra warehouse or choose door delivery to any region. <Link to="/tracking" className="text-brand-sky underline">Track every step</Link> on WhatsApp.</li>
      </ol>

      <H2>Can NDL buy from China for you?</H2>
      <p className="mt-4 text-muted-foreground">Yes. If you do not have a supplier yet, our sourcing agents in Guangzhou and Yiwu can help you find products and suppliers. We can also pay your supplier in China on your behalf, receive the goods at our warehouse and ship them to Ghana in one process. <Link to="/buy-from-china" className="font-semibold text-brand-sky underline">Buy from China</Link></p>

      <H2>What can you ship from China to Ghana?</H2>
      <p className="mt-4 text-muted-foreground">Common cargo includes electronics and phones, cosmetics and beauty products, fashion and textiles, hardware and tools, machinery and spare parts, and small commodities for resale. Not sure whether your goods can ship? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-brand-sky underline">Message us</a> before you pay your supplier.</p>

      <H2>Why importers use NDL</H2>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>In-house licensed customs brokers, with no third-party agents in the chain</li>
        <li>Weekly groupage, so small shipments still get container rates</li>
        <li>WhatsApp updates at every milestone</li>
        <li>A quote that matches your final invoice</li>
        <li>Ghana-wide delivery to all 16 regions</li>
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        Also see: <Link to="/services" className="text-brand-sky underline">all services</Link> ·{" "}
        <Link to="/lanes/$origin" params={{ origin: "dubai" }} className="text-brand-sky underline">Dubai to Ghana shipping</Link> ·{" "}
        <Link to="/guides" className="text-brand-sky underline">import guides</Link>
      </p>
    </div>
  );
}
