<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { ship } from "../glyphs.js";
  import type { TrackedEntity, Vessel } from "../types.js";

  type Props = {
    vessels: Vessel[];
    visible?: boolean;
    selectedId?: string | null;
    alwaysShowLabels?: boolean;
    /** Per-type colour override. Falls back to "cargo" hue. */
    colorByType?: Partial<Record<string, string>>;
    size?: number;
    onclick?: (vessel: Vessel) => void;
  };

  const DEFAULT_COLORS: Record<string, string> = {
    cargo: "#00d4ff",
    tanker: "#a855f7",
    passenger: "#00ff41",
    fishing: "#ffb800",
    other: "#9ca3af",
  };

  let {
    vessels,
    visible = true,
    selectedId = $bindable(null),
    alwaysShowLabels = false,
    colorByType,
    size = 26,
    onclick,
  }: Props = $props();

  const entities = $derived<TrackedEntity[]>(
    vessels.map((v) => {
      const type = v.vesselType ?? "other";
      const color =
        colorByType?.[type] ?? DEFAULT_COLORS[type] ?? DEFAULT_COLORS.other;
      return {
        id: v.id,
        lng: v.lng,
        lat: v.lat,
        headingDeg: v.headingDeg,
        icon: ship(color),
        color,
        size,
        label: v.name ?? v.mmsi,
        trail: v.trail,
        trailColor: color,
        meta: v,
      };
    }),
  );

  function handleClick(entity: TrackedEntity): void {
    const v = entity.meta as Vessel | undefined;
    if (v) onclick?.(v);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {visible}
  bind:selectedId
  rotateBillboards={true}
  {alwaysShowLabels}
  idPrefix="vessel"
  defaultSize={size}
  onclick={onclick ? handleClick : undefined}
/>
