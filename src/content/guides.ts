import { IMG } from "@/assets/gallery";

export type GuideSection = {
  h: string;
  /** Paragraphs. */
  p?: string[];
  /** Bullet list. */
  bullets?: string[];
  /** Simple table: header row + body rows. */
  table?: { head: string[]; rows: string[][] };
};

export type Guide = {
  slug: string;
  title: string;
  /** Short SEO title used in <title>. */
  seoTitle: string;
  description: string;
  category: GuideCategorySlug;
  updated: string; // ISO date
  readMinutes: number;
  image: string;
  imageAlt: string;
  intro: string[];
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  keywords: string[];
};

export type GuideCategorySlug = "shipping-costs" | "customs-duty" | "how-to-ship" | "tracking";

export type GuideCategory = {
  slug: GuideCategorySlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
};

export const GUIDE_CATEGORIES: GuideCategory[] = [
  {
    slug: "shipping-costs",
    name: "Shipping costs & rates",
    tagline: "What freight actually costs",
    description:
      "Transparent breakdowns of sea groupage (CBM) and air cargo (kg) rates from China, Dubai, Thailand, Canada and the US to Ghana — plus the local charges most agents never mention.",
    image: IMG.stackedContainers,
  },
  {
    slug: "customs-duty",
    name: "Customs & duty in Ghana",
    tagline: "Tema Port, GRA & clearing",
    description:
      "How import duty, VAT, NHIL, GETFund and ECOWAS levies are calculated at Tema and KIA, what documents GRA/ICUMS requires, and how to avoid demurrage.",
    image: IMG.customsClearing,
  },
  {
    slug: "how-to-ship",
    name: "How to ship step by step",
    tagline: "From supplier to your door",
    description:
      "Practical playbooks for buying in Guangzhou or Yiwu, using your NDL shipping mark, packing for groupage, and choosing between sea LCL, FCL and air cargo.",
    image: IMG.warehouseInterior,
  },
  {
    slug: "tracking",
    name: "Tracking & delivery",
    tagline: "Know where your cargo is",
    description:
      "How NDL milestones map to real vessel movements, what each tracking status means, and how last-mile delivery works across Accra, Kumasi, Takoradi and Tamale.",
    image: IMG.deliveryTruck,
  },
];

export const GUIDES: Guide[] = [
  {
    slug: "cost-of-shipping-from-guangzhou-to-accra",
    title: "The real cost of shipping from Guangzhou to Accra in 2026",
    seoTitle: "Cost of Shipping from Guangzhou to Accra (2026 Rate Guide)",
    description:
      "A full breakdown of what it costs to ship a carton or a container from Guangzhou or Yiwu to Accra — sea CBM rates, air kg rates, local port charges and duty.",
    category: "shipping-costs",
    updated: "2026-07-20",
    readMinutes: 8,
    image: IMG.chinaHub,
    imageAlt: "Cargo containers stacked at a Guangzhou consolidation warehouse bound for Ghana",
    intro: [
      "Most importers in Ghana get quoted a single number — \"$260 per CBM\" — and are then surprised by port charges, duty and delivery on arrival. That gap between the freight quote and the landed cost is where margins die.",
      "This guide breaks the Guangzhou → Accra lane into every line item you will actually pay, so you can price your goods before you buy them.",
    ],
    sections: [
      {
        h: "1. Sea freight is priced per CBM, air freight per kilogram",
        p: [
          "Sea groupage (LCL) is charged on volume: length × width × height in metres gives you cubic metres (CBM). A carton measuring 60 × 40 × 50 cm is 0.12 CBM. Air cargo is charged on chargeable weight — the greater of actual weight and volumetric weight (cm³ ÷ 6000).",
          "The practical rule: dense, heavy, low-value goods go by sea. Light, urgent, high-value goods go by air.",
        ],
        table: {
          head: ["Mode", "Basis", "Typical transit", "Best for"],
          rows: [
            ["Sea LCL (groupage)", "Per CBM", "25–35 days", "Cartons, furniture, hardware"],
            ["Sea FCL (20ft / 40ft)", "Per container", "25–32 days", "15 CBM+ single orders"],
            ["Air cargo", "Per chargeable kg", "5–7 days", "Phones, samples, spare parts"],
          ],
        },
      },
      {
        h: "2. The line items in a Guangzhou → Accra shipment",
        bullets: [
          "Supplier-to-warehouse trucking in China (often free within Guangzhou, charged from Yiwu or Foshan).",
          "Consolidation, re-packing and marking at our China warehouse.",
          "Ocean freight to Tema Port, including the carrier's bunker and currency surcharges.",
          "Terminal handling and delivery order fees at Tema.",
          "GRA import duty, VAT, NHIL, GETFund and ECOWAS levy (see our customs guide).",
          "Devanning and last-mile delivery to Accra, Kumasi or your chosen city.",
        ],
        p: [
          "A quote that covers only the fourth bullet is not a landed cost. Every NDL quote states clearly which of these items is included, and our online quote tool gives you an indicative freight figure in seconds.",
        ],
      },
      {
        h: "3. A worked example: 12 cartons of shoes",
        p: [
          "12 cartons at 0.12 CBM each = 1.44 CBM, gross weight about 190 kg. By sea groupage at an indicative $260/CBM that is roughly $374 in ocean freight, plus local charges at Tema and duty assessed on the CIF value of the goods.",
          "The same consignment by air at 190 chargeable kg would cost several times more in freight but arrive in a week — which is the right call if the shoes are for a season that is already selling.",
        ],
      },
      {
        h: "4. Five ways importers overpay",
        bullets: [
          "Shipping half-empty cartons — you pay for air. Ask suppliers to compress and re-box.",
          "Splitting one order across several consolidation cutoffs, paying minimum charges twice.",
          "Under-declaring value, then paying penalties and losing days at inspection.",
          "Leaving cargo at the port past free days and paying demurrage and rent.",
          "Choosing air for goods that were never urgent.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much does it cost to ship one CBM from China to Ghana?",
        a: "Sea groupage from our Guangzhou and Yiwu warehouses to Tema is typically quoted per CBM, with the exact rate depending on the commodity, season and whether the cargo is general or special. Use the NDL quote tool for a live indicative rate, then we confirm on measurement at intake.",
      },
      {
        q: "Is there a minimum charge for small shipments?",
        a: "Yes. Sea groupage carries a minimum billable volume (usually 0.5 CBM) and air cargo a minimum chargeable weight, because handling, documentation and clearing costs are fixed per consignment.",
      },
      {
        q: "Do your rates include customs duty?",
        a: "No. Duty and taxes are assessed by GRA on the value of your goods and are quoted separately once your invoice and HS codes are known. Our in-house clearing team handles the declaration for you.",
      },
    ],
    keywords: [
      "cost of shipping from Guangzhou to Accra",
      "China to Ghana shipping rates",
      "CBM rate China Ghana",
      "sea freight Ghana",
    ],
  },
  {
    slug: "tema-customs-duty-explained",
    title: "Tema Port customs duty explained: how GRA calculates what you pay",
    seoTitle: "Tema Port Customs Duty Explained — GRA Import Taxes in Ghana",
    description:
      "Understand Ghana import duty, VAT, NHIL, GETFund and the ECOWAS levy, how ICUMS values your goods at Tema Port, and which documents you need to clear fast.",
    category: "customs-duty",
    updated: "2026-07-24",
    readMinutes: 9,
    image: IMG.customsClearing,
    imageAlt: "Customs clearing paperwork and containers at Tema Port, Ghana",
    intro: [
      "Duty is the part of importing that most people never see coming. It is not a percentage of your freight bill — it is calculated on the value of the goods themselves, plus freight and insurance, and then several separate levies are stacked on top.",
      "Here is how the arithmetic actually works at Tema, and what you can control.",
    ],
    sections: [
      {
        h: "The customs value comes first (CIF)",
        p: [
          "Ghana Revenue Authority assesses duty on the CIF value: the Cost of the goods, plus Insurance, plus Freight to Ghana. Your supplier invoice sets the cost; the ocean or air freight is added; insurance is added or imputed.",
          "This is why a cheap freight rate slightly reduces duty too — and why under-declaring the invoice is a false economy: ICUMS holds reference values for most commodities and a challenged declaration means inspection, delay and penalties.",
        ],
      },
      {
        h: "The taxes stacked on a Ghana import",
        table: {
          head: ["Charge", "Typical basis", "Notes"],
          rows: [
            ["Import duty", "0–35% of CIF", "Depends on the HS code of the commodity"],
            ["VAT", "15% of duty-inclusive value", "Standard rate; some items exempt"],
            ["NHIL", "2.5%", "National Health Insurance Levy"],
            ["GETFund levy", "2.5%", "Education fund levy"],
            ["COVID-19 health levy", "1%", "Where still applicable"],
            ["ECOWAS levy", "0.5% of CIF", "Regional levy"],
            ["Inspection / network charges", "Fixed + %", "ICUMS processing and scanning"],
          ],
        },
        p: [
          "Two consignments with the same freight cost can attract very different duty, purely because of their HS classification. Getting the code right is the single highest-leverage thing a clearing agent does for you.",
        ],
      },
      {
        h: "Documents ICUMS will ask for",
        bullets: [
          "Commercial invoice with realistic unit values and a clear description.",
          "Packing list matching the invoice line for line.",
          "Bill of Lading (sea) or Air Waybill (air).",
          "Importer TIN and, for a business, certificate of incorporation.",
          "Permits where the commodity requires them — FDA for food, drugs and cosmetics; Standards Authority for electricals; EPA for chemicals.",
        ],
        p: [
          "Missing a permit is the most common cause of a container sitting at Tema. Tell us the commodity before you buy and we will tell you which permit you need.",
        ],
      },
      {
        h: "Demurrage and rent: the avoidable cost",
        p: [
          "Shipping lines allow a limited number of free days after discharge. After that, demurrage accrues on the container and rent on the terminal space, daily. Clearing is a race with a clock.",
          "NDL starts the declaration before the vessel berths, using documents collected at intake, so clearance runs in parallel with the voyage rather than after it.",
        ],
      },
      {
        h: "How to reduce duty legally",
        bullets: [
          "Classify correctly — many goods sit in lower bands than importers assume.",
          "Buy on FOB terms so freight is transparent and not inflated inside the invoice.",
          "Consolidate so fixed per-consignment charges are shared across more cargo.",
          "Keep documentation consistent; disputes cost more than duty.",
        ],
      },
    ],
    faqs: [
      {
        q: "How is import duty calculated in Ghana?",
        a: "GRA applies a duty rate set by your goods' HS code to the CIF value (cost of goods + insurance + freight). VAT, NHIL, GETFund, the ECOWAS levy and processing charges are then applied on top, so the effective total is materially higher than the headline duty rate.",
      },
      {
        q: "Can NDL Cargo clear my goods at Tema Port?",
        a: "Yes — customs clearing is in-house, not subcontracted. We prepare the ICUMS declaration, handle inspection and pay duty on your behalf where agreed, then move the cargo to your delivery address.",
      },
      {
        q: "What happens if my goods need an FDA or Standards Authority permit?",
        a: "The declaration cannot be completed without it, and the cargo accrues demurrage while you apply. We flag permit-controlled commodities at intake so the paperwork starts early.",
      },
    ],
    keywords: [
      "Tema customs duty explained",
      "Ghana import duty calculation",
      "ICUMS clearing Tema Port",
      "GRA VAT NHIL GETFund import",
    ],
  },
  {
    slug: "sea-freight-vs-air-cargo-to-ghana",
    title: "Sea freight vs air cargo to Ghana: how to choose without guessing",
    seoTitle: "Sea Freight vs Air Cargo to Ghana — Which Should You Choose?",
    description:
      "A decision framework for choosing sea LCL, FCL or air cargo when shipping to Ghana, with break-even density maths, transit times and cash-flow considerations.",
    category: "how-to-ship",
    updated: "2026-07-18",
    readMinutes: 6,
    image: IMG.airCargoPlane,
    imageAlt: "Air cargo freighter being loaded with palletised freight bound for Accra",
    intro: [
      "The instinct is to compare prices. The better comparison is cost per unit sold, including the cash your stock ties up while it floats across an ocean.",
    ],
    sections: [
      {
        h: "Start with density",
        p: [
          "Divide gross weight in kilograms by volume in CBM. Above roughly 250 kg/CBM your cargo is dense and sea freight is almost always cheaper per unit. Below about 150 kg/CBM the cargo is bulky and air freight becomes punishing, because you pay volumetric weight.",
        ],
      },
      {
        h: "Then price the delay",
        p: [
          "Sea from China lands in about 25–35 days plus clearing. Air lands in 5–7 days. If your product sells for GHS 200 with a GHS 60 margin and you sell 40 units a week, four extra weeks of waiting is roughly GHS 9,600 of deferred margin — often more than the air premium on a small, high-value consignment.",
        ],
      },
      {
        h: "When FCL beats groupage",
        bullets: [
          "You have 15 CBM or more moving at once — a 20ft container becomes competitive per CBM.",
          "Your cargo is fragile or high-value and you want no co-loading.",
          "You need predictable, repeatable sailings for a retail replenishment cycle.",
        ],
      },
      {
        h: "A practical blend",
        p: [
          "Most of our steady importers split: a sea container for core stock and a weekly air consignment for fast movers, samples and anything a customer is already waiting on. It keeps landed cost low without stockouts.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long does sea freight from China to Ghana take?",
        a: "Typically 25–35 days port to port from South China to Tema, plus consolidation before departure and clearing plus delivery after arrival. Air cargo on the same lane is usually 5–7 days door to door.",
      },
      {
        q: "Is air cargo ever cheaper than sea?",
        a: "For very small, dense, high-value consignments the total cost can be comparable once you account for the fixed per-consignment charges on a sea shipment and the working capital tied up during a five-week voyage.",
      },
    ],
    keywords: [
      "sea freight vs air cargo Ghana",
      "LCL vs FCL Ghana",
      "shipping transit time China to Ghana",
    ],
  },
  {
    slug: "how-to-use-your-ndl-shipping-mark",
    title: "How to use your NDL shipping mark so nothing gets lost",
    seoTitle: "How to Use Your NDL Shipping Mark (NDL-GH-####)",
    description:
      "Your NDL-GH-#### shipping mark links every carton to your account. Here is exactly how to give it to a supplier, label cartons and confirm intake.",
    category: "how-to-ship",
    updated: "2026-07-22",
    readMinutes: 5,
    image: IMG.warehousePallets,
    imageAlt: "Labelled pallets with shipping marks in an NDL consolidation warehouse",
    intro: [
      "Groupage means your cartons travel beside dozens of other importers' cartons. The shipping mark is the only thing that keeps them yours.",
    ],
    sections: [
      {
        h: "What the mark looks like",
        p: [
          "Every NDL customer gets a permanent mark in the format NDL-GH-#### — for example NDL-GH-0005. It never changes, it belongs only to you, and it is what our warehouse team scans at intake.",
        ],
      },
      {
        h: "Give it to your supplier in writing",
        bullets: [
          "Send the mark and our warehouse address together, in one message, before you pay.",
          "Ask for the mark written on at least two faces of every carton, in large marker or a printed label.",
          "Ask for a photo of the labelled cartons before dispatch.",
          "Include your phone number under the mark for good measure.",
        ],
      },
      {
        h: "What happens at intake",
        p: [
          "When cartons arrive we weigh and measure each one, photograph it, record the actual weight and CBM against your mark, and raise a draft invoice line. You get a WhatsApp notification the same day with the piece count and measurement.",
          "This is why measurement disputes are rare: the numbers on your invoice are the numbers taken in the warehouse, and you can see them before the cargo sails.",
        ],
      },
      {
        h: "Common labelling mistakes",
        bullets: [
          "Mark written only on the top face — it disappears the moment cartons are stacked.",
          "Old marks from a previous forwarder left on re-used boxes.",
          "Handwriting on shrink wrap instead of on the carton itself.",
          "Supplier using their own reference and never mentioning yours.",
        ],
      },
    ],
    faqs: [
      {
        q: "Where do I find my NDL shipping mark?",
        a: "It is shown in your customer portal and on every invoice we issue. If you are not sure, message us on WhatsApp and we will confirm it.",
      },
      {
        q: "Can I track cargo using my shipping mark?",
        a: "Yes. Enter your NDL-GH-#### mark on the tracking page and you will see the current shipment, its milestones and estimated arrival.",
      },
    ],
    keywords: ["NDL shipping mark", "shipping mark China Ghana", "how to label cargo groupage"],
  },
  {
    slug: "understanding-shipment-tracking-milestones",
    title: "Understanding your tracking milestones, from booked to delivered",
    seoTitle: "Shipment Tracking Milestones Explained — Booked to Delivered",
    description:
      "What each NDL tracking status means in the real world: booked, in transit, arrived Ghana port, customs clearing, out for delivery and delivered.",
    category: "tracking",
    updated: "2026-07-26",
    readMinutes: 5,
    image: IMG.portCranes,
    imageAlt: "Ship-to-shore cranes discharging containers at Tema Port",
    intro: [
      "Tracking is only useful if you know what to do at each stage. Here is what every milestone means and what we need from you when it appears.",
    ],
    sections: [
      {
        h: "The six milestones",
        table: {
          head: ["Milestone", "What it means", "What you should do"],
          rows: [
            ["Booked", "Cargo received and allocated to a sailing or flight", "Confirm invoice details and consignee name"],
            ["In transit", "Vessel or aircraft has departed origin", "Send any missing permits now"],
            ["Arrived Ghana port", "Discharged at Tema or KIA", "Nothing — the clock on free days starts"],
            ["Customs clearing", "Declaration lodged with GRA / ICUMS", "Settle duty and charges promptly"],
            ["Out for delivery", "Released and loaded for last mile", "Make sure someone can receive"],
            ["Delivered", "Signed for at your address", "Check pieces against the packing list"],
          ],
        },
      },
      {
        h: "Why an ETA can move",
        p: [
          "Vessel schedules change: port congestion, a missed berthing window, or a transhipment delay at a hub can shift arrival by days. We log every ETA change against the shipment so you see the history, not just the latest guess.",
        ],
      },
      {
        h: "Tracking with a mark, a code or a reference",
        p: [
          "The public tracking page accepts your NDL-GH-#### shipping mark, an individual package code, or the shipment reference on your invoice. All three resolve to the same journey view with dates, vessel details, piece count, weight and CBM.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why does my shipment still show \"in transit\" after the ETA?",
        a: "The status changes when the vessel actually discharges, not when it was scheduled to. If the ETA has passed, check the ETA history on the tracking card — a revised date is usually already recorded.",
      },
      {
        q: "Do you send tracking updates on WhatsApp?",
        a: "Yes. Intake, sailing, arrival, clearing and delivery updates are sent to the phone number on your account.",
      },
    ],
    keywords: ["shipment tracking Ghana", "NDL cargo tracking milestones", "track cargo from China to Ghana"],
  },
  {
    slug: "hidden-charges-in-ghana-freight-quotes",
    title: "The hidden charges in Ghana freight quotes — and how to read one properly",
    seoTitle: "Hidden Charges in Ghana Freight Quotes (What to Ask For)",
    description:
      "Terminal handling, delivery orders, devanning, demurrage and agent fees: the local charges that turn a cheap freight quote into an expensive shipment.",
    category: "shipping-costs",
    updated: "2026-07-15",
    readMinutes: 6,
    image: IMG.seaTema,
    imageAlt: "Container vessel berthed at Tema Port with cargo handling equipment",
    intro: [
      "A freight quote is a comparison tool only if two quotes cover the same scope. Most do not. These are the items to ask about explicitly.",
    ],
    sections: [
      {
        h: "Origin-side charges",
        bullets: [
          "Pickup from supplier and inland trucking to the consolidation warehouse.",
          "Storage beyond the free period while you wait for other orders.",
          "Re-packing, palletising or reinforcing weak cartons.",
          "Export documentation at origin.",
        ],
      },
      {
        h: "Destination-side charges",
        bullets: [
          "Terminal handling charge and delivery order fee.",
          "Devanning or unstuffing of a groupage container.",
          "Scanning, inspection and ICUMS processing charges.",
          "Demurrage and terminal rent if clearance runs past the free days.",
          "Last-mile delivery, which varies sharply between Accra and northern regions.",
        ],
      },
      {
        h: "Four questions that expose a thin quote",
        bullets: [
          "Is this rate all-in to my door, or to the port only?",
          "What is the minimum billable volume or weight?",
          "How many free days do I get before demurrage?",
          "Is duty included, estimated, or excluded entirely?",
        ],
        p: [
          "A forwarder who answers all four in writing is quoting a landed cost. One who answers only the first is quoting a headline.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why is my final invoice higher than the quote?",
        a: "Usually because the quoted volume was estimated from supplier dimensions rather than measured cartons, or because local charges and duty were excluded. NDL invoices show the measured packing list per carton, so you can reconcile every line.",
      },
      {
        q: "What is devanning?",
        a: "Unloading a shared (groupage) container at the destination so each importer's cargo can be separated and released. It is a real cost on every LCL shipment and should appear on your quote.",
      },
    ],
    keywords: [
      "hidden freight charges Ghana",
      "Tema port charges explained",
      "landed cost Ghana import",
    ],
  },
];

export const SITE_URL = "https://ndlgh.susuboxgh.com";

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

export function getCategory(slug: string) {
  return GUIDE_CATEGORIES.find((c) => c.slug === slug);
}

export function guidesByCategory(slug: GuideCategorySlug) {
  return GUIDES.filter((g) => g.category === slug);
}

export function formatGuideDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Merge CMS-managed guides with the built-in library. A CMS guide with the same
 * slug replaces the static one, so editors can revise shipped content without a
 * redeploy. Newest-updated first.
 */
export function mergeGuides(dbGuides: Guide[] = []): Guide[] {
  const bySlug = new Map<string, Guide>();
  for (const g of GUIDES) bySlug.set(g.slug, g);
  for (const g of dbGuides) bySlug.set(g.slug, g);
  return [...bySlug.values()].sort((a, b) => (a.updated < b.updated ? 1 : -1));
}
