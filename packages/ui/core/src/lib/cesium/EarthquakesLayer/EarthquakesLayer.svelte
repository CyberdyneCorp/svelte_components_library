<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { quakeMark } from "../glyphs.js";
  import type { Earthquake, LabelMode, TrackedEntity } from "../types.js";

  type Props = {
    earthquakes: Earthquake[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    /** Filter by minimum magnitude before rendering. */
    minMagnitude?: number;
    /**
     * Which quakes show their magnitude label. Defaults to `"selected"`.
     * For conditional labelling (e.g. only M ≥ 4.5) use TrackedEntitiesLayer
     * directly with `labelMode="perEntity"` and set `label` per entity.
     */
    labelMode?: LabelMode;
    onclick?: (earthquake: Earthquake) => void;
  };

  let {
    earthquakes,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    minMagnitude = 0,
    labelMode,
    onclick,
  }: Props = $props();

  // Depth-coloured ramp: shallow = red, mid = orange, deep = blue.
  function depthColor(depthKm: number): string {
    if (depthKm < 70) return "#ff4444";
    if (depthKm < 300) return "#ffb800";
    return "#00d4ff";
  }

  // Magnitude → glyph size in pixels. Mw 2 → 14 px, Mw 8 → 48 px.
  function magnitudeSize(mag: number): number {
    return Math.max(12, Math.min(48, 8 + mag * 5));
  }

  const entities = $derived<TrackedEntity[]>(
    earthquakes
      .filter((q) => q.magnitude >= minMagnitude)
      .map((q) => {
        const color = depthColor(q.depthKm);
        return {
          id: q.id,
          lng: q.lng,
          lat: q.lat,
          icon: quakeMark(color),
          color,
          size: magnitudeSize(q.magnitude),
          label: `M${q.magnitude.toFixed(1)}`,
          meta: q,
        };
      }),
  );

  function handleClick(entity: TrackedEntity): void {
    const q = entity.meta as Earthquake | undefined;
    if (q) onclick?.(q);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  {labelMode}
  idPrefix="quake"
  onclick={onclick ? handleClick : undefined}
/>
