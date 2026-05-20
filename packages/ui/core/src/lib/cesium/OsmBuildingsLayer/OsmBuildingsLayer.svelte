<svelte:options runes={true} />

<script lang="ts">
  import Cesium3DTiles from "../Cesium3DTiles/Cesium3DTiles.svelte";
  import type { Cesium3DTileStyleSpec } from "../types.js";

  type TileFeature = import("cesium").Cesium3DTileFeature;
  type Color = import("cesium").Color;

  type Props = {
    visible?: boolean;
    opacity?: number;
    maximumScreenSpaceError?: number;
    /**
     * Per-feature tint by OSM id. Maps either:
     *  - `"123456" → "#ff4444"` (hex), or
     *  - `"123456" → ["#ff4444", 0.7]` (hex + alpha 0..1).
     * Buildings not present in the map are coloured by `defaultHex` / `defaultAlpha`.
     */
    featureColors?: Record<string, string | [string, number]>;
    /**
     * Colour applied to buildings that are not in `featureColors` when the
     * map is non-empty (i.e. when the consumer is highlighting a subset).
     * If `featureColors` is empty the default Cesium look is kept.
     */
    defaultHex?: string;
    defaultAlpha?: number;
    onclick?: (feature: TileFeature, osmId: string | null) => void;
    style?: Cesium3DTileStyleSpec | null;
  };

  let {
    visible = true,
    opacity = 1,
    maximumScreenSpaceError,
    featureColors = {},
    defaultHex = "#ffffff",
    defaultAlpha = 0.35,
    onclick,
    style = null,
  }: Props = $props();

  // Memoised lookup of the cesium Color module; the handler is hot so we
  // avoid `await import` per feature.
  let CesiumMod: typeof import("cesium") | null = null;

  // The per-feature handler is registered once against `tileVisible`; we
  // read props directly inside it so Svelte's prop reactivity keeps it
  // current across re-renders.
  let highlightMode = $derived(Object.keys(featureColors).length > 0);

  function readOsmId(f: TileFeature): string | null {
    for (const key of ["elementId", "osm:id", "id", "feature.elementId"]) {
      const value = (f as unknown as { getProperty: (k: string) => unknown }).getProperty(
        key,
      );
      if (value == null) continue;
      const s = String(value);
      const m = s.match(/(\d+)$/);
      if (m) return m[1];
    }
    return null;
  }

  function colorFor(osmId: string | null): [string, number] | null {
    if (!osmId) return null;
    const entry = featureColors[osmId];
    if (!entry) return null;
    return typeof entry === "string" ? [entry, 1] : entry;
  }

  async function onfeature(feature: TileFeature): Promise<void> {
    CesiumMod ??= await import("cesium");
    const osmId = readOsmId(feature);
    const tinted = colorFor(osmId);
    if (tinted) {
      const [hex, alpha] = tinted;
      (feature as unknown as { color: Color }).color =
        CesiumMod.Color.fromCssColorString(hex).withAlpha(alpha);
      return;
    }
    if (highlightMode) {
      (feature as unknown as { color: Color }).color =
        CesiumMod.Color.fromCssColorString(defaultHex).withAlpha(defaultAlpha);
    } else {
      (feature as unknown as { color: Color }).color = CesiumMod.Color.WHITE;
    }
  }

  function handleClick(feature: TileFeature): void {
    onclick?.(feature, readOsmId(feature));
  }
</script>

<Cesium3DTiles
  source={{ kind: "osm-buildings" }}
  {visible}
  {opacity}
  {maximumScreenSpaceError}
  {style}
  onfeature={(feature, tile) => {
    void tile;
    void onfeature(feature);
  }}
  onclick={onclick ? handleClick : undefined}
/>
