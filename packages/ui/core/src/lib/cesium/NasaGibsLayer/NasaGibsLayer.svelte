<svelte:options runes={true} />

<script lang="ts">
  import ImageryLayer from "../ImageryLayer/ImageryLayer.svelte";
  import {
    type GibsProduct,
    gibsMaxLevel,
    gibsUrlTemplate,
    isNearRealtimeProduct,
    nearRealtimeTimestamp,
    defaultGibsCompositeDate,
  } from "../gibs.js";

  type Props = {
    /** GIBS product id (e.g. `MODIS_Terra_NDVI_8Day`). */
    product: GibsProduct;
    /**
     * Date for the imagery. Either:
     *  - `"live"` — auto-computed: for NRT products → 10-minute-rounded ISO,
     *    for daily composites → most-recent 8-day MODIS date.
     *  - `YYYY-MM-DD` — fixed composite date.
     *  - Full ISO timestamp — for sub-daily NRT products.
     */
    date?: "live" | string;
    visible?: boolean;
    /** Layer opacity 0..1. */
    alpha?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
    gamma?: number;
  };

  let {
    product,
    date = "live",
    visible = true,
    alpha = 1,
    brightness = 1,
    contrast = 1,
    saturation = 1,
    hue = 0,
    gamma = 1,
  }: Props = $props();

  const resolvedDate = $derived.by(() => {
    if (date !== "live") return date;
    return isNearRealtimeProduct(product)
      ? nearRealtimeTimestamp()
      : defaultGibsCompositeDate();
  });

  const provider = $derived({
    kind: "urlTemplate" as const,
    url: gibsUrlTemplate(product, resolvedDate),
    maxLevel: gibsMaxLevel(product),
    credit: "Imagery courtesy NASA EOSDIS GIBS",
  });
</script>

<ImageryLayer
  {provider}
  {visible}
  {alpha}
  {brightness}
  {contrast}
  {saturation}
  {hue}
  {gamma}
/>
