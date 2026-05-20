<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { satellite as satelliteGlyph } from "../glyphs.js";
  import type { LabelMode, Satellite, TrackedEntity } from "../types.js";

  type Props = {
    /**
     * Pre-propagated satellite positions. The consumer is responsible for
     * the SGP4 propagation (e.g. via `satellite.js`) — this component just
     * renders. Update the array on each tick (recommended: 1 Hz).
     */
    satellites: Satellite[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    /** Deprecated alias for `labelMode` (`true` → `"all"`). Prefer `labelMode`. */
    alwaysShowLabels?: boolean;
    /** Which satellites show their name label. Defaults to `"selected"`. */
    labelMode?: LabelMode;
    /** Colour by constellation group. Falls back to `defaultColor`. */
    colorByGroup?: Partial<Record<string, string>>;
    defaultColor?: string;
    size?: number;
    onclick?: (satellite: Satellite) => void;
  };

  const DEFAULT_GROUP_COLORS: Record<string, string> = {
    starlink: "#a855f7",
    "gps-ops": "#00d4ff",
    galileo: "#ffb800",
    "glo-ops": "#ff4444",
    beidou: "#22c55e",
    iridium: "#f97316",
    stations: "#00ff41",
    weather: "#9ca3af",
  };

  let {
    satellites,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    alwaysShowLabels = false,
    labelMode,
    colorByGroup,
    defaultColor = "#00d4ff",
    size = 22,
    onclick,
  }: Props = $props();

  const entities = $derived<TrackedEntity[]>(
    satellites.map((s) => {
      const group = s.group ?? "other";
      const color =
        colorByGroup?.[group] ?? DEFAULT_GROUP_COLORS[group] ?? defaultColor;
      return {
        id: s.id,
        lng: s.lng,
        lat: s.lat,
        altitudeM: s.altitudeM,
        icon: satelliteGlyph(color),
        color,
        size,
        label: s.name ?? s.noradId,
        trail: s.trail,
        trailColor: color,
        meta: s,
      };
    }),
  );

  function handleClick(entity: TrackedEntity): void {
    const s = entity.meta as Satellite | undefined;
    if (s) onclick?.(s);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  {alwaysShowLabels}
  {labelMode}
  idPrefix="sat"
  defaultColor={defaultColor}
  defaultSize={size}
  onclick={onclick ? handleClick : undefined}
/>
