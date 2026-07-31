// Centralized asset URLs for the marketing gallery.
// Photos are served from /public/gallery as optimized progressive JPEGs
// (1600w + 800w variants) with inline LQIP previews in ./lqip.ts.
export const IMG = {
  airAccra: "/gallery/air-accra.jpg",
  airCargoPlane: "/gallery/air-cargo-plane.jpg",
  canadaHub: "/gallery/canada-hub.jpg",
  chinaHub: "/gallery/china-hub.jpg",
  containerShipPort: "/gallery/container-ship-port.jpg",
  customsClearing: "/gallery/customs-clearing.jpg",
  deliveryTruck: "/gallery/delivery-truck.jpg",
  dubaiHub: "/gallery/dubai-hub.jpg",
  freighterNight: "/gallery/freighter-night.jpg",
  portCranes: "/gallery/port-cranes.jpg",
  seaTema: "/gallery/sea-tema.jpg",
  stackedContainers: "/gallery/stacked-containers.jpg",
  thailandHub: "/gallery/thailand-hub.jpg",
  usHub: "/gallery/us-hub.jpg",
  warehouseInterior: "/gallery/warehouse-interior.jpg",
  warehousePallets: "/gallery/warehouse-pallets.jpg",
};

/** Small (800w) variant for cards, thumbnails and mobile. */
export function small(src: string) {
  return src.startsWith("/gallery/") ? src.replace(/\.jpg$/, "-800.jpg") : src;
}
