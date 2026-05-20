<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { airplane } from "../glyphs.js";
  import type { Aircraft, LabelMode, TrackedEntity } from "../types.js";

  type Props = {
    aircraft: Aircraft[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    /** Deprecated alias for `labelMode` (`true` → `"all"`). Prefer `labelMode`. */
    alwaysShowLabels?: boolean;
    /** Which aircraft show their callsign label. Defaults to `"selected"`. */
    labelMode?: LabelMode;
    /** Hex colour for the airplane glyph (per-aircraft `meta.color` wins). */
    color?: string;
    size?: number;
    onclick?: (aircraft: Aircraft) => void;
  };

  let {
    aircraft,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    alwaysShowLabels = false,
    labelMode,
    color = "#00d4ff",
    size = 28,
    onclick,
  }: Props = $props();

  const entities = $derived<TrackedEntity[]>(
    aircraft.map((a) => ({
      id: a.id,
      lng: a.lng,
      lat: a.lat,
      altitudeM: a.altitudeM,
      headingDeg: a.headingDeg,
      icon: airplane((a.meta as { color?: string } | undefined)?.color ?? color),
      color,
      size,
      label: a.callsign ?? a.operator,
      trail: a.trail,
      trailColor: color,
      meta: a,
    })),
  );

  function handleClick(entity: TrackedEntity): void {
    const aircraftEntry = entity.meta as Aircraft | undefined;
    if (aircraftEntry) onclick?.(aircraftEntry);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  rotateBillboards={true}
  {alwaysShowLabels}
  {labelMode}
  idPrefix="aircraft"
  defaultColor={color}
  defaultSize={size}
  onclick={onclick ? handleClick : undefined}
/>
