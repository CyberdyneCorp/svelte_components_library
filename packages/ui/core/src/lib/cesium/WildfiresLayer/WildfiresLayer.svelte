<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { flame } from "../glyphs.js";
  import type { TrackedEntity, Wildfire } from "../types.js";

  type Props = {
    wildfires: Wildfire[];
    visible?: boolean;
    selectedId?: string | null;
    /** Filter by minimum detection confidence (0..100). */
    minConfidence?: number;
    /** Filter by minimum brightness temperature in Kelvin. */
    minBrightnessK?: number;
    onclick?: (wildfire: Wildfire) => void;
  };

  let {
    wildfires,
    visible = true,
    selectedId = $bindable(null),
    minConfidence = 0,
    minBrightnessK = 0,
    onclick,
  }: Props = $props();

  // Brightness → orange→red ramp. Cooler fires lean orange, hot ones red.
  function brightnessColor(k: number | undefined): string {
    if (typeof k !== "number") return "#ff7a1a";
    if (k < 320) return "#ffb800";
    if (k < 360) return "#ff7a1a";
    return "#ff4444";
  }

  // FRP-driven sizing with a sensible default for missing data.
  function frpSize(frpMw: number | undefined): number {
    if (typeof frpMw !== "number") return 18;
    return Math.max(14, Math.min(38, 12 + Math.log10(frpMw + 1) * 10));
  }

  const entities = $derived<TrackedEntity[]>(
    wildfires
      .filter(
        (f) =>
          (f.confidencePct ?? 100) >= minConfidence &&
          (f.brightnessK ?? minBrightnessK) >= minBrightnessK,
      )
      .map((f) => {
        const color = brightnessColor(f.brightnessK);
        return {
          id: f.id,
          lng: f.lng,
          lat: f.lat,
          icon: flame(color),
          color,
          size: frpSize(f.frpMw),
          meta: f,
        };
      }),
  );

  function handleClick(entity: TrackedEntity): void {
    const f = entity.meta as Wildfire | undefined;
    if (f) onclick?.(f);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {visible}
  bind:selectedId
  idPrefix="fire"
  onclick={onclick ? handleClick : undefined}
/>
