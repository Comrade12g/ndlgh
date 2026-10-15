// Centralized asset URLs for the marketing gallery.
// Photos are served from /public/gallery as optimized progressive JPEGs
// (1600w + 800w variants) with inline LQIP previews in ./lqip.ts.
export const IMG = {
  airAccra: "/gallery/air-accra.webp",
  airCargoPlane: "/gallery/air-cargo-plane.webp",
  canadaHub: "/gallery/canada-hub.webp",
  chinaHub: "/gallery/china-hub.webp",
  containerShipPort: "/gallery/container-ship-port.webp",
  customsClearing: "/gallery/customs-clearing.webp",
  deliveryTruck: "/gallery/delivery-truck.webp",
  dubaiHub: "/gallery/dubai-hub.webp",
  freighterNight: "/gallery/freighter-night.webp",
  portCranes: "/gallery/port-cranes.webp",
  seaTema: "/gallery/sea-tema.webp",
  stackedContainers: "/gallery/stacked-containers.webp",
  thailandHub: "/gallery/thailand-hub.webp",
  usHub: "/gallery/us-hub.webp",
  warehouseInterior: "/gallery/warehouse-interior.webp",
  warehousePallets: "/gallery/warehouse-pallets.webp",
};

/** Small (800w) variant for cards, thumbnails and mobile. */
export function small(src: string) {
  return src.startsWith("/gallery/") ? src.replace(/\.(jpg|webp)$/, "-800.webp") : src;
}
