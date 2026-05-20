<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { airplane } from "../glyphs.js";
  import type { Aircraft, TrackedEntity } from "../types.js";

  type Props = {
    aircraft: Aircraft[];
    visible?: boolean;
    selectedId?: string | null;
    /** Show the operator/callsign label even when not selected. */
    alwaysShowLabels?: boolean;
    /** Hex colour for the airplane glyph (per-aircraft `meta.color` wins). */
    color?: string;
    size?: number;
    onclick?: (aircraft: Aircraft) => void;
  };

  let {
    aircraft,
    visible = true,
    selectedId = $bindable(null),
    alwaysShowLabels = false,
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
  {visible}
  bind:selectedId
  rotateBillboards={true}
  {alwaysShowLabels}
  idPrefix="aircraft"
  defaultColor={color}
  defaultSize={size}
  onclick={onclick ? handleClick : undefined}
/>
