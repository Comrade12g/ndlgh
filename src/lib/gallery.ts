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
  { src: IMG.airAccra,          alt: "Citilink cargo aircraft on the airport apron — stock photograph", caption: "Air cargo aircraft · stock photograph", location: "" },
  { src: IMG.warehousePallets,  alt: "Warehouse pallets ready for dispatch",  caption: "Groupage consolidation warehouse",   location: "Guangzhou" },
  { src: IMG.deliveryTruck,     alt: "Delivery van loaded with cartons — stock photograph", caption: "Cargo delivery · stock photograph", location: "" },
  { src: IMG.portCranes,        alt: "Hamburg port cranes at sunset — stock photograph", caption: "Port cranes · stock photograph", location: "Hamburg" },
];

export const FALLBACK_GALLERY = [
  { src: IMG.containerShipPort, alt: "Container ship at port",              category: "Port & Vessels", location: "Tema" },
  { src: IMG.warehouseInterior, alt: "Warehouse storage aisle · stock photograph", category: "Warehouse", location: "" },
  { src: IMG.airAccra,          alt: "Cargo aircraft on airport apron · stock photograph", category: "Air Cargo", location: "" },
  { src: IMG.deliveryTruck,     alt: "Delivery van loaded with cartons · stock photograph", category: "Delivery", location: "" },
  { src: IMG.stackedContainers, alt: "Stacked shipping containers · stock photograph", category: "Port & Vessels", location: "" },
  { src: IMG.portCranes,        alt: "Port cranes at sunset · stock photograph", category: "Port & Vessels", location: "Hamburg" },
  { src: IMG.warehousePallets,  alt: "Pallets in a bonded warehouse",       category: "Warehouse",      location: "Guangzhou" },
  { src: IMG.freighterNight,    alt: "Cargo ship and illuminated port at night · stock photograph", category: "Port & Vessels", location: "" },
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
