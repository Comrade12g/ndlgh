import { IMG } from "@/assets/gallery";
import type { Guide } from "./guides";

const PUB = "2026-10-16";

const cbmFaq = {
  q: "How much is sea freight from China to Ghana?",
  a: "NDL sea groupage (LCL) from China starts from $230 per CBM, with customs clearing included for LCL shipments. Use the instant quote tool for your exact rate.",
};
const airFaq = {
  q: "How much is air freight from China to Ghana?",
  a: "NDL air freight is $20 per kg for normal goods and $25 per kg for special goods, with transit of about 10-14 days.",
};

export const SEO_GUIDES: Guide[] = [
  {
    slug: "how-to-import-from-alibaba-to-ghana",
    title: "How to Import from Alibaba to Ghana (Step by Step)",
    seoTitle: "How to Import from Alibaba to Ghana (Step by Step) | NDL",
    description:
      "A practical step-by-step guide to buying on Alibaba and shipping to Ghana: choosing suppliers, using a shipping mark, sea vs air, customs clearing at Tema and delivery.",
    category: "how-to-ship",
    published: PUB,
    updated: PUB,
    readMinutes: 7,
    image: IMG.chinaHub,
    imageAlt: "Goods at a China warehouse ready to ship to Ghana",
    lane: "china",
    intro: [
      "Short answer: to import from Alibaba to Ghana, pick a verified supplier, agree the product and price, ask the supplier to deliver to your forwarder's warehouse in China with your shipping mark, then let the forwarder ship, clear and deliver the goods in Ghana. You only pay the supplier for the goods and the local delivery to the warehouse; the forwarder handles everything from China to your door.",
      "This guide walks through each step, the mistakes we see Ghanaian importers make most often, and how NDL Cargo fits into the process.",
    ],
    sections: [
      {
        h: "Step 1: Decide what you want to import",
        p: [
          "Before you open Alibaba, be clear about the product, the quantity you can afford and who you will sell to in Ghana. Start small. A first order of a few cartons lets you test quality and demand without tying up all your capital.",
          "Check that the item can legally be imported into Ghana. Some goods need permits or special approval, and some cannot be shipped at all. If you are unsure, message us before you pay any supplier.",
        ],
      },
      {
        h: "Step 2: Find and check a supplier",
        p: [
          "On Alibaba, filter for suppliers with trade assurance, a long trading history and clear company details. Compare at least three suppliers for the same product. Very low prices are a warning sign, not a bargain.",
          "Ask for real photos or a short video of the product, the carton size and weight, and the minimum order quantity (MOQ). If possible, order a sample first.",
        ],
        bullets: [
          "Prefer suppliers with verified factory or business status",
          "Ask for carton dimensions and gross weight per carton",
          "Confirm the production time before you pay",
          "Keep every agreement in writing in the Alibaba chat",
        ],
      },
      {
        h: "Step 3: Agree the delivery terms",
        p: [
          "Most small importers buy on EXW or \"delivered to warehouse\" terms: the supplier delivers inside China, and your forwarder takes over from there. Ask the supplier to deliver to your NDL warehouse in Guangzhou, Foshan or Yiwu, and agree who pays the local delivery inside China.",
          "Do not ask the supplier to arrange shipping to Ghana unless you have compared their price with a Ghana-based forwarder. Supplier-arranged shipping often leaves you with surprise charges when the goods land at Tema.",
        ],
      },
      {
        h: "Step 4: Use your NDL shipping mark",
        p: [
          "Your personal shipping mark identifies your cartons in our warehouse. You get it from your NDL customer portal. Send it to your supplier exactly as shown and ask them to write it clearly on every carton.",
          "Cartons without a mark are the most common cause of delays and lost goods. Ask the supplier to send you a photo of the marked cartons before they leave the factory.",
        ],
      },
      {
        h: "Step 5: Pay your supplier safely",
        p: [
          "Pay through Alibaba's own payment system where you can, because it gives you some protection. If you cannot pay the supplier from Ghana yourself, NDL can pay your supplier in China on your behalf. See our guide on paying Chinese suppliers from Ghana for the safe way to do it.",
        ],
      },
      {
        h: "Step 6: Choose sea or air freight",
        p: [
          "Sea freight suits heavy or bulky goods and costs much less. NDL sea groupage starts from $230 per CBM with customs clearing included for LCL, with transit of about 35-45 days. Air freight suits urgent, light or high-value goods: $20/kg for normal goods and $25/kg for special goods, about 10-14 days.",
          "Use our instant quote tool with the carton sizes and weights from your supplier to compare both options before you decide.",
        ],
      },
      {
        h: "Step 7: Customs clearing and delivery in Ghana",
        p: [
          "When your goods arrive, NDL's in-house licensed brokers handle customs at Tema Port or Kotoka Airport. Import duty depends on what the goods are, so keep your supplier invoice and packing list ready. After clearing, collect from our Accra warehouse or choose delivery to any region of Ghana, with WhatsApp updates along the way.",
        ],
      },
      {
        h: "Common mistakes to avoid",
        bullets: [
          "Paying a supplier you have not checked",
          "Forgetting the shipping mark on cartons",
          "Under-declaring the value of goods",
          "Buying restricted goods without checking first",
          "Choosing air freight for heavy, low-value goods",
        ],
      },
    ],
    faqs: [
      { q: "Can I import from Alibaba to Ghana as an individual?", a: "Yes. Many NDL customers are individuals and small businesses. Groupage shipping lets you send a few cartons and pay only for the space you use." },
      { q: "What address do I give my Alibaba supplier?", a: "Give the supplier your NDL China warehouse address and your personal shipping mark from the NDL portal." },
      cbmFaq,
      { q: "Do I pay customs duty on Alibaba goods?", a: "Yes, imports into Ghana attract duty and taxes based on the goods' classification and value. NDL's brokers confirm the amount before your cargo is cleared." },
    ],
    keywords: ["import from Alibaba to Ghana", "Alibaba Ghana shipping"],
  },
  {
    slug: "ghana-customs-duty-import-guide",
    title: "Ghana Customs Duty on Imports: How It Is Calculated",
    seoTitle: "Ghana Customs Duty on Imports: How It Is Calculated | NDL",
    description:
      "How import duty in Ghana is worked out: HS codes, customs value, the taxes and levies involved, what documents you need at Tema, and how a licensed broker helps.",
    category: "customs-duty",
    published: PUB,
    updated: PUB,
    readMinutes: 6,
    image: IMG.customsClearing,
    imageAlt: "Customs documents being checked for cargo at Tema",
    lane: "china",
    intro: [
      "Short answer: Ghana customs duty is calculated from the customs value of your goods (usually cost, insurance and freight) and the tariff for the goods' HS code, plus several taxes and levies charged on top. Because the rate depends on exactly what you import, the only reliable figure comes from a licensed customs broker once your documents are ready.",
      "This guide explains the parts that make up the bill so you know what to expect. It does not list current rates, because these change; NDL's brokers confirm the exact amount for your shipment.",
    ],
    sections: [
      {
        h: "1. The HS code decides the duty rate",
        p: [
          "Every product is classified under a Harmonized System (HS) code. The code tells customs which tariff rate applies. Two similar-looking products can fall under different codes with different rates, so accurate descriptions on your invoice matter.",
          "Vague descriptions such as \"goods\" or \"accessories\" slow down clearing and can lead to a higher classification. Ask your supplier to describe each item clearly.",
        ],
      },
      {
        h: "2. Customs value",
        p: [
          "Duty is generally charged on the customs value of the goods, which normally includes the cost of the goods, insurance and freight to Ghana. Customs can compare your declared value against reference values, so under-declaring often backfires and causes delays or penalties.",
        ],
      },
      {
        h: "3. Taxes and levies on top of duty",
        p: [
          "Besides import duty, an import declaration usually includes VAT and a number of levies and fees set by the government. The exact list and rates are set by the Ghana Revenue Authority and can change, so we do not quote them here. Your broker will show each line on your assessment.",
        ],
      },
      {
        h: "4. Documents you need",
        bullets: [
          "Commercial invoice from the supplier",
          "Packing list",
          "Bill of lading (sea) or air waybill (air)",
          "Any permits or certificates your goods require",
          "Your Ghana ID or TIN details",
        ],
        p: [
          "For NDL groupage customers, we prepare much of this for you from the information you give us when the goods are received at our China warehouse.",
        ],
      },
      {
        h: "5. How clearing works at Tema",
        p: [
          "Once the vessel arrives, the declaration is lodged, duty is assessed and paid, the goods may be inspected, and a release is issued. NDL's in-house licensed brokers handle these steps, along with port charges and delivery orders. Read our guide on clearing goods at Tema Port for the full process.",
        ],
      },
      {
        h: "How to keep your duty bill fair",
        bullets: [
          "Describe goods accurately and in detail",
          "Keep real invoices; never use fake values",
          "Ask NDL about duty before you buy expensive or unusual items",
          "Check whether your goods need a permit before shipping",
        ],
      },
      {
        h: "Is duty included in NDL's rates?",
        p: [
          "For sea groupage (LCL) from China, NDL's rate from $230 per CBM includes customs clearing. Ask your sales rep exactly what is covered for your shipment so there are no surprises.",
        ],
      },
    ],
    faqs: [
      { q: "How is import duty calculated in Ghana?", a: "Duty is based on the customs value of your goods and the tariff for their HS code, with VAT and other levies added. A licensed broker confirms the exact amount." },
      { q: "Can I know my duty before shipping?", a: "Yes. Send NDL a clear description of the goods and their value and our brokers can give you an estimate before your cargo arrives." },
      { q: "Does NDL clear goods at Tema?", a: "Yes. NDL has licensed customs brokers in-house who clear goods at Tema Port and Kotoka Airport." },
      { q: "What happens if I under-declare my goods?", a: "Customs may re-value the goods, delay release or apply penalties. Always declare the real value." },
    ],
    keywords: ["Ghana import duty", "Tema customs"],
  },
  {
    slug: "air-freight-vs-sea-freight-china-ghana",
    title: "Air vs Sea Freight from China to Ghana: Which Is Cheaper?",
    seoTitle: "Air vs Sea Freight China to Ghana: Which Is Cheaper? | NDL",
    description:
      "Compare air and sea freight from China to Ghana on cost, transit time and the kind of goods each suits, with worked examples using NDL's rates.",
    category: "shipping-costs",
    published: PUB,
    updated: PUB,
    readMinutes: 6,
    image: IMG.airCargoPlane,
    imageAlt: "Cargo plane and container ship comparison",
    lane: "china",
    intro: [
      "Short answer: sea freight is almost always cheaper from China to Ghana, especially for heavy or bulky goods. Air freight costs more but arrives much faster. Choose sea when you can wait about 35-45 days, and air when speed matters or the goods are light and valuable.",
    ],
    sections: [
      {
        h: "NDL rates at a glance",
        table: {
          head: ["", "Sea groupage (LCL)", "Air freight"],
          rows: [
            ["Price", "From $230 per CBM", "$20/kg normal, $25/kg special"],
            ["Transit", "About 35-45 days", "About 10-14 days"],
            ["Customs clearing", "Included for LCL", "Ask your sales rep"],
            ["Best for", "Heavy, bulky, low value per kg", "Urgent, light, high value"],
          ],
        },
      },
      {
        h: "How sea freight is charged",
        p: [
          "Sea groupage is charged by volume in cubic metres (CBM). Your cartons share a container with other NDL customers, so you only pay for the space you use. A CBM is roughly the space of a box one metre long, wide and high. See our guide on what CBM is for the formula.",
        ],
      },
      {
        h: "How air freight is charged",
        p: [
          "Air freight is charged per kilogram, on whichever is higher: the actual weight or the volumetric weight. Light but bulky items, such as pillows or plastic toys, can cost more by air than their weight suggests.",
        ],
      },
      {
        h: "Worked example",
        p: [
          "Imagine 10 cartons of clothing, each 60 x 40 x 40 cm and 15 kg. The total volume is about 0.96 CBM and the total weight is 150 kg.",
          "By sea at $230 per CBM, the freight is roughly $221. By air at $20 per kg (if actual weight is the chargeable weight), it is about $3,000. Sea is the clear winner unless you need the goods within two weeks.",
          "Now imagine one small carton of phone accessories weighing 8 kg. By air that is about $160 and arrives in 10-14 days. For small, valuable, fast-selling items, air can make more business sense.",
          "These are illustrations only. Use the instant quote tool for real numbers.",
        ],
      },
      {
        h: "When to choose sea freight",
        bullets: [
          "Furniture, building materials, machinery, bulk stock",
          "When you can plan your stock 6-8 weeks ahead",
          "When cost per unit matters more than speed",
        ],
      },
      {
        h: "When to choose air freight",
        bullets: [
          "Urgent orders or samples",
          "Phones, accessories and other light, valuable goods",
          "Fast-moving fashion items",
        ],
        p: ["Tell your sales rep about any special goods before you ship by air, as they are charged at the special rate."],
      },
      {
        h: "Mixing both",
        p: [
          "Many importers send a small batch by air to start selling quickly and the main stock by sea. This keeps cash moving without paying air rates for everything.",
        ],
      },
    ],
    faqs: [
      { q: "Is sea or air freight cheaper from China to Ghana?", a: "Sea freight is cheaper for most goods. Air freight costs more per kg but arrives faster." },
      cbmFaq,
      airFaq,
      { q: "How long does sea freight from China to Ghana take?", a: "NDL sea groupage takes about 35-45 days from China to Ghana." },
    ],
    keywords: ["air freight vs sea freight Ghana"],
  },
  {
    slug: "what-is-cbm-and-how-to-calculate-it",
    title: "What Is CBM? How to Calculate Shipping Volume",
    seoTitle: "What Is CBM? How to Calculate Shipping Volume | NDL Cargo",
    description:
      "CBM explained for Ghanaian importers: the formula, worked examples in centimetres, how CBM affects your sea freight cost and how it compares to air chargeable weight.",
    category: "shipping-costs",
    published: PUB,
    updated: PUB,
    readMinutes: 5,
    image: IMG.stackedContainers,
    imageAlt: "Stacked cartons measured for CBM",
    lane: "china",
    intro: [
      "Short answer: CBM means cubic metre. To calculate it, multiply length x width x height of a carton in centimetres, multiply by the number of cartons, then divide by 1,000,000. Sea groupage is priced per CBM, so knowing your CBM tells you roughly what your shipment will cost.",
    ],
    sections: [
      {
        h: "The CBM formula",
        p: [
          "CBM = (length cm x width cm x height cm x number of cartons) / 1,000,000.",
          "If you measure in metres, simply multiply length x width x height x cartons.",
        ],
      },
      {
        h: "Worked examples",
        table: {
          head: ["Carton size (cm)", "Cartons", "CBM"],
          rows: [
            ["50 x 40 x 30", "1", "0.06"],
            ["50 x 40 x 30", "20", "1.20"],
            ["60 x 40 x 40", "10", "0.96"],
            ["100 x 100 x 100", "1", "1.00"],
          ],
        },
        p: [
          "At NDL's sea groupage rate from $230 per CBM, 1.2 CBM costs roughly $276 in freight, with customs clearing included for LCL. Use the quote tool for your exact rate.",
        ],
      },
      {
        h: "Why CBM matters",
        p: [
          "In a shared container, space is what you are buying. Two cartons of the same weight can cost very different amounts if one is much bigger. Good packing that removes empty space directly lowers your bill.",
        ],
        bullets: [
          "Ask suppliers to use right-sized cartons",
          "Avoid over-sized outer boxes",
          "Combine small parcels into fewer cartons",
        ],
      },
      {
        h: "CBM for air freight",
        p: [
          "Air freight is charged by weight, but airlines also look at volume. The volumetric weight is calculated from the carton size, and you pay on whichever is higher: actual or volumetric weight. Our quote tool works this out for you.",
        ],
      },
      {
        h: "LCL vs FCL and CBM",
        p: [
          "If your goods are only a few CBM, LCL groupage is usually best. When your volume gets close to filling a container, a full container (FCL) can work out cheaper. See our LCL vs FCL guide for how to decide.",
        ],
      },
      {
        h: "Measuring tips",
        bullets: [
          "Measure the outer carton, including bulges",
          "Round up to the nearest centimetre",
          "Ask your supplier for the packing list with dimensions",
          "Remember that NDL measures again at the warehouse",
        ],
      },
    ],
    faqs: [
      { q: "How do I calculate CBM?", a: "Multiply length x width x height in centimetres and the number of cartons, then divide by 1,000,000." },
      { q: "What is 1 CBM in cartons?", a: "It depends on carton size. For example, about 16 cartons of 50 x 40 x 30 cm make roughly 1 CBM." },
      cbmFaq,
      { q: "Does NDL measure my cartons?", a: "Yes. Cartons are measured at our China warehouse and that measurement is used for your invoice." },
    ],
    keywords: ["CBM calculator", "LCL vs FCL"],
  },
  {
    slug: "lcl-vs-fcl-shipping-to-ghana",
    title: "LCL vs FCL: Which Should You Choose for Ghana?",
    seoTitle: "LCL vs FCL Shipping to Ghana: Which to Choose? | NDL Cargo",
    description:
      "The difference between LCL groupage and FCL full containers for shipping to Ghana, with guidance on cost, speed, handling and when to switch.",
    category: "how-to-ship",
    published: PUB,
    updated: PUB,
    readMinutes: 5,
    image: IMG.containerShipPort,
    imageAlt: "Containers loaded on a ship bound for Tema",
    lane: "china",
    intro: [
      "Short answer: choose LCL (less than container load) when you have a few cartons or a few CBM, because you share a container and pay only for your space. Choose FCL (full container load) when you have enough goods to fill most of a 20ft or 40ft container, because the cost per unit becomes lower and your goods are handled less.",
    ],
    sections: [
      {
        h: "What is LCL?",
        p: [
          "LCL, also called groupage or consolidation, means your goods share a container with other importers. NDL collects goods from many customers at our China warehouses and loads them together each week. You pay by CBM, from $230 per CBM, with customs clearing included for LCL shipments.",
        ],
      },
      {
        h: "What is FCL?",
        p: [
          "FCL means you book a whole container, usually 20ft or 40ft. Only your goods are inside. Pricing is per container rather than per CBM. NDL's in-house agents handle clearing for FCL too. Ask for a quote for current container rates.",
        ],
      },
      {
        h: "Side-by-side comparison",
        table: {
          head: ["", "LCL", "FCL"],
          rows: [
            ["Pricing", "Per CBM", "Per container"],
            ["Best for", "Small and medium volumes", "Large volumes"],
            ["Handling", "Shared, more handling", "Your goods only"],
            ["Clearing", "Included for LCL", "Handled by NDL agents"],
          ],
        },
      },
      {
        h: "When LCL makes sense",
        bullets: [
          "First-time or small importers",
          "Testing a new product",
          "Shipments from several suppliers combined into one",
        ],
      },
      {
        h: "When FCL makes sense",
        bullets: [
          "You regularly ship large volumes",
          "Heavy goods like tiles, machinery or furniture",
          "Goods that should not be mixed with other cargo",
        ],
      },
      {
        h: "The break-even point",
        p: [
          "There is no single number, because container prices change. As your CBM grows, ask NDL to compare the LCL cost with an FCL quote. When the FCL price is close to or below your total LCL cost, the full container is usually the better deal.",
        ],
      },
    ],
    faqs: [
      { q: "What does LCL mean?", a: "LCL means less than container load: your goods share a container with other importers and you pay by volume." },
      { q: "What does FCL mean?", a: "FCL means full container load: you book a whole 20ft or 40ft container for your goods only." },
      cbmFaq,
      { q: "Is customs clearing included?", a: "Customs clearing is included for LCL groupage. For FCL, NDL's in-house agents handle clearing; ask for the full quote." },
    ],
    keywords: ["LCL FCL Ghana"],
  },
  {
    slug: "how-to-pay-chinese-suppliers-from-ghana",
    title: "How to Pay Chinese Suppliers from Ghana Safely",
    seoTitle: "How to Pay Chinese Suppliers from Ghana Safely | NDL Cargo",
    description:
      "Safe ways to pay suppliers in China from Ghana, the warning signs of scams, and how NDL can pay your supplier and receive your goods for you.",
    category: "how-to-ship",
    published: PUB,
    updated: PUB,
    readMinutes: 6,
    image: IMG.chinaHub,
    imageAlt: "Supplier goods being received at a China warehouse",
    lane: "china",
    intro: [
      "Short answer: pay through a platform with buyer protection (such as Alibaba's payment system) or through a trusted agent who pays the supplier in China for you, and only after you have verified the supplier. Never pay into a personal account you cannot verify, and keep every agreement in writing.",
    ],
    sections: [
      {
        h: "Why paying suppliers is hard from Ghana",
        p: [
          "Many Chinese suppliers prefer local payment methods that are not easy to use from Ghana. International bank transfers can be slow and costly. This gap is where many importers lose money to fake suppliers.",
        ],
      },
      {
        h: "Safe payment options",
        bullets: [
          "Platform payment with buyer protection, where available",
          "Paying through a trusted agent with staff in China",
          "Bank transfer to a verified company account",
        ],
        p: [
          "NDL can pay your supplier in China on your behalf. Our team in China pays the supplier, receives the goods at our warehouse and ships them to Ghana, so the whole process is handled by one company.",
        ],
      },
      {
        h: "Warning signs of a scam",
        bullets: [
          "A price far below every other supplier",
          "Pressure to pay quickly",
          "A request to pay into a personal account not matching the company name",
          "Refusal to show real photos or a video of the goods",
          "Bank details that change at the last minute",
        ],
      },
      {
        h: "How to check a supplier",
        p: [
          "Look at the company's trading history, reviews and business details. Ask for a sample. If the order is large, ask NDL whether our team can visit or check the goods when they arrive at our warehouse.",
        ],
      },
      {
        h: "Protect yourself with written terms",
        p: [
          "Agree the product, quantity, price, production time and delivery address in writing before paying. Many suppliers accept a deposit with the balance paid before goods leave the factory.",
        ],
      },
      {
        h: "What NDL never asks for",
        p: [
          "NDL staff will never ask for your bank PIN, card details or passwords. If someone claims to be from NDL and asks for these, contact us on WhatsApp first.",
        ],
      },
    ],
    faqs: [
      { q: "Can NDL pay my supplier in China?", a: "Yes. We pay your supplier directly, receive the goods at our warehouse and ship them to Ghana." },
      { q: "What is the safest way to pay a Chinese supplier?", a: "Use a platform with buyer protection or a trusted agent with staff in China, and only after checking the supplier." },
      { q: "Should I pay the full amount upfront?", a: "Many suppliers accept a deposit with the balance before shipping. Agree the terms in writing first." },
      { q: "How do I know a supplier is real?", a: "Check their history and details, ask for real photos or a sample, and avoid prices far below the market." },
    ],
    keywords: ["pay supplier China Ghana"],
  },
  {
    slug: "best-products-to-import-from-china-to-ghana",
    title: "Best Products to Import from China to Ghana",
    seoTitle: "Best Products to Import from China to Ghana | NDL Cargo",
    description:
      "Product categories Ghanaian importers commonly bring in from China, how to choose a product that sells, and what to check before you buy.",
    category: "how-to-ship",
    published: PUB,
    updated: PUB,
    readMinutes: 6,
    image: IMG.warehouseInterior,
    imageAlt: "Cartons of goods from China in a warehouse",
    lane: "china",
    intro: [
      "Short answer: the best product to import is one you can sell quickly at a good margin in your own market. Categories NDL customers commonly ship from China include phone accessories, fashion and textiles, cosmetics and beauty products, hardware and tools, household items and small commodities. Always test with a small order first.",
    ],
    sections: [
      {
        h: "How to choose a product",
        bullets: [
          "Know who will buy it and at what price",
          "Check the landed cost: goods + shipping + duty + delivery",
          "Prefer items that are light or compact for their value",
          "Avoid fragile items for your first order",
          "Check the item is allowed into Ghana",
        ],
      },
      {
        h: "Popular categories by China hub",
        table: {
          head: ["Hub", "Common goods"],
          rows: [
            ["Yiwu", "Small commodities, gifts, accessories, textiles"],
            ["Guangzhou and Foshan", "Electronics, phones, cosmetics, fashion"],
            ["Taizhou", "Hardware, plumbing, machinery, tools"],
          ],
        },
      },
      {
        h: "Phone accessories and electronics",
        p: [
          "Cases, chargers, earphones and similar items are light and sell fast. Because they are light, many importers send small top-up batches by air at $20/kg for normal goods. Check product quality carefully, as cheap electronics have high return rates.",
        ],
      },
      {
        h: "Fashion, textiles and hair",
        p: [
          "Clothing, bags, shoes and fabrics are steady sellers in Ghana. Sea groupage keeps the cost per item low for larger quantities.",
        ],
      },
      {
        h: "Cosmetics and beauty",
        p: [
          "Beauty products sell well but can require approval. Check requirements before ordering, and tell NDL about any special goods before shipping.",
        ],
      },
      {
        h: "Hardware, tools and building materials",
        p: [
          "Heavy and bulky goods such as tools, plumbing items and fittings are best shipped by sea. For large volumes, compare LCL with a full container.",
        ],
      },
      {
        h: "Work out your landed cost",
        p: [
          "Add the supplier price, sea or air freight, duty and local delivery to get the real cost per item. Our quote tool helps with the freight part; NDL's brokers can estimate duty before you buy.",
        ],
      },
    ],
    faqs: [
      { q: "What is the most profitable product to import from China to Ghana?", a: "It depends on your market. Products that sell quickly, are compact for their value and have reliable quality usually do best." },
      { q: "Can NDL help me find products?", a: "Yes. Our sourcing agents in Guangzhou and Yiwu can help you find products and suppliers." },
      cbmFaq,
      { q: "Which goods cannot be imported into Ghana?", a: "Some goods are restricted or banned. Message NDL before buying if you are unsure about an item." },
    ],
    keywords: ["products to import from China"],
  },
  {
    slug: "clearing-goods-at-tema-port",
    title: "How Clearing Goods at Tema Port Works",
    seoTitle: "How Clearing Goods at Tema Port Works | NDL Cargo Ghana",
    description:
      "The customs clearing process at Tema Port explained: documents, declaration, duty assessment, inspection, release and delivery, and how NDL's brokers handle it.",
    category: "customs-duty",
    published: PUB,
    updated: PUB,
    readMinutes: 6,
    image: IMG.seaTema,
    imageAlt: "Containers at Tema Port awaiting clearing",
    lane: "china",
    intro: [
      "Short answer: clearing at Tema means lodging a customs declaration for your goods, paying the assessed duty and charges, passing any inspection, and getting a release so the goods can leave the port. A licensed customs broker handles these steps. At NDL, our in-house brokers clear groupage and full containers and then deliver to you.",
    ],
    sections: [
      {
        h: "Step 1: Documents are prepared",
        p: [
          "Before the vessel arrives, the broker gathers the bill of lading, commercial invoice, packing list and any permits. For NDL groupage customers, much of this comes from what we record when your goods arrive at our China warehouse.",
        ],
      },
      {
        h: "Step 2: Declaration is lodged",
        p: [
          "The broker submits the customs declaration through Ghana's customs system, with the HS code and value of each item.",
        ],
      },
      {
        h: "Step 3: Duty and charges are assessed and paid",
        p: [
          "Customs assesses import duty, taxes and levies based on the declaration. Port and shipping line charges are also paid. See our customs duty guide for how the amount is worked out.",
        ],
      },
      {
        h: "Step 4: Inspection",
        p: [
          "Some shipments are selected for physical or scanner inspection. Accurate descriptions and values help this stage go smoothly.",
        ],
      },
      {
        h: "Step 5: Release and delivery order",
        p: [
          "Once everything is paid and approved, the goods are released and a delivery order is issued. For groupage, NDL unpacks the container at our facility and sorts cargo by shipping mark.",
        ],
      },
      {
        h: "Step 6: Collection or delivery",
        p: [
          "You collect from our Accra warehouse or choose door delivery anywhere in Ghana. You get WhatsApp updates at each milestone and can track your shipment online.",
        ],
      },
      {
        h: "How to avoid delays",
        bullets: [
          "Describe goods clearly on the invoice",
          "Declare the real value",
          "Get any needed permits before shipping",
          "Make sure every carton carries your shipping mark",
          "Settle your NDL invoice promptly so goods are released quickly",
        ],
      },
      {
        h: "Is clearing included with NDL?",
        p: [
          "Yes, customs clearing is included for NDL sea groupage (LCL) from $230 per CBM. For full containers, NDL's in-house agents handle clearing as part of your quote.",
        ],
      },
    ],
    faqs: [
      { q: "Who can clear goods at Tema Port?", a: "Goods are cleared by licensed customs brokers. NDL has licensed brokers in-house." },
      { q: "Is customs clearing included in NDL's price?", a: "Customs clearing is included for LCL groupage shipments. For FCL, ask for a full quote." },
      { q: "What documents are needed to clear goods?", a: "Usually the bill of lading, commercial invoice, packing list and any permits for your goods." },
      { q: "How will I know my goods are cleared?", a: "NDL sends WhatsApp updates at each milestone, and you can track your shipment online." },
    ],
    keywords: ["clearing at Tema port"],
  },
];
