<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { ship } from "../glyphs.js";
  import type { LabelMode, TrackedEntity, Vessel } from "../types.js";

  type Props = {
    vessels: Vessel[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    /** Deprecated alias for `labelMode` (`true` → `"all"`). Prefer `labelMode`. */
    alwaysShowLabels?: boolean;
    /** Which vessels show their name label. Defaults to `"selected"`. */
    labelMode?: LabelMode;
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
    opacity = 1,
    selectedId = $bindable(null),
    alwaysShowLabels = false,
    labelMode,
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
  {opacity}
  {visible}
  bind:selectedId
  rotateBillboards={true}
  {alwaysShowLabels}
  {labelMode}
  idPrefix="vessel"
  defaultSize={size}
  onclick={onclick ? handleClick : undefined}
/>
