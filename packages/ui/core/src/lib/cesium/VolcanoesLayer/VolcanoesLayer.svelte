<svelte:options runes={true} />

<script lang="ts">
  import TrackedEntitiesLayer from "../TrackedEntitiesLayer/TrackedEntitiesLayer.svelte";
  import { volcanoCone } from "../glyphs.js";
  import type { TrackedEntity, Volcano } from "../types.js";

  type Props = {
    volcanoes: Volcano[];
    visible?: boolean;
    /** Uniform layer opacity 0–1. */
    opacity?: number;
    selectedId?: string | null;
    /** Filter to specific status values; pass null to include everything. */
    statusFilter?: string[] | null;
    onclick?: (volcano: Volcano) => void;
  };

  let {
    volcanoes,
    visible = true,
    opacity = 1,
    selectedId = $bindable(null),
    statusFilter = null,
    onclick,
  }: Props = $props();

  function statusColor(status: string | undefined): string {
    switch (status) {
      case "erupting":
        return "#ff4444";
      case "active":
        return "#ffb800";
      case "Holocene":
        return "#a855f7";
      default:
        return "#9ca3af";
    }
  }

  const entities = $derived<TrackedEntity[]>(
    volcanoes
      .filter((v) => !statusFilter || statusFilter.includes(v.status ?? ""))
      .map((v) => {
        const color = statusColor(v.status);
        return {
          id: v.id,
          lng: v.lng,
          lat: v.lat,
          altitudeM: v.elevationM,
          icon: volcanoCone(color),
          color,
          size: 26,
          label: v.name,
          meta: v,
        };
      }),
  );

  function handleClick(entity: TrackedEntity): void {
    const v = entity.meta as Volcano | undefined;
    if (v) onclick?.(v);
  }
</script>

<TrackedEntitiesLayer
  entities={entities}
  {opacity}
  {visible}
  bind:selectedId
  idPrefix="volcano"
  onclick={onclick ? handleClick : undefined}
/>
