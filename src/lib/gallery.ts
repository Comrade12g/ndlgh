import { supabase } from "@/integrations/supabase/client";

export type GalleryPhoto = {
  id: string;
  title: string;
  category: string;
  location: string | null;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  is_hero: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export const GALLERY_CATEGORIES = [
  "Warehouse",
  "Port & Vessels",
  "Air Cargo",
  "Customs",
  "Delivery",
  "Team",
  "Origin Hubs",
  "Other",
] as const;

export const GALLERY_LOCATIONS = [
  "Tema",
  "Accra",
  "Kumasi",
  "Takoradi",
  "Guangzhou",
  "Yiwu",
  "Shenzhen",
  "Dubai",
  "Bangkok",
  "New York",
  "Los Angeles",
  "Toronto",
  "Other",
] as const;

// Curated fallback photos hosted on Lovable CDN (from src/assets/gallery).
import { IMG } from "@/assets/gallery";

export const FALLBACK_HERO_SLIDES = [
  { src: IMG.seaTema,           alt: "Container ship arriving at port",       caption: "Sea freight into Tema Port",         location: "Tema" },
  { src: IMG.airAccra,          alt: "Cargo plane on tarmac at sunrise",      caption: "Air cargo via Kotoka International", location: "Accra" },
  { src: IMG.warehousePallets,  alt: "Warehouse pallets ready for dispatch",  caption: "Groupage consolidation warehouse",   location: "Guangzhou" },
  { src: IMG.deliveryTruck,     alt: "Delivery truck with cargo",             caption: "Ghana-wide last-mile delivery",      location: "Kumasi" },
  { src: IMG.portCranes,        alt: "Port cranes at dusk",                   caption: "24/7 port operations",               location: "Tema" },
];

export const FALLBACK_GALLERY = [
  { src: IMG.containerShipPort, alt: "Container ship at port",              category: "Port & Vessels", location: "Tema" },
  { src: IMG.warehouseInterior, alt: "Warehouse interior",                  category: "Warehouse",      location: "Accra" },
  { src: IMG.airAccra,          alt: "Cargo plane on tarmac",               category: "Air Cargo",      location: "Accra" },
  { src: IMG.deliveryTruck,     alt: "Delivery truck",                      category: "Delivery",       location: "Kumasi" },
  { src: IMG.stackedContainers, alt: "Stacked containers",                  category: "Port & Vessels", location: "Tema" },
  { src: IMG.portCranes,        alt: "Port cranes at dusk",                 category: "Port & Vessels", location: "Takoradi" },
  { src: IMG.warehousePallets,  alt: "Pallets in a bonded warehouse",       category: "Warehouse",      location: "Guangzhou" },
  { src: IMG.freighterNight,    alt: "Freighter loading at night",          category: "Air Cargo",      location: "Dubai" },
];

export async function fetchActiveGallery(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("active", true)
    .order("is_hero", { ascending: false })
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GalleryPhoto[];
}
