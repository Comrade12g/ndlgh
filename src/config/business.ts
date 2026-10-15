/**
 * Single source of truth for NDL business facts used in copy, footer and
 * structured data. Change a value here and it updates everywhere.
 * Values marked [CONFIRM] are awaiting owner confirmation.
 */
export const BUSINESS = {
  name: "NDL Cargo Ghana",
  domain: "https://www.ndlgh.com",
  phone: "0500229352",
  phoneIntl: "+233500229352",
  email: "info@ndlgh.com",
  officeAddress: "Derby Avenue, Ferro Bel Plaza, Accra, Ghana",
  officeStreet: "Derby Avenue, Ferro Bel Plaza",
  officeLocality: "Accra",
  warehouseAddress: "[CONFIRM]",
  hours: "Mon-Sat, 9:00-18:00",
  openingHoursSchema: "Mo-Sa 09:00-18:00",
  seaLclFromUsdPerCbm: 230,
  airNormalUsdPerKg: 20,
  airSpecialUsdPerKg: 25,
  // Confirmed by owner: sea 35–45 days, air 10–14 days.
  seaLclDays: "35-45",
  seaFclDays: "[CONFIRM]",
  airDays: "10-14",
  expressAirDays: "[CONFIRM]",
  clearanceDays: "3-5 working days", // [CONFIRM]
  googleReviewUrl: "", // [CONFIRM] add after Google Business Profile is created
  socials: {
    instagram: "https://www.instagram.com/ndl_gh",
    facebook: "https://www.facebook.com/share/14wUVFKJMcc/",
    tiktok: "https://www.tiktok.com/@ndlcargogh",
    whatsappChannel: "https://whatsapp.com/channel/0029Vb9DNNh3bbUyeuc5BE1P",
  },
} as const;

export const WHATSAPP_URL = `https://wa.me/${BUSINESS.phoneIntl.replace("+", "")}`;

export function isConfirmed(v: string) {
  return !v.includes("[CONFIRM");
}

export const LOCAL_BUSINESS_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: BUSINESS.name,
  url: BUSINESS.domain,
  image: `${BUSINESS.domain}/gallery/sea-tema.webp`,
  telephone: BUSINESS.phoneIntl,
  email: BUSINESS.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.officeStreet,
    addressLocality: BUSINESS.officeLocality,
    addressCountry: "GH",
  },
  openingHours: BUSINESS.openingHoursSchema,
  sameAs: [BUSINESS.socials.instagram, BUSINESS.socials.facebook, BUSINESS.socials.tiktok],
};
