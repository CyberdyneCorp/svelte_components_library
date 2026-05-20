/**
 * NASA EOSDIS GIBS WMTS product catalog + URL helpers.
 *
 * Adapted from the geo_dashboard reference implementation. Lives outside
 * the `*.svelte` files so it can be tree-shaken when no consumer renders
 * a `<NasaGibsLayer>`.
 */

export type GibsProduct =
  | "MODIS_Terra_NDVI_8Day"
  | "MODIS_Terra_NDWI_8Day"
  | "MODIS_Terra_EVI_8Day"
  | "MODIS_Terra_CorrectedReflectance_TrueColor"
  | "GOES-East_ABI_GeoColor"
  | "GOES-West_ABI_GeoColor"
  | "Himawari_AHI_GeoColor";

interface GibsProductMeta {
  format: "png" | "jpg" | "jpeg";
  tileMatrixSet: string;
  maxLevel: number;
}

const PRODUCTS: Record<GibsProduct, GibsProductMeta> = {
  MODIS_Terra_NDVI_8Day: {
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxLevel: 9,
  },
  MODIS_Terra_NDWI_8Day: {
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxLevel: 9,
  },
  MODIS_Terra_EVI_8Day: {
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxLevel: 9,
  },
  MODIS_Terra_CorrectedReflectance_TrueColor: {
    format: "jpg",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    maxLevel: 9,
  },
  "GOES-East_ABI_GeoColor": {
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level7",
    maxLevel: 7,
  },
  "GOES-West_ABI_GeoColor": {
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level7",
    maxLevel: 7,
  },
  Himawari_AHI_GeoColor: {
    format: "png",
    tileMatrixSet: "GoogleMapsCompatible_Level7",
    maxLevel: 7,
  },
};

const NEAR_REALTIME_PRODUCTS = new Set<GibsProduct>([
  "GOES-East_ABI_GeoColor",
  "GOES-West_ABI_GeoColor",
  "Himawari_AHI_GeoColor",
]);

/**
 * Build a Cesium-friendly URL template for the NASA GIBS WMTS REST endpoint.
 * `{z}/{y}/{x}` are the tile matrix / row / column placeholders Cesium fills.
 *
 * For near-real-time products the date string must include time-of-day; for
 * daily / 8-day composites only the YYYY-MM-DD form is used.
 */
export function gibsUrlTemplate(product: GibsProduct, dateIso: string): string {
  const meta = PRODUCTS[product];
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${product}/default/${dateIso}/${meta.tileMatrixSet}/{z}/{y}/{x}.${meta.format}`;
}

export function gibsMaxLevel(product: GibsProduct): number {
  return PRODUCTS[product].maxLevel;
}

export function isNearRealtimeProduct(product: GibsProduct): boolean {
  return NEAR_REALTIME_PRODUCTS.has(product);
}

/**
 * Most-recent 8-day MODIS composite. They publish on the 1st, 9th, 17th, 25th…
 * Subtracts 8 days for safety in case a composite is still being staged.
 */
export function defaultGibsCompositeDate(now: Date = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - 8);
  const day = d.getUTCDate();
  const composite = day - ((day - 1) % 8);
  d.setUTCDate(composite);
  return d.toISOString().slice(0, 10);
}

/**
 * Sub-daily live products require an ISO timestamp at 10-minute granularity.
 * Rounded 10 minutes back to give the latest tile a moment to publish.
 */
export function nearRealtimeTimestamp(now: Date = new Date()): string {
  const d = new Date(now.getTime() - 10 * 60_000);
  d.setUTCMinutes(Math.floor(d.getUTCMinutes() / 10) * 10, 0, 0);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * The product catalog + a human-readable label. Used by consumer-side product
 * pickers (e.g. dropdowns). Decoupled from the URL helpers so consumers can
 * ship their own labels if they need translation.
 */
export const GIBS_PRODUCT_LABELS: Record<GibsProduct, string> = {
  MODIS_Terra_NDVI_8Day: "NDVI (8-day, MODIS Terra)",
  MODIS_Terra_NDWI_8Day: "NDWI (8-day, MODIS Terra)",
  MODIS_Terra_EVI_8Day: "EVI (8-day, MODIS Terra)",
  MODIS_Terra_CorrectedReflectance_TrueColor: "True Color (daily, MODIS Terra)",
  "GOES-East_ABI_GeoColor": "Live cloud — GOES-East (Americas)",
  "GOES-West_ABI_GeoColor": "Live cloud — GOES-West (Pacific)",
  Himawari_AHI_GeoColor: "Live cloud — Himawari (Asia/Pacific)",
};
