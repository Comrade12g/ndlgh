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

// Curated fallback photos used when the admin has not populated the gallery yet
// (or as seed content).
export const FALLBACK_HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1600&q=70",
    alt: "Container ship arriving at port",
    caption: "Sea freight into Tema Port",
    location: "Tema",
  },
  {
    src: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1600&q=70",
    alt: "Cargo plane on tarmac at sunrise",
    caption: "Air cargo via Kotoka International",
    location: "Accra",
  },
  {
    src: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=70",
    alt: "Warehouse pallets ready for dispatch",
    caption: "Groupage consolidation warehouse",
    location: "Guangzhou",
  },
  {
    src: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=1600&q=70",
    alt: "Delivery truck with cargo",
    caption: "Ghana-wide last-mile delivery",
    location: "Kumasi",
  },
  {
    src: "https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?auto=format&fit=crop&w=1600&q=70",
    alt: "Port cranes at dusk",
    caption: "24/7 port operations",
    location: "Tema",
  },
];

export const FALLBACK_GALLERY = [
  { src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=65", alt: "Container ship at port", category: "Port & Vessels", location: "Tema" },
  { src: "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=900&q=65", alt: "Warehouse interior", category: "Warehouse", location: "Accra" },
  { src: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=900&q=65", alt: "Cargo plane on tarmac", category: "Air Cargo", location: "Accra" },
  { src: "https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=900&q=65", alt: "Delivery truck", category: "Delivery", location: "Kumasi" },
  { src: "https://images.unsplash.com/photo-1577032229840-33f74d0ab24e?auto=format&fit=crop&w=900&q=65", alt: "Stacked containers", category: "Port & Vessels", location: "Tema" },
  { src: "https://images.unsplash.com/photo-1519666336592-e225a99dcd2f?auto=format&fit=crop&w=900&q=65", alt: "Port cranes at dusk", category: "Port & Vessels", location: "Takoradi" },
  { src: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=65", alt: "Pallets in a bonded warehouse", category: "Warehouse", location: "Guangzhou" },
  { src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=65", alt: "Freighter loading at night", category: "Air Cargo", location: "Dubai" },
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
