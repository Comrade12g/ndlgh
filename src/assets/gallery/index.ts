// Centralized marketing photographs. New stock uses CDN asset pointers.
import air from "./stock-air-accra.webp.asset.json";
import airSmall from "./stock-air-accra-800.webp.asset.json";
import customs from "./stock-customs-clearing.webp.asset.json";
import customsSmall from "./stock-customs-clearing-800.webp.asset.json";
import delivery from "./stock-delivery-truck.webp.asset.json";
import deliverySmall from "./stock-delivery-truck-800.webp.asset.json";
import night from "./stock-freighter-night.webp.asset.json";
import nightSmall from "./stock-freighter-night-800.webp.asset.json";
import cranes from "./stock-port-cranes.webp.asset.json";
import cranesSmall from "./stock-port-cranes-800.webp.asset.json";
import containers from "./stock-stacked-containers.webp.asset.json";
import containersSmall from "./stock-stacked-containers-800.webp.asset.json";
import us from "./stock-us-hub.webp.asset.json";
import usSmall from "./stock-us-hub-800.webp.asset.json";
import warehouse from "./stock-warehouse-interior.webp.asset.json";
import warehouseSmall from "./stock-warehouse-interior-800.webp.asset.json";

const variants: Record<string, string> = {
  [air.url]: airSmall.url, [customs.url]: customsSmall.url,
  [delivery.url]: deliverySmall.url, [night.url]: nightSmall.url,
  [cranes.url]: cranesSmall.url, [containers.url]: containersSmall.url,
  [us.url]: usSmall.url, [warehouse.url]: warehouseSmall.url,
};

export const IMG = {
  airAccra: air.url,
  airCargoPlane: "/gallery/air-cargo-plane.webp",
  canadaHub: "/gallery/canada-hub.webp",
  chinaHub: "/gallery/china-hub.webp",
  containerShipPort: "/gallery/container-ship-port.webp",
  customsClearing: customs.url,
  deliveryTruck: delivery.url,
  dubaiHub: "/gallery/dubai-hub.webp",
  freighterNight: night.url,
  portCranes: cranes.url,
  seaTema: "/gallery/sea-tema.webp",
  stackedContainers: containers.url,
  thailandHub: "/gallery/thailand-hub.webp",
  usHub: us.url,
  warehouseInterior: warehouse.url,
  warehousePallets: "/gallery/warehouse-pallets.webp",
};

/** Small (800w) variant for cards, thumbnails and mobile. */
export function small(src: string) {
  return variants[src] ?? (src.startsWith("/gallery/") ? src.replace(/\.(jpg|webp)$/, "-800.webp") : src);
}

export function imageSrcSet(src: string) {
  const thumbnail = small(src);
  return thumbnail !== src ? `${thumbnail} 800w, ${src} 1600w` : undefined;
}
