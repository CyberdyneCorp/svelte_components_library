<svelte:options runes={true} />

<script lang="ts">
  import Cesium3DTiles from "../Cesium3DTiles/Cesium3DTiles.svelte";
  import {
    GOOGLE_PHOTOREALISTIC_ION_ASSET_ID,
    type Cesium3DTileStyleSpec,
    type TilesetSourceSpec,
  } from "../types.js";

  type Tileset = import("cesium").Cesium3DTileset;
  type TileFeature = import("cesium").Cesium3DTileFeature;

  type Props = {
    /**
     * Where to source the tiles from:
     *  - `"ion"` (default) — Cesium ion asset 2275207. Needs only the
     *    `ionToken` already set on the parent `<CesiumGlobe>`. Recommended:
     *    no Google key, no per-session billing on your own Google account,
     *    and no geocoder restriction.
     *  - `"google"` — Google Maps Platform directly. Requires `apiKey`
     *    (Map Tiles API SKU, billed per session).
     */
    source?: "ion" | "google";
    /**
     * Cesium ion asset id when `source="ion"`. Defaults to Google's official
     * Photorealistic 3D Tiles asset (2275207); override only if you have a
     * derived / custom ion asset.
     */
    ionAssetId?: number;
    /**
     * Google Maps Platform API key, used only when `source="google"`.
     * Without it the Google path falls back to `GoogleMaps.defaultApiKey`
     * (unset by default) and will fail — prefer `source="ion"` instead.
     */
    apiKey?: string;
    /**
     * Acknowledge Google's terms (tiles used only with the Google geocoder)
     * to suppress Cesium's one-time console warning on the `"google"` path.
     * No effect when `source="ion"`.
     */
    acknowledgeGoogleGeocoder?: boolean;
    visible?: boolean;
    opacity?: number;
    maximumScreenSpaceError?: number;
    style?: Cesium3DTileStyleSpec | null;
    onclick?: (feature: TileFeature) => void;
    onready?: (tileset: Tileset) => void;
  };

  let {
    source = "ion",
    ionAssetId = GOOGLE_PHOTOREALISTIC_ION_ASSET_ID,
    apiKey,
    acknowledgeGoogleGeocoder = false,
    visible = true,
    opacity = 1,
    maximumScreenSpaceError,
    style = null,
    onclick,
    onready,
  }: Props = $props();

  const tileSource = $derived<TilesetSourceSpec>(
    source === "google"
      ? {
          kind: "google-photorealistic",
          apiKey,
          onlyUsingWithGoogleGeocoder: acknowledgeGoogleGeocoder,
        }
      : { kind: "ion", assetId: ionAssetId },
  );
</script>

<Cesium3DTiles
  source={tileSource}
  {visible}
  {opacity}
  {maximumScreenSpaceError}
  {style}
  {onclick}
  {onready}
/>
